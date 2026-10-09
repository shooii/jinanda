import { useState, type CSSProperties } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey, usePersistentState, useLangPair } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import { useAppLanguage, useT } from "@/lib/i18n"
import { allLanguages, langOption, type LangId } from "@/lib/translate"
import {
  describeRecognitionError,
  prepareTranslation,
  speakText,
  stopSpeaking,
  translateText,
} from "@/lib/speech"
import { useLiveTranslate } from "@/lib/useLiveTranslate"

type Side = "me" | "them"
type ViewMode = "side" | "facing"

type Turn = {
  id: number
  who: Side
  original: string
  translated: string
}

/** 只保留真正生效的偏好：识别完成后自动朗读译文 */
type Prefs = {
  play: boolean
}

const defaultPrefs: Prefs = { play: false }

function SpeakCard({
  turn,
  playing,
  onPlay,
}: {
  turn: Turn
  playing: boolean
  onPlay: () => void
}) {
  return (
    <article className={`speak-card ${turn.who}`}>
      <div className="speak-card-text">
        <p className="speak-card-src">{turn.original}</p>
        <span className="speak-card-rule" />
        <p className="speak-card-dst">{turn.translated}</p>
      </div>
      <button
        className={`speak-play ${playing ? "playing" : ""}`}
        onClick={onPlay}
        aria-label={turn.translated}
      >
        <Icon name={playing ? "pause" : "play"} size={15} />
      </button>
    </article>
  )
}

function InputChip({
  side,
  label,
  placeholder,
  active,
  onActivate,
  onPick,
  onSend,
}: {
  side: Side
  label: string
  placeholder: string
  active: boolean
  onActivate: () => void
  onPick: () => void
  onSend: (text: string) => void
}) {
  const [value, setValue] = useState("")
  return (
    <div
      className={`speak-input ${side} ${active ? "active" : ""}`}
      onClick={onActivate}
    >
      <button className="speak-input-lang" onClick={onPick}>
        <span>{label}</span>
        <Icon name="chevron" size={13} />
      </button>
      <input
        className="speak-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            onSend(value.trim())
            setValue("")
          }
        }}
      />
    </div>
  )
}

function MicButton({
  label,
  icon,
  active,
  level = 0,
  onClick,
}: {
  label: string
  icon: IconName
  active: boolean
  /** 0–1 的真实麦克风音量，用于驱动拾音动效 */
  level?: number
  onClick: () => void
}) {
  return (
    <button
      className={`speak-mic ${active ? "active" : ""}`}
      style={{ "--mic-level": level.toFixed(3) } as CSSProperties}
      onClick={onClick}
      aria-label={label}
    >
      <span className="speak-mic-dot">
        <i className="speak-mic-pulse" />
        <Icon name={icon} size={23} />
      </span>
      <small>{label}</small>
    </button>
  )
}

export function SpeakerTalk({
  onClose,
  onNavigate,
}: {
  onClose: () => void
  onNavigate?: (feature: FeatureId) => void
}) {
  const t = useT()
  const [uiLang] = useAppLanguage()
  const [view, setView] = usePersistentState<ViewMode>("lingo.speak-view", "side")
  const { me: meLang, them: themLang, setMe: setMeLang, setThem: setThemLang } =
    useLangPair()
  const [topSlot, setTopSlot] = usePersistentState<Side>("lingo.speak-top", "them")
  const [activeSide, setActiveSide] = usePersistentState<Side>(
    "lingo.speak-active",
    "me",
  )
  const [prefs, setPrefs] = usePersistentState<Prefs>("lingo.speak-prefs", defaultPrefs)
  const [turns, setTurns] = usePersistentState<Turn[]>("lingo.speak-turns", [])
  const [menu, setMenu] = useState<"more" | null>(null)
  const [sheet, setSheet] = useState<null | "lang" | Side>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  /** 上一轮实际使用的翻译引擎，用于如实提示是否退回了本地词典 */
  const [lastEngine, setLastEngine] = useState<"neural" | "dictionary" | null>(null)

  /**
   * 真实链路：麦克风采集 → 流式识别 → 翻译 → 朗读。
   * 说完一句就落一条双语对话，按偏好自动朗读译文。
   */
  const live = useLiveTranslate({
    meLang,
    themLang,
    autoSpeak: prefs.play,
    mode: "pick",
    onTurn: (turn) => {
      setLastEngine(turn.engine)
      setTurns((prev) => [...prev, turn])
    },
  })
  const listening = live.activeSide

  const statusText = live.error
    ? describeRecognitionError(live.error, live.errorCode)
    : live.status === "preparing"
      ? "正在准备识别与翻译模型…"
      : live.status === "translating"
        ? "正在翻译…"
        : live.status === "listening"
          ? "正在聆听，说完会自动翻译"
          : lastEngine === "dictionary"
            ? "端侧翻译模型未就绪，上一句使用了本地词典"
            : prefs.play
              ? "点按麦克风开始说话 · 自动朗读已开启"
              : "点按麦克风开始说话"

  useEscapeKey(() => {
    if (sheet) setSheet(null)
    else if (menu) setMenu(null)
    else onClose()
  })

  const langOf = (side: Side) => (side === "me" ? meLang : themLang)
  const shortName = (id: LangId) =>
    uiLang === "zh" ? langOption(id).short : langOption(id).native
  const fullName = (id: LangId) =>
    uiLang === "zh" ? langOption(id).label : langOption(id).native

  const setLangOf = (side: Side, lang: LangId) => {
    if (side === "me") setMeLang(lang)
    else setThemLang(lang)
    setSheet(null)
  }

  const pushText = (side: Side, text: string) => {
    const from = langOf(side)
    const to = side === "me" ? themLang : meLang
    setActiveSide(side)
    // 手输内容同样走真实翻译引擎
    void prepareTranslation(from, to)
    void (async () => {
      const result =
        from === to
          ? { text, engine: "dictionary" as const }
          : await translateText(text, from, to)
      setTurns((prev) => [
        ...prev,
        {
          id: Date.now(),
          who: side,
          original: text,
          translated: result.text,
          engine: result.engine,
        },
      ])
      if (prefs.play) speakText(result.text, to)
    })()
  }

  const playTurn = (id: number) => {
    const turn = turns.find((item) => item.id === id)
    if (!turn) return
    if (playingId === id) {
      stopSpeaking()
      setPlayingId(null)
      return
    }
    const target = turn.who === "me" ? themLang : meLang
    const handle = speakText(turn.translated, target, () => setPlayingId(null))
    if (!handle) {
      toast("当前设备不支持朗读")
      return
    }
    setPlayingId(id)
  }

  const togglePref = (key: keyof Prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const clearTurns = () => {
    setTurns([])
    setMenu(null)
    toast(t("speak.cleared"))
  }

  const startListening = (side: Side) => {
    setActiveSide(side)
    // 再点同一侧＝停止；点另一侧＝切过去继续说
    if (listening === side) {
      live.stop()
      return
    }
    if (live.status !== "idle") live.stop()
    live.start(side)
  }

  // side 视图展示完整对话；面对面视图按 half 只展示朝向自己那一侧的话，
// 避免同一条内容在上下两块屏里各出现一次。
const canvasFor = (side: Side | null) => {
    const visible = side ? turns.filter((turn) => turn.who === side) : turns
    // 正在拾音的那一侧才显示实时字幕
    const interim =
      live.interim && (side === null || side === live.activeSide) ? live.interim : ""
    return (
      <div className="speak-canvas">
        {visible.length === 0 && !interim ? (
          <p className="speak-empty">点按下方按钮，开始双语对话</p>
        ) : (
          <>
            {visible.map((turn) => (
              <SpeakCard
                key={turn.id}
                turn={turn}
                playing={playingId === turn.id}
                onPlay={() => playTurn(turn.id)}
              />
            ))}
            {interim ? (
              <article className={`speak-card live ${live.activeSide ?? "me"}`}>
                <div className="speak-card-text">
                  <p className="speak-card-src">{interim}</p>
                  <span className="speak-card-rule" />
                  <p className="speak-card-dst pending">正在翻译…</p>
                </div>
              </article>
            ) : null}
          </>
        )}
      </div>
    )
  }

  const chipFor = (side: Side) => (
    <InputChip
      side={side}
      label={fullName(langOf(side))}
      placeholder={t("speak.enterText")}
      active={activeSide === side}
      onActivate={() => setActiveSide(side)}
      onPick={() => setSheet(side)}
      onSend={(text) => pushText(side, text)}
    />
  )

  const pane = (side: Side) => (
    <section className={`speak-pane ${side}`}>
      {canvasFor(side)}
      <div className="speak-inputs single">{chipFor(side)}</div>
      <div className="speak-mics">
        <MicButton
          icon={listening === side ? "pause" : "mic"}
          active={listening === side}
          level={listening === side ? live.level : 0}
          label={shortName(langOf(side))}
          onClick={() => startListening(side)}
        />
      </div>
    </section>
  )

  // 单一「更多」菜单：视图切换 + 语言 + 朗读开关 + 清空
  const morePopover = (
    <div className="speak-popover speak-pop-more">
      <button
        className={view === "side" ? "active" : ""}
        onClick={() => {
          setView("side")
          setMenu(null)
        }}
      >
        <span className="speak-pop-mark">
          {view === "side" ? <Icon name="check" size={16} /> : null}
        </span>
        <Icon name="layout" size={19} />
        <span className="speak-pop-label">{t("speak.side")}</span>
      </button>
      <button
        className={view === "facing" ? "active" : ""}
        onClick={() => {
          setView("facing")
          setMenu(null)
        }}
      >
        <span className="speak-pop-mark">
          {view === "facing" ? <Icon name="check" size={16} /> : null}
        </span>
        <Icon name="phone" size={19} />
        <span className="speak-pop-label">{t("speak.facing")}</span>
      </button>
      <hr />
      <button
        onClick={() => {
          setMenu(null)
          setSheet("lang")
        }}
      >
        <span className="speak-pop-mark" />
        <Icon name="settings" size={19} />
        <span className="speak-pop-label">{t("speak.language")}</span>
      </button>
      <button
        className={prefs.play ? "active" : ""}
        onClick={() => togglePref("play")}
      >
        <span className="speak-pop-mark">
          {prefs.play ? <Icon name="check" size={16} /> : null}
        </span>
        <Icon name="play" size={19} />
        <span className="speak-pop-label">{t("speak.playTranslation")}</span>
      </button>
      {turns.length > 0 ? (
        <>
          <hr />
          <button className="danger" onClick={clearTurns}>
            <span className="speak-pop-mark" />
            <Icon name="close" size={19} />
            <span className="speak-pop-label">{t("speak.clear")}</span>
          </button>
        </>
      ) : null}
    </div>
  )

  const tabs: { id: FeatureId; label: string; icon: IconName }[] = [
    { id: "text", label: t("speak.tabTranslate"), icon: "translate" },
    { id: "camera", label: t("speak.tabCamera"), icon: "camera" },
    { id: "dialogue", label: t("speak.tabConversation"), icon: "users" },
  ]

  return (
    <div className={`speak-page ${view === "facing" ? "is-facing" : ""}`}>
      {menu ? <div className="speak-scrim" onClick={() => setMenu(null)} /> : null}

      <div className="speak-topzone">
        <header className="speak-bar">
          <AppButton
            ariaLabel={t("speak.back")}
            className="speak-bar-back"
            onClick={onClose}
          >
            <Icon name="chevron" size={18} />
          </AppButton>
          <strong className="speak-bar-title">{t("speak.title")}</strong>
          <AppButton
            ariaLabel={t("speak.more")}
            className={`speak-bar-more ${menu === "more" ? "open" : ""}`}
            onClick={() => setMenu(menu === "more" ? null : "more")}
          >
            <Icon name="more" size={18} />
          </AppButton>
        </header>
        <p className="session-status" role="status">{statusText}</p>
        {menu === "more" ? morePopover : null}
      </div>

      {view === "side" ? (
        <>
          <main className="speak-body">
            {canvasFor(null)}
            <div className="speak-inputs">
              {chipFor("them")}
              {chipFor("me")}
            </div>
            <div className="speak-mics">
              <MicButton
                icon={listening === "me" ? "pause" : "mic"}
                active={listening === "me"}
                level={listening === "me" ? live.level : 0}
                label={shortName(meLang)}
                onClick={() => startListening("me")}
              />
              <MicButton
                icon={listening === "them" ? "pause" : "headphones"}
                active={listening === "them"}
                level={listening === "them" ? live.level : 0}
                label={shortName(themLang)}
                onClick={() => startListening("them")}
              />
            </div>
          </main>
          <nav className="speak-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={tab.id === "dialogue" ? "active" : ""}
                onClick={() => {
                  if (tab.id !== "dialogue") onNavigate?.(tab.id)
                }}
              >
                <Icon name={tab.icon} size={19} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </>
      ) : (
        <main className="speak-face">
          <div className={`speak-half ${topSlot === "them" ? "flipped" : ""}`}>
            {pane(topSlot)}
          </div>
          <AppButton
            ariaLabel={t("speak.swapSides")}
            className="speak-divider"
            onClick={() => setTopSlot(topSlot === "them" ? "me" : "them")}
          >
            <Icon name="swap" size={17} />
          </AppButton>
          <div className="speak-half">
            {pane(topSlot === "them" ? "me" : "them")}
          </div>
        </main>
      )}

      {sheet === "lang" ? (
        <div className="call-picker-backdrop" onClick={() => setSheet(null)}>
          <div
            className="call-picker-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("speak.language")}
          >
            <header>
              <h2>{t("speak.language")}</h2>
            </header>
            <div className="speak-lang-rows">
              <button onClick={() => setSheet("me")}>
                <span className="speak-lang-dot me" />
                <span className="speak-lang-copy">
                  <small>{t("speak.me")}</small>
                  <strong>{fullName(meLang)}</strong>
                </span>
                <Icon name="chevron" size={16} />
              </button>
              <button onClick={() => setSheet("them")}>
                <span className="speak-lang-dot them" />
                <span className="speak-lang-copy">
                  <small>{t("speak.them")}</small>
                  <strong>{fullName(themLang)}</strong>
                </span>
                <Icon name="chevron" size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sheet === "me" || sheet === "them" ? (
        <div className="call-picker-backdrop" onClick={() => setSheet(null)}>
          <div
            className="call-picker-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("speak.pickLanguage")}
          >
            <header>
              <h2>
                {sheet === "me" ? t("speak.me") : t("speak.them")} ·{" "}
                {t("speak.pickLanguage")}
              </h2>
            </header>
            <div className="call-picker-list">
              {allLanguages.map((option) => (
                <button
                  key={option.id}
                  className={langOf(sheet) === option.id ? "selected" : ""}
                  onClick={() => setLangOf(sheet, option.id)}
                >
                  <Icon name="globe" size={18} />
                  <span className="speak-lang-copy">
                    <strong>{option.native}</strong>
                    <small>{option.label}</small>
                  </span>
                  {langOf(sheet) === option.id ? (
                    <Icon name="check" size={17} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SpeakerTalk
