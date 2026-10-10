import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { SwitchRow } from "@/components/SwitchRow"
import { useEscapeKey, usePersistentState } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import { useAppLanguage, useT } from "@/lib/i18n"
import {
  allLanguages,
  detectLang,
  applyTone,
  detectGlossary,
  translatePhrase,
  langOption,
  type LangId,
  type ToneId,
} from "@/lib/translate"
import { useVocabulary } from "@/lib/store"
import { describeRecognitionError, speakText, stopSpeaking } from "@/lib/speech"
import { useLiveTranslate, type LiveStatus } from "@/lib/useLiveTranslate"
import { SpeakerTalk } from "@/features/SpeakerTalk"
import type { DialogueModeId } from "@/features/DialogueMode"

type ShareTurn = {
  id: number
  who: "me" | "them"
  original: string
  translated: string
}

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
          <SwitchRow
            title={t("session.autoDetect")}
            detail={t("session.autoDetectDetail")}
            on={shared.autoDetect}
            onToggle={shared.onToggleAutoDetect}
          />
          <SwitchRow
            title={t("context.title")}
            detail={t("context.tip")}
            on={shared.contextOn}
            onToggle={shared.onToggleContext}
          />
          <SwitchRow
            title={t("session.noSave")}
            detail={shared.noSave ? t("session.noSaveDetail") : t("session.saved")}
            on={shared.noSave}
            onToggle={shared.onToggleNoSave}
          />
          <SwitchRow
            title={t("session.offlinePref")}
            detail={t("session.offlineDetail")}
            on={shared.offline}
            onToggle={shared.onToggleOffline}
          />
          <SwitchRow
            title={t("session.lockScreen")}
            detail={t("session.lockScreenDetail")}
            on={shared.lockScreen}
            onToggle={shared.onToggleLockScreen}
          />
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
  status,
  interim,
  level,
  errorText,
  onToggle,
  onPlay,
  onOpenTone,
  routeDescription,
}: {
  t: (k: string) => string
  shared: Shared
  turns: ShareTurn[]
  playingId: number | null
  live: boolean
  status: LiveStatus
  interim: string
  level: number
  errorText: string
  onToggle: () => void
  onPlay: (id: number) => void
  onOpenTone: () => void
  routeDescription: string
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

  const statusText = errorText
    ? errorText
    : status === "preparing"
      ? "正在准备识别与翻译模型…"
      : status === "translating"
        ? "正在翻译…"
        : status === "listening"
          ? "正在聆听，听到内容会自动判断是谁在说"
          : "点按麦克风开始对话"

  return (
    <main className="share-stage">
      <p className="session-status" role="status">{statusText}<br />{shared.offline ? "离线模式已开启 · 使用端侧语言包" : routeDescription} · 点按气泡可朗读译文</p>
      <div className="share-canvas" ref={canvasRef}>
        {turns.length === 0 && !interim ? (
          <p className="share-empty">
            <Icon name="headphones" size={22} />
            {t("speak.tapToSpeak")}
          </p>
        ) : (
          <>
            {turns.map((turn) => (
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
            ))}
            {interim ? (
              <article className="share-bubble live me">
                <div className="share-bubble-text">
                  <p className="share-bubble-src">{interim}</p>
                  <p className="share-bubble-dst pending">正在翻译…</p>
                </div>
              </article>
            ) : null}
          </>
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
          style={{ "--mic-level": level.toFixed(3) } as CSSProperties}
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
  mode,
}: {
  onClose: () => void
  onFeature?: (feature: FeatureId) => void
  mode: DialogueModeId
}) {
  const t = useT()
  const [uiLang] = useAppLanguage()
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
  const [sharePlayingId, setSharePlayingId] = useState<number | null>(null)
  const [shareSheet, setShareSheet] = useState<null | "me" | "them" | "tone">(
    null,
  )
  const { entries: vocab } = useVocabulary()

  /**
   * 真实对话链路。面对面场景不预设谁在说，改用识别出的语种判断发言方：
   * 听到中文就记到我这一侧，听到英文就记到对方那一侧，再译成另一侧语言。
   */
  const liveTalk = useLiveTranslate({
    meLang: pair.me,
    themLang: pair.them,
    autoSpeak: false,
    mode: "auto",
    offlineOnly: offline,
    onTurn: (turn) => setShareTurns((prev) => [...prev, turn]),
  })
  const shareLive = liveTalk.status !== "idle"

  useEscapeKey(() => {
    if (shareSheet) setShareSheet(null)
    else if (showSettings) setShowSettings(false)
  })

  const fullName = (id: LangId) =>
    uiLang === "zh" ? langOption(id).label : langOption(id).native

  const swapPair = () => {
    setPair({ me: pair.them, them: pair.me })
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
        aria-label={t("dialogue.swapLang")}
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
          status={liveTalk.status}
          interim={liveTalk.interim}
          level={liveTalk.level}
          errorText={
            liveTalk.error
              ? describeRecognitionError(liveTalk.error, liveTalk.errorCode)
              : ""
          }
          onToggle={() => (shareLive ? liveTalk.stop() : liveTalk.start("auto"))}
          onPlay={(id) => {
            const turn = shareTurns.find((item) => item.id === id)
            if (!turn) return
            if (sharePlayingId === id) {
              stopSpeaking()
              setSharePlayingId(null)
              return
            }
            const target = turn.who === "me" ? pair.them : pair.me
            const handle = speakText(turn.translated, target, () =>
              setSharePlayingId(null),
            )
            if (!handle) return
            setSharePlayingId(id)
          }}
          onOpenTone={() => setShareSheet("tone")}
          routeDescription={isHybrid ? "耳机 + 手机的呈现方式" : "双耳机的呈现方式"}
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
