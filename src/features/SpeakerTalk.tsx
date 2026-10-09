import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey, usePersistentState, useLangPair } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import { useAppLanguage, useT } from "@/lib/i18n"
import {
  allLanguages,
  langOption,
  sentences,
  translatePhrase,
  type LangId,
} from "@/lib/translate"

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

/** 演示对话：取句级词典下标（20 语同序），保证任何语言对都能得到准确译文 */
const ME_LINES = [0, 7, 2]
const THEM_LINES = [9, 5, 12]

const defaultPrefs: Prefs = { play: true }

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
  onClick,
}: {
  label: string
  icon: IconName
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`speak-mic ${active ? "active" : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className="speak-mic-dot">
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
  const [listening, setListening] = useState<Side | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const cursors = useRef<Record<Side, number>>({ me: 0, them: 0 })
  const playTimer = useRef<number | null>(null)

  useEscapeKey(() => {
    if (sheet) setSheet(null)
    else if (menu) setMenu(null)
    else onClose()
  })

  useEffect(() => {
    return () => {
      if (playTimer.current) window.clearTimeout(playTimer.current)
    }
  }, [])

  // 点按麦克风：模拟一次识别 → 追加一条双语对话
  useEffect(() => {
    if (!listening) return
    const side = listening
    const handle = window.setTimeout(() => {
      const queue = side === "me" ? ME_LINES : THEM_LINES
      const index = queue[cursors.current[side] % queue.length]
      cursors.current[side] += 1
      const from = side === "me" ? meLang : themLang
      const to = side === "me" ? themLang : meLang
      const list = sentences[from] ?? sentences.zh
      const original = list[index] ?? list[0]
      const translated =
        from === to ? original : translatePhrase(original, from, to).text
      const id = Date.now()
      setTurns((prev) => [...prev, { id, who: side, original, translated }])
      setListening(null)
      if (prefs.play) {
        setPlayingId(id)
        if (playTimer.current) window.clearTimeout(playTimer.current)
        playTimer.current = window.setTimeout(() => setPlayingId(null), 2400)
      }
    }, 1700)
    return () => window.clearTimeout(handle)
  }, [listening, meLang, themLang, prefs.play, setTurns])

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
    const translated =
      from === to ? text : translatePhrase(text, from, to).text
    setTurns((prev) => [
      ...prev,
      { id: Date.now(), who: side, original: text, translated },
    ])
  }

  const playTurn = (id: number) => {
    setPlayingId((current) => (current === id ? null : id))
    if (playTimer.current) window.clearTimeout(playTimer.current)
    playTimer.current = window.setTimeout(() => setPlayingId(null), 2400)
  }

  const togglePref = (key: keyof Prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const clearTurns = () => {
    setTurns([])
    cursors.current = { me: 0, them: 0 }
    setMenu(null)
    toast(t("speak.cleared"))
  }

  const startListening = (side: Side) => {
    setActiveSide(side)
    if (listening) return
    setListening(side)
  }

  // side 视图展示完整对话；面对面视图按 half 只展示朝向自己那一侧的话，
// 避免同一条内容在上下两块屏里各出现一次。
const canvasFor = (side: Side | null) => {
    const visible = side ? turns.filter((turn) => turn.who === side) : turns
    return (
      <div className="speak-canvas">
        {visible.length === 0 ? (
          <p className="speak-empty">{t("speak.hint")}</p>
        ) : (
          visible.map((turn) => (
            <SpeakCard
              key={turn.id}
              turn={turn}
              playing={playingId === turn.id}
              onPlay={() => playTurn(turn.id)}
            />
          ))
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
        <p className="session-truth" role="status">交互演示 · {listening ? "正在生成示例译文" : "选择一侧麦克风开始"} · 声音输出：手机</p>
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
                label={shortName(meLang)}
                onClick={() => startListening("me")}
              />
              <MicButton
                icon={listening === "them" ? "pause" : "headphones"}
                active={listening === "them"}
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
