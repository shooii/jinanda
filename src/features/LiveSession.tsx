import { useEffect, useRef, useState, type ReactNode } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey, usePersistentState } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import { useAppLanguage, useT } from "@/lib/i18n"
import {
  allLanguages,
  detectLang,
  applyTone,
  detectGlossary,
  sentences,
  translatePhrase,
  langOption,
  type LangId,
  type ToneId,
} from "@/lib/translate"
import { useVocabulary } from "@/lib/store"
import { SpeakerTalk } from "@/features/SpeakerTalk"

type ShareTurn = {
  id: number
  who: "me" | "them"
  original: string
  translated: string
}

/** 一人一只耳机 · 演示对话：取句级词典下标（20 语同序），任何语言对都能得到准确译文 */
const SHARE_ME_LINES = [0, 7, 2]
const SHARE_THEM_LINES = [9, 5, 12]

type Shared = {
  t: (k: string) => string
  isListening: boolean
  onToggleListen: () => void
  noSave: boolean
  offline: boolean
  lockScreen: boolean
  autoDetect: boolean
  contextOn: boolean
  tone: ToneId
  onToggleOffline: () => void
  onToggleNoSave: () => void
  onToggleLockScreen: () => void
  onToggleAutoDetect: () => void
  onToggleContext: () => void
  onSetTone: (tone: ToneId) => void
  onOpenSettings: () => void
}

function SessionHeader({
  t,
  isListening,
  offline,
  autoDetect,
  onClose,
  onOpenSettings,
  center,
}: {
  t: (k: string) => string
  isListening: boolean
  offline: boolean
  autoDetect: boolean
  onClose: () => void
  onOpenSettings: () => void
  center?: ReactNode
}) {
  return (
    <header className="live-header">
      <AppButton
        ariaLabel="关闭对话翻译"
        className="icon-button"
        onClick={onClose}
      >
        <Icon name="close" />
      </AppButton>
      {center ?? (
        <div>
          <strong>{t("session.title")}</strong>
          <span className="live-status">
            <i /> {offline ? t("session.offline") : isListening ? t("session.listening") : t("session.paused")}
          </span>
        </div>
      )}
      <AppButton
        ariaLabel="对话设置"
        className={`icon-button ${autoDetect ? "active" : ""}`}
        onClick={onOpenSettings}
      >
        <Icon name="settings" />
      </AppButton>
    </header>
  )
}

function SessionSettings({
  t,
  shared,
  showSoundOut,
  vocab,
}: {
  t: (k: string) => string
  shared: Shared
  showSoundOut: boolean
  vocab: { term: string }[]
}) {
  const [route, setRoute] = usePersistentState<"ear" | "phone">(
    "lingo.session-route",
    "ear",
  )
  const [testInput, setTestInput] = useState("")
  const [testResult, setTestResult] = useState<{
    detected: LangId
    translated: string
    terms: string[]
    toneText: string
  } | null>(null)

  const runTest = () => {
    const text = testInput.trim()
    if (!text) return
    const detected = detectLang(text)
    const target: LangId = detected === "zh" ? "en" : "zh"
    const base = translatePhrase(text, detected, target).text
    const toneText = applyTone(base, target, shared.tone)
    const hits = detectGlossary(text, vocab)
    setTestResult({
      detected,
      translated: toneText,
      terms: hits.map((h) => h.term),
      toneText,
    })
  }

  return (
    <div
      className="live-settings-backdrop"
      onClick={() => shared.onOpenSettings()}
    >
      <div
        className="live-settings-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="对话设置"
      >
        <div className="sheet-handle" />
        <header>
          <h2>{t("session.soundOut")}</h2>
          <AppButton onClick={shared.onOpenSettings}>
            <Icon name="close" />
          </AppButton>
        </header>
        {showSoundOut ? (
          <section>
            <span className="sheet-label">{t("session.soundOut")}</span>
            <div className="route-options">
              <AppButton
                className={route === "ear" ? "active" : ""}
                onClick={() => setRoute("ear")}
              >
                <Icon name="headphones" />
                <span>
                  <strong>{t("dialogue.modeHybrid")}</strong>
                  <small>我听耳机，对方听手机</small>
                </span>
                {route === "ear" && <Icon name="check" />}
              </AppButton>
              <AppButton
                className={route === "phone" ? "active" : ""}
                onClick={() => setRoute("phone")}
              >
                <Icon name="audio" />
                <span>
                  <strong>{t("session.phoneRoute")}</strong>
                  <small>双方都使用手机</small>
                </span>
                {route === "phone" && <Icon name="check" />}
              </AppButton>
            </div>
          </section>
        ) : null}

        <section className="session-preferences">
          <AppButton onClick={shared.onToggleAutoDetect}>
            <span>
              <strong>自动检测语言</strong>
              <small>根据说话内容自动识别我与对方语种</small>
            </span>
            <i className={shared.autoDetect ? "toggle-on" : ""}>
              <b />
            </i>
          </AppButton>
          <AppButton onClick={shared.onToggleContext}>
            <span>
              <strong>{t("context.title")}</strong>
              <small>{t("context.tip")}</small>
            </span>
            <i className={shared.contextOn ? "toggle-on" : ""}>
              <b />
            </i>
          </AppButton>
          <AppButton onClick={shared.onToggleNoSave}>
            <span>
              <strong>{t("session.noSave")}</strong>
              <small>{t("session.saved")}</small>
            </span>
            <i className={shared.noSave ? "toggle-on" : ""}>
              <b />
            </i>
          </AppButton>
          <AppButton onClick={shared.onToggleOffline}>
            <span>
              <strong>{t("session.offlinePref")}</strong>
              <small>{t("session.offlineDetail")}</small>
            </span>
            <i className={shared.offline ? "toggle-on" : ""}>
              <b />
            </i>
          </AppButton>
          <AppButton onClick={shared.onToggleLockScreen}>
            <span>
              <strong>{t("session.lockScreen")}</strong>
              <small>{t("session.lockScreenDetail")}</small>
            </span>
            <i className={shared.lockScreen ? "toggle-on" : ""}>
              <b />
            </i>
          </AppButton>
        </section>

        <section className="session-tone">
          <span className="sheet-label">{t("tone.title")}</span>
          <div className="tone-options">
            {(["neutral", "formal", "casual"] as ToneId[]).map((id) => (
              <AppButton
                key={id}
                className={shared.tone === id ? "active" : ""}
                onClick={() => shared.onSetTone(id)}
              >
                {id === "neutral"
                  ? t("tone.neutral")
                  : id === "formal"
                    ? t("tone.formal")
                    : t("tone.casual")}
              </AppButton>
            ))}
          </div>
        </section>

        <section className="session-translate-test">
          <span className="sheet-label">翻译试验</span>
          <div className="tt-row">
            <input
              className="tt-input"
              placeholder="输入一句试试，如：去 Shibuya 怎么走"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
            />
            <AppButton className="tt-go" onClick={runTest}>
              <Icon name="translate" size={16} />
            </AppButton>
          </div>
          {testResult && (
            <div className="tt-result">
              <div className="tt-result-head">
                <span className="tt-detect">
                  检测：{langOption(testResult.detected).native}
                </span>
                {testResult.terms.length > 0 && (
                  <span className="tt-terms">
                    术语：{testResult.terms.join("、")}
                  </span>
                )}
              </div>
              <p className="tt-translated">{testResult.translated}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/**
 * 面对面翻译：参考苹果翻译的深色对话流（一人一只耳机 / 耳机+手机 共用）。
 * 顶栏是「设备 + 语言对 + 交换」，中间是双语对话气泡，底部是语气胶囊 + 大按钮。
 */
function TalkFlow({
  t,
  shared,
  turns,
  playingId,
  live,
  onToggle,
  onPlay,
  onOpenTone,
}: {
  t: (k: string) => string
  shared: Shared
  turns: ShareTurn[]
  playingId: number | null
  live: boolean
  onToggle: () => void
  onPlay: (id: number) => void
  onOpenTone: () => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns.length])

  const toneLabel =
    shared.tone === "formal"
      ? t("tone.formal")
      : shared.tone === "casual"
        ? t("tone.casual")
        : t("tone.neutral")

  return (
    <main className="share-stage">
      <div className="share-canvas" ref={canvasRef}>
        {turns.length === 0 ? (
          <p className="share-empty">
            <Icon name="headphones" size={22} />
            {t("speak.tapToSpeak")}
          </p>
        ) : (
          turns.map((turn) => (
            <article key={turn.id} className={`share-bubble ${turn.who}`}>
              <div className="share-bubble-text">
                <p className="share-bubble-src">{turn.original}</p>
                <p className="share-bubble-dst">{turn.translated}</p>
              </div>
              <button
                className={`share-bubble-play ${playingId === turn.id ? "playing" : ""}`}
                onClick={() => onPlay(turn.id)}
                aria-label={turn.translated}
              >
                <Icon name={playingId === turn.id ? "pause" : "play"} size={13} />
              </button>
            </article>
          ))
        )}
      </div>

      <div className="share-actions">
        <button className="share-mode-chip" onClick={onOpenTone}>
          <Icon name="translate" size={16} />
          <span>{toneLabel}</span>
          <Icon name="chevron" size={14} />
        </button>
        <button
          className={`share-record ${live ? "live" : ""}`}
          onClick={onToggle}
          aria-label={live ? t("session.paused") : t("speak.tapToSpeak")}
        >
          <span className="share-record-inner">
            {live ? (
              <span className="share-record-square" />
            ) : (
              <Icon name="mic" size={25} />
            )}
          </span>
        </button>
        <span className="share-actions-tail" />
      </div>
    </main>
  )
}

export function LiveSession({
  onClose,
  onFeature,
}: {
  onClose: () => void
  onFeature?: (feature: FeatureId) => void
}) {
  const t = useT()
  const [uiLang] = useAppLanguage()
  const [mode] = usePersistentState<"share" | "hybrid" | "speaker">(
    "lingo.dialogue-mode",
    "share",
  )
  const [isListening, setIsListening] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [noSave, setNoSave] = useState(true)
  const [offline, setOffline] = useState(false)
  const [lockScreen, setLockScreen] = useState(true)
  const [autoDetect, setAutoDetect] = useState(false)
  const [contextOn, setContextOn] = useState(true)
  const [tone, setTone] = useState<ToneId>("neutral")
  const isShare = mode === "share"
  const isHybrid = mode === "hybrid"
  const isConversation = isShare || isHybrid
  // 两种模式各留一份语言对 / 对话流（互不串味）
  const convKey = isHybrid ? "lingo.hybrid" : "lingo.share"
  // 面对面翻译（一人一只耳机 / 耳机+手机）：语言对 / 对话流 / 拾音状态 / 语言·语气面板
  const [pair, setPair] = usePersistentState<{ me: LangId; them: LangId }>(
    `${convKey}-pair`,
    { me: "zh", them: "en" },
  )
  const [shareTurns, setShareTurns] = usePersistentState<ShareTurn[]>(
    `${convKey}-turns`,
    [],
  )
  const [shareLive, setShareLive] = useState(false)
  const [sharePlayingId, setSharePlayingId] = useState<number | null>(null)
  const [shareSheet, setShareSheet] = useState<null | "me" | "them" | "tone">(
    null,
  )
  const shareCursor = useRef<{ me: number; them: number }>({ me: 0, them: 0 })
  const shareNext = useRef<"me" | "them">("them")
  const shareTimer = useRef<number | null>(null)
  const { entries: vocab } = useVocabulary()

  useEscapeKey(() => {
    if (shareSheet) setShareSheet(null)
    else if (showSettings) setShowSettings(false)
  })

  useEffect(() => {
    return () => {
      if (shareTimer.current) window.clearTimeout(shareTimer.current)
    }
  }, [])

  // 面对面翻译：开启拾音后按「对方 → 我 → 对方…」流式追加双语气泡
  useEffect(() => {
    if (!isConversation || !shareLive) return
    const tick = () => {
      const side = shareNext.current
      shareNext.current = side === "them" ? "me" : "them"
      const from = side === "me" ? pair.me : pair.them
      const to = side === "me" ? pair.them : pair.me
      const queue = side === "me" ? SHARE_ME_LINES : SHARE_THEM_LINES
      const index = queue[shareCursor.current[side] % queue.length]
      shareCursor.current[side] += 1
      const list = sentences[from] ?? sentences.zh
      const original = list[index] ?? list[0]
      const translated =
        from === to ? original : translatePhrase(original, from, to).text
      const id = Date.now()
      setShareTurns((prev) => [...prev, { id, who: side, original, translated }])
      setSharePlayingId(id)
      if (shareTimer.current) window.clearTimeout(shareTimer.current)
      shareTimer.current = window.setTimeout(() => setSharePlayingId(null), 2400)
    }
    tick()
    const handle = window.setInterval(tick, 2900)
    return () => window.clearInterval(handle)
  }, [isConversation, shareLive, pair.me, pair.them, setShareTurns])

  const fullName = (id: LangId) =>
    uiLang === "zh" ? langOption(id).label : langOption(id).native

  const swapPair = () => {
    setPair({ me: pair.them, them: pair.me })
    shareCursor.current = { me: 0, them: 0 }
  }

  // 手机免提对话：整屏交给苹果翻译风格的对话界面（自带顶栏 / 底栏）
  if (mode === "speaker") {
    return <SpeakerTalk onClose={onClose} onNavigate={onFeature} />
  }

  const shared: Shared = {
    t,
    isListening,
    onToggleListen: () => setIsListening((value) => !value),
    noSave,
    offline,
    lockScreen,
    autoDetect,
    contextOn,
    tone,
    onToggleOffline: () => setOffline((value) => !value),
    onToggleNoSave: () => setNoSave((value) => !value),
    onToggleLockScreen: () => setLockScreen((value) => !value),
    onToggleAutoDetect: () => setAutoDetect((value) => !value),
    onToggleContext: () => setContextOn((value) => !value),
    onSetTone: setTone,
    onOpenSettings: () => setShowSettings(false),
  }

  const vocabTerms = vocab.map((v) => ({ term: v.term, note: v.note }))

  // 顶栏中央：设备 + 语言对 + 交换（左侧＝对方，右侧＝我）
  // 一人一只耳机：两侧都是耳机；耳机+手机：对方听手机，我听耳机
  const themDevice = isHybrid ? "phone" : "headphones"
  const pairBar = (
    <div className="share-pair">
      <button className="share-pair-lang" onClick={() => setShareSheet("them")}>
        <Icon name={themDevice} size={15} />
        <span>{fullName(pair.them)}</span>
      </button>
      <button
        className="share-pair-swap"
        aria-label={t("dialogue.modeShare")}
        onClick={swapPair}
      >
        <Icon name="swap" size={16} />
      </button>
      <button className="share-pair-lang" onClick={() => setShareSheet("me")}>
        <span>{fullName(pair.me)}</span>
        <Icon name="headphones" size={15} />
      </button>
    </div>
  )

  return (
    <div className={`live-session ${isConversation ? "is-share" : ""}`}>
      <SessionHeader
        t={t}
        isListening={isConversation ? shareLive : isListening}
        offline={offline}
        autoDetect={autoDetect}
        onClose={onClose}
        onOpenSettings={() => setShowSettings(true)}
        center={isConversation ? pairBar : undefined}
      />

      {isConversation ? (
        <TalkFlow
          t={t}
          shared={shared}
          turns={shareTurns}
          playingId={sharePlayingId}
          live={shareLive}
          onToggle={() => setShareLive((value) => !value)}
          onPlay={(id) => {
            setSharePlayingId((current) => (current === id ? null : id))
            if (shareTimer.current) window.clearTimeout(shareTimer.current)
            shareTimer.current = window.setTimeout(
              () => setSharePlayingId(null),
              2400,
            )
          }}
          onOpenTone={() => setShareSheet("tone")}
        />
      ) : null}

      {!isConversation && (
        <footer className="smart-live-controls">
          <div className="session-note">
            <Icon name="check" size={15} />
            <span>{noSave ? t("session.noSave") : t("session.saved")}</span>
          </div>
          <div className="smart-control-row">
            <AppButton ariaLabel={t("session.soundOut")} onClick={() => setShowSettings(true)}>
              <Icon name="headphones" />
              <small>{t("session.soundOut")}</small>
            </AppButton>
            <AppButton
              ariaLabel={isListening ? t("session.paused") : t("session.listening")}
              className={`smart-mic ${isListening ? "active" : ""}`}
              onClick={() => setIsListening((value) => !value)}
            >
              <Icon name={isListening ? "pause" : "mic"} size={27} />
            </AppButton>
            <AppButton
              ariaLabel={t("session.yourTurn")}
              onClick={() => setIsListening((value) => !value)}
            >
              <Icon name="swap" />
              <small>{t("session.yourTurn")}</small>
            </AppButton>
          </div>
        </footer>
      )}

      {showSettings && (
        <SessionSettings
          t={t}
          shared={shared}
          showSoundOut={mode === "hybrid"}
          vocab={vocabTerms}
        />
      )}

      {shareSheet === "tone" && (
        <div className="call-picker-backdrop" onClick={() => setShareSheet(null)}>
          <div
            className="call-picker-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("tone.title")}
          >
            <header>
              <h2>{t("tone.title")}</h2>
            </header>
            <div className="call-picker-list">
              {(["neutral", "formal", "casual"] as ToneId[]).map((id) => (
                <button
                  key={id}
                  className={tone === id ? "selected" : ""}
                  onClick={() => {
                    setTone(id)
                    setShareSheet(null)
                  }}
                >
                  <Icon name="sparkles" size={18} />
                  <span className="speak-lang-copy">
                    <strong>
                      {id === "neutral"
                        ? t("tone.neutral")
                        : id === "formal"
                          ? t("tone.formal")
                          : t("tone.casual")}
                    </strong>
                  </span>
                  {tone === id ? <Icon name="check" size={17} /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(shareSheet === "me" || shareSheet === "them") && (
        <div className="call-picker-backdrop" onClick={() => setShareSheet(null)}>
          <div
            className="call-picker-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("speak.pickLanguage")}
          >
            <header>
              <h2>
                {shareSheet === "me" ? fullName(pair.me) : fullName(pair.them)} ·{" "}
                {t("speak.pickLanguage")}
              </h2>
            </header>
            <div className="call-picker-list">
              {allLanguages.map((option) => {
                const selected =
                  shareSheet === "me"
                    ? pair.me === option.id
                    : pair.them === option.id
                return (
                  <button
                    key={option.id}
                    className={selected ? "selected" : ""}
                    onClick={() => {
                      setPair(
                        shareSheet === "me"
                          ? { ...pair, me: option.id }
                          : { ...pair, them: option.id },
                      )
                      shareCursor.current = { me: 0, them: 0 }
                      setShareSheet(null)
                    }}
                  >
                    <Icon name="globe" size={18} />
                    <span className="speak-lang-copy">
                      <strong>{option.native}</strong>
                      <small>{option.label}</small>
                    </span>
                    {selected ? <Icon name="check" size={17} /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveSession
