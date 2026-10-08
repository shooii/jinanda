import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { SwitchRow } from "@/components/SwitchRow"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, usePersistentState, useLangPair } from "@/lib/core"
import { useT } from "@/lib/i18n"
import {
  langOption,
  sentences,
  translatePhrase,
  type LangId,
} from "@/lib/translate"
import {
  useSavedRecords,
  usePrivacyPrefs,
  nowLabel,
  recordToText,
  downloadText,
} from "@/lib/store"

type CallKind = "video" | "voice"

type Turn = {
  who: "me" | "them"
  original: string
  translated: string
}

/** 通话对象：决定「跟谁在聊」——姓名、头像首字、母语 */
type Peer = { id: string; name: string; lang: LangId; hue: number }

const PEERS: Peer[] = [
  { id: "emma", name: "Emma Wilson", lang: "en", hue: 212 },
  { id: "liam", name: "Liam Carter", lang: "en", hue: 268 },
  { id: "yuki", name: "佐藤 由纪", lang: "ja", hue: 340 },
  { id: "carlos", name: "Carlos Ruiz", lang: "es", hue: 28 },
]

/**
 * 可分享到的聊天软件：先拨通通话，接通后再把通话分享到这些 App。
 * 第三方名称仅作兼容性说明。
 */
const CHANNELS: { id: string; name: string; icon: IconName; hue: number }[] = [
  { id: "wechat", name: "微信", icon: "message", hue: 155 },
  { id: "whatsapp", name: "WhatsApp", icon: "message", hue: 150 },
  { id: "telegram", name: "Telegram", icon: "message", hue: 240 },
  { id: "messenger", name: "Messenger", icon: "message", hue: 265 },
  { id: "instagram", name: "Instagram", icon: "camera", hue: 345 },
  { id: "signal", name: "Signal", icon: "message", hue: 230 },
  { id: "facetime", name: "FaceTime", icon: "video", hue: 145 },
  { id: "meet", name: "Google Meet", icon: "video", hue: 190 },
  { id: "teams", name: "Teams", icon: "video", hue: 262 },
  { id: "zoom", name: "Zoom", icon: "video", hue: 238 },
  { id: "skype", name: "Skype", icon: "video", hue: 205 },
  { id: "viber", name: "Viber", icon: "message", hue: 288 },
  { id: "line", name: "LINE", icon: "message", hue: 140 },
  { id: "discord", name: "Discord", icon: "message", hue: 270 },
  { id: "snapchat", name: "Snapchat", icon: "camera", hue: 95 },
]

/**
 * 通话中的演示对话：下标指向句级词典（translate.ts sentences），
 * 因此任意语言对都能得到干净的双语字幕。
 */
const CALL_LINES: { who: "me" | "them"; idx: number }[] = [
  { who: "them", idx: 14 },
  { who: "me", idx: 15 },
  { who: "them", idx: 16 },
  { who: "me", idx: 17 },
  { who: "them", idx: 18 },
]

function mmss(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function initialOf(name: string) {
  return name.trim().slice(0, 1)
}

export function CallTranslate({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [view, setView] = useState<"home" | "call" | "ended">("home")
  const [kind, setKind] = useState<CallKind>("video")
  const [peerId, setPeerId] = usePersistentState<string>(
    "lingo.call-peer",
    "emma",
  )
  const { me: meLang, them: themLang, setMe: setMeLang, setThem: setThemLang } =
    useLangPair()
  /** 分享到哪个 App（拨通之后才需要选） */
  const [channelId, setChannelId] = usePersistentState<string>(
    "lingo.call-channel",
    "wechat",
  )
  const [autoDetect, setAutoDetect] = usePersistentState<boolean>(
    "lingo.call-auto-detect",
    true,
  )
  const [overlay, setOverlay] = usePersistentState<boolean>(
    "lingo.call-overlay",
    true,
  )
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const [sheet, setSheet] = useState<null | "share" | "setup">(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  /** 译文走耳机、手机不外放，与参考图默认一致 */
  const [speakerOn, setSpeakerOn] = useState(false)
  const [captionOn, setCaptionOn] = useState(true)
  /** 已把本次通话分享给对方；对方点开后才会接入 */
  const [shared, setShared] = useState(false)
  const [joined, setJoined] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])
  /** 通话结束后落库的记录 id，用于避免重复写入 */
  const loggedId = useRef<string | null>(null)
  const [, addRecord] = useSavedRecords()
  const [privacy] = usePrivacyPrefs()
  const tick = useRef<number | null>(null)

  const peer = PEERS.find((item) => item.id === peerId) ?? PEERS[0]
  const channel =
    CHANNELS.find((item) => item.id === channelId) ?? CHANNELS[0]
  const peerHue = { "--peer-hue": peer.hue } as CSSProperties

  useEscapeKey(() => {
    if (sheet) setSheet(null)
    else if (picker) setPicker(null)
    else if (view !== "home") setView("home")
    else onClose()
  })

  // 进入通话：重置本次通话状态
  useEffect(() => {
    if (view !== "call") return
    setSeconds(0)
    setTurns([])
    setShared(false)
    setJoined(false)
  }, [view])

  // 分享出去之后，对方才会接入（参考图：分享后，等待用户接入）
  useEffect(() => {
    if (view !== "call" || !shared) return
    const accept = window.setTimeout(() => setJoined(true), 1600)
    return () => window.clearTimeout(accept)
  }, [view, shared])

  // 计时从对方接入开始
  useEffect(() => {
    if (view !== "call" || !joined) return
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [view, joined])

  // 接入后逐句推送实时双语字幕（原文大字 / 译文小字）
  useEffect(() => {
    if (view !== "call" || !joined) return
    let idx = 0
    const push = window.setInterval(() => {
      if (idx >= CALL_LINES.length) {
        window.clearInterval(push)
        return
      }
      const line = CALL_LINES[idx]
      const from: LangId = line.who === "me" ? meLang : themLang
      const to: LangId = line.who === "me" ? themLang : meLang
      const original = sentences[from]?.[line.idx] ?? ""
      const translated =
        from === to ? original : translatePhrase(original, from, to).text
      setTurns((prev) => [...prev, { who: line.who, original, translated }])
      idx += 1
    }, 1800)
    return () => window.clearInterval(push)
  }, [view, joined, meLang, themLang])

  const start = (nextKind: CallKind) => {
    setKind(nextKind)
    loggedId.current = null
    setCameraOn(nextKind === "video")
    setView("call")
  }

  /** 通话结束：直接落进「记录」页，与拍照 / 文本记录同列 */
  const hangup = () => {
    if (tick.current) window.clearInterval(tick.current)
    // 只要对方接入过就记一条：按seconds > 0 判断会让「接通后立刻挂断」静默丢失记录
    if ((joined || seconds > 0) && !loggedId.current && privacy.save) {
      const entry = addRecord({
        title: `${kind === "video" ? t("call.video") : t("call.voice")} · ${peer.name}`,
        meta: `${meName} ⇄ ${themName}`,
        summary: `${channel.name} · ${mmss(seconds)}`,
        type: "通话",
        lines: transcript(),
        call: { kind, seconds, peer: peer.name, channel: channel.name },
      })
      loggedId.current = entry.id
    }
    setView("ended")
  }

  const confirmShare = () => {
    setSheet(null)
    if (view === "call") setShared(true)
    else toast(t("callz.shared"))
  }

  const pickPeer = (next: Peer) => {
    setPeerId(next.id)
    setThemLang(next.lang)
  }

  const meName = langOption(meLang).label
  const themName = langOption(themLang).label

  const transcript = () =>
    turns.map((line) => ({
      speaker: line.who === "me" ? t("call.me") : peer.name,
      original: line.original,
      translated: line.translated,
    }))

  const exportRecord = () => {
    const text = recordToText({
      id: "call",
      title: `${t("call.title")} · ${peer.name} · ${mmss(seconds)}`,
      meta: `${meName} ⇄ ${themName}`,
      time: nowLabel(),
      summary: `${channel.name} · ${t("call.subtitle")}`,
      type: "通话",
      lines: transcript(),
    })
    downloadText("call-record.txt", text)
  }

  const langPicker = (
    <LangPicker
      onClose={() => setPicker(null)}
      onPick={(id) => {
        if (picker === "me") setMeLang(id)
        else setThemLang(id)
        setPicker(null)
      }}
      open={picker !== null}
      title={picker === "me" ? t("call.me") : t("call.them")}
      value={picker === "me" ? meLang : themLang}
    />
  )

  /** 微信风格分享面板：先拨通，接通后再把通话分享给对方 */
  const shareSheet = sheet === "share" && (
    <div className="call-sheet-backdrop" onClick={() => setSheet(null)}>
      <div
        className="callx-share-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="callx-share-head">
          <AppButton
            className="callx-share-close"
            onClick={() => setSheet(null)}
          >
            {t("callz.close")}
          </AppButton>
          <strong>{channel.name}</strong>
          <span />
        </header>

        <div className="callx-share-apps">
          <small className="callx-share-apps-label">{t("callz.shareTo")}</small>
          <div className="callx-app-row">
            {CHANNELS.map((item) => (
              <AppButton
                className={`callx-app ${item.id === channel.id ? "on" : ""}`}
                key={item.id}
                onClick={() => setChannelId(item.id)}
              >
                <span
                  className="callx-app-icon"
                  style={{ "--app-hue": item.hue } as CSSProperties}
                >
                  <Icon name={item.icon} size={17} />
                </span>
                <span className="callx-app-name">{item.name}</span>
              </AppButton>
            ))}
          </div>
        </div>

        <div className="callx-share-card">
          <span className="callx-share-logo">L</span>
          <div>
            <strong>{t("call.title")}</strong>
            <small>{t("call.shareDesc")}</small>
          </div>
        </div>

        <div className="callx-share-actions">
          <AppButton onClick={confirmShare}>
            <span className="callx-share-action-icon">
              <Icon name="profile" size={18} />
            </span>
            <span>{t("call.forward")}</span>
            <Icon name="chevron" size={16} />
          </AppButton>
          <AppButton onClick={confirmShare}>
            <span className="callx-share-action-icon moments">
              <Icon name="globe" size={18} />
            </span>
            <span>{t("call.moments")}</span>
            <Icon name="chevron" size={16} />
          </AppButton>
          <AppButton onClick={confirmShare}>
            <span className="callx-share-action-icon save">
              <Icon name="receipt" size={18} />
            </span>
            <span>{t("call.favorite")}</span>
            <Icon name="chevron" size={16} />
          </AppButton>
        </div>

        <p className="callx-share-note">
          <Icon name="sparkles" size={13} />
          <span>{t("callz.shareNote")}</span>
        </p>
      </div>
    </div>
  )

  /** 通话设置：通话应用 / 自动识别来电 / 系统级悬浮字幕 */
  const setupSheet = sheet === "setup" && (
    <div className="call-sheet-backdrop" onClick={() => setSheet(null)}>
      <div
        className="callx-setup-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="callx-setup-head">
          <div>
            <strong>{t("callz.setup")}</strong>
            <small>{t("callx.appsNote")}</small>
          </div>
          <AppButton
            className="callx-nav-back"
            ariaLabel={t("callz.close")}
            onClick={() => setSheet(null)}
          >
            <Icon name="close" size={17} />
          </AppButton>
        </header>
        <div className="callx-setup-body">
          <div className="section-heading">
            <h3>{t("callx.apps")}</h3>
            <span className="callx-live-tag">
              <Icon name="sparkles" size={12} />
              {t("callx.live")}
            </span>
          </div>
          <div className="callx-app-row">
            {CHANNELS.map((item) => (
              <AppButton
                className={`callx-app ${item.id === channel.id ? "on" : ""}`}
                key={item.id}
                onClick={() => setChannelId(item.id)}
              >
                <span
                  className="callx-app-icon"
                  style={{ "--app-hue": item.hue } as CSSProperties}
                >
                  <Icon name={item.icon} size={17} />
                </span>
                <span className="callx-app-name">{item.name}</span>
              </AppButton>
            ))}
          </div>
          <SwitchRow
            icon="bolt"
            title={t("callx.autoDetect")}
            on={autoDetect}
            onToggle={() => setAutoDetect((v) => !v)}
          />
          <SwitchRow
            icon="volume"
            title={speakerOn ? t("callx.speakerOn") : t("callx.speakerOff")}
            detail={t("session.soundOut")}
            on={speakerOn}
            onToggle={() => setSpeakerOn((v) => !v)}
          />
          <SwitchRow
            icon="monitor"
            title={t("callx.overlay")}
            detail={t("callx.overlayNote")}
            on={overlay}
            onToggle={() => setOverlay((v) => !v)}
          />
        </div>
      </div>
    </div>
  )

  /* ---------------- 落地页 ---------------- */
  if (view === "home") {
    return (
      <main className="tab-page call-page">
        <header className="callx-nav">
          <AppButton
            ariaLabel="返回"
            className="callx-nav-back"
            onClick={onClose}
          >
            <Icon name="chevron" size={18} />
          </AppButton>
          <h1>{t("call.title")}</h1>
          <AppButton
            ariaLabel={t("callz.setup")}
            className="callx-nav-gear"
            onClick={() => setSheet("setup")}
          >
            <Icon name="settings" size={17} />
          </AppButton>
        </header>

        {/* 通话记录统一收进「记录」页，此处不再重复展示；联系人在拨通后选择 */}
        <section className="call-dial">
          <p className="call-dial-note">{t("call.subtitle")}</p>
          <div className="callx-lang-stack">
            <AppButton
              className="callx-lang-row"
              onClick={() => setPicker("me")}
            >
              <i className="call-lang-dot me" />
              <small>{t("call.me")}</small>
              <strong>{meName}</strong>
              <Icon name="chevron" size={15} />
            </AppButton>
            <AppButton
              ariaLabel={t("call.me")}
              className="callx-lang-swap"
              onClick={() => {
                const prev = meLang
                setMeLang(themLang)
                setThemLang(prev)
              }}
            >
              <Icon name="swap" size={16} />
            </AppButton>
            <AppButton
              className="callx-lang-row them"
              onClick={() => setPicker("them")}
            >
              <i className="call-lang-dot them" />
              <small>{t("call.them")}</small>
              <strong>{themName}</strong>
              <Icon name="chevron" size={15} />
            </AppButton>
          </div>
          <div className="call-dial-actions">
            <AppButton
              className="call-btn call-btn-video"
              onClick={() => start("video")}
            >
              <Icon name="video" size={20} />
              <span>{t("call.video")}</span>
            </AppButton>
            <AppButton
              className="call-btn call-btn-voice"
              onClick={() => start("voice")}
            >
              <Icon name="mic" size={20} />
              <span>{t("call.voice")}</span>
            </AppButton>
          </div>
        </section>

        {langPicker}
        {shareSheet}
        {setupSheet}
      </main>
    )
  }

  /* ---------------- 通话中 ---------------- */
  if (view === "call") {
    const cap = turns.slice(-3)
    const selfVideo = kind === "video" && cameraOn
    return (
      <main className="call-stage">
        {joined ? (
          <div className="callx-peer-stage" style={peerHue}>
            <span className="callx-peer-glow" />
            <div className="callx-peer-center">
              <span className="callx-peer-avatar xl">
                {initialOf(peer.name)}
              </span>
              <strong>{peer.name}</strong>
              <small>
                {themName} · {t("callz.joined")} · {channel.name}
              </small>
            </div>
          </div>
        ) : (
          <div className={selfVideo ? "call-video on" : "call-video off"}>
            <span className="call-video-grid" />
            <div className="call-video-center">
              {selfVideo ? (
                <>
                  <span className="call-video-avatar">
                    <Icon name="profile" size={30} />
                  </span>
                  <p className="call-video-status">{t("call.me")}</p>
                </>
              ) : (
                <>
                  <span className="call-video-avatar">
                    <Icon name="camera" size={30} />
                  </span>
                  <p className="call-video-status">{t("call.cameraOff")}</p>
                  <small className="call-video-pair">
                    {themName} ⇄ {meName}
                  </small>
                </>
              )}
            </div>
          </div>
        )}

        <header className="callx-stage-top">
          <div className="callx-stage-langs">
            <span>{themName}</span>
            <Icon name="swap" size={14} />
            <span>{meName}</span>
          </div>
          {joined && <b className="callx-stage-timer">{mmss(seconds)}</b>}
        </header>

        {/* 联系人在拨通后选择：接入前可随时切换通话对象 */}
        {!joined && (
          <section className="callx-stage-pick">
            <div className="section-heading">
              <h2>{t("callz.contacts")}</h2>
              <small>{t("callz.pickPeer")}</small>
            </div>
            <div className="callx-peer-row">
              {PEERS.map((item) => {
                const on = item.id === peer.id
                return (
                  <AppButton
                    className={`callx-peer ${on ? "on" : ""}`}
                    key={item.id}
                    onClick={() => pickPeer(item)}
                  >
                    <span
                      className="callx-peer-avatar"
                      style={{ "--peer-hue": item.hue } as CSSProperties}
                    >
                      {initialOf(item.name)}
                    </span>
                    <span className="callx-peer-copy">
                      <strong>{item.name}</strong>
                      <small>{langOption(item.lang).label}</small>
                    </span>
                    {on && <Icon name="check" size={15} />}
                  </AppButton>
                )
              })}
            </div>
          </section>
        )}

        {!joined && (
          <div className="callx-stage-hint">
            <small>{t("callz.inviting")}</small>
            <strong>
              {shared ? t("callz.shared") : t("callz.shareHint")}
            </strong>
          </div>
        )}

        {joined && (
          <div
            className={selfVideo ? "callx-pip" : "callx-pip off"}
            style={{ "--app-hue": peer.hue } as CSSProperties}
          >
            {selfVideo ? (
              <>
                <span className="callx-pip-glow" />
                <span className="callx-pip-face">
                  <Icon name="profile" size={20} />
                </span>
                <small>{t("call.me")}</small>
              </>
            ) : (
              <span className="callx-pip-off">
                <Icon name="camera" size={18} />
                <small>{t("call.cameraOff")}</small>
              </span>
            )}
          </div>
        )}

        {captionOn && cap.length > 0 && (
          <div className="call-caps">
            <span className="call-caps-label">
              <Icon name="translate" size={13} />
              {t("callx.live")}
            </span>
            {cap.map((line, i) => (
              <div className={`call-cap ${line.who}`} key={i}>
                <small className="call-cap-who">
                  {line.who === "me" ? t("call.me") : peer.name}
                </small>
                <p className="call-cap-src">{line.original}</p>
                <span className="call-cap-rule" />
                <p className="call-cap-dst">{line.translated}</p>
              </div>
            ))}
          </div>
        )}

        <footer className="call-controls">
          <div className="callx-ctrl-row">
            {kind === "video" && (
              <div className="call-ctrl">
                <AppButton
                  className={`call-ctrl-btn ${cameraOn ? "on" : "off"}`}
                  onClick={() => setCameraOn((v) => !v)}
                >
                  <Icon name="camera" size={20} />
                </AppButton>
                <small>
                  {cameraOn ? t("call.cameraOn") : t("call.cameraOff")}
                </small>
              </div>
            )}
            <div className="call-ctrl">
              <AppButton
                className={`call-ctrl-btn ${micOn ? "on" : "off"}`}
                onClick={() => setMicOn((v) => !v)}
              >
                <Icon name="mic" size={20} />
              </AppButton>
              <small>{micOn ? t("call.micOn") : t("call.micOff")}</small>
            </div>
            <div className="call-ctrl">
              <AppButton
                className={`call-ctrl-btn ${captionOn ? "on" : "off"}`}
                onClick={() => setCaptionOn((v) => !v)}
              >
                <Icon name="notes" size={20} />
              </AppButton>
              <small>
                {captionOn ? t("callx.captionOn") : t("callx.captionOff")}
              </small>
            </div>
            <div className="call-ctrl">
              {!shared && (
                <span className="callx-share-arrow" aria-hidden="true">
                  <svg viewBox="0 0 40 34" width="34" height="29" fill="none">
                    <path
                      d="M34 3C23 5 15.5 12 11.5 25"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 18.5 10.5 26.5l8.5-5.5"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
              <AppButton
                className={`call-ctrl-btn share ${shared ? "done" : ""}`}
                onClick={() => setSheet("share")}
              >
                <Icon name="share" size={20} />
              </AppButton>
              <small>{shared ? t("callz.shared") : t("call.share")}</small>
            </div>
          </div>

          <div className="callx-hangup-row">
            <div className="call-ctrl">
              <AppButton
                ariaLabel={t("call.hangup")}
                className="call-ctrl-btn hangup callx-hangup"
                onClick={hangup}
              >
                <Icon name="phone" size={24} />
              </AppButton>
              <small>{t("call.hangup")}</small>
            </div>
          </div>
        </footer>

        {shareSheet}
      </main>
    )
  }

  /* ---------------- 通话结束 ---------------- */
  return (
    <main className="tab-page call-page call-ended">
      <header className="callx-nav">
        {/* 结束页回到落地页（与 Esc 行为一致），落地页的返回才是退出该功能 */}
        <AppButton
          ariaLabel={t("callz.backToList")}
          className="callx-nav-back"
          onClick={() => setView("home")}
        >
          <Icon name="chevron" size={18} />
        </AppButton>
        <h1>{t("call.ended")}</h1>
        <span />
      </header>

      <section className="call-summary">
        <div className="call-summary-card">
          <span className="callx-peer-avatar xl" style={peerHue}>
            {initialOf(peer.name)}
          </span>
          <span className="call-summary-label">{t("callz.callingWith")}</span>
          <strong>{peer.name}</strong>
          <small>
            {channel.name} ·{" "}
            {kind === "video" ? t("call.video") : t("call.voice")} ·{" "}
            {mmss(seconds)} · {turns.length} {t("callx.translation")}
          </small>
          <small className="call-summary-pair">
            {meName} ⇄ {themName}
          </small>
        </div>

        <div className="call-summary-list">
          {turns.length === 0 ? (
            <p className="call-summary-empty">{t("callz.shareHint")}</p>
          ) : (
            turns.map((line, i) => (
              <div className={`call-cap ${line.who}`} key={i}>
                <small>{line.who === "me" ? t("call.me") : peer.name}</small>
                <p className="call-cap-src">{line.original}</p>
                <span className="call-cap-rule" />
                <p className="call-cap-dst">{line.translated}</p>
              </div>
            ))
          )}
        </div>

        <div className="call-summary-actions">
          {/* 挂断时已自动落进「记录」页；这里只呈现状态，不再放一个点不动的「按钮」 */}
          <p className="call-summary-status">
            <Icon name={loggedId.current ? "check" : "close"} size={15} />
            <span>
              {loggedId.current ? t("callz.logged") : t("callz.notLogged")}
            </span>
          </p>
          <AppButton
            className="text-button"
            disabled={turns.length === 0}
            onClick={() => setSheet("share")}
          >
            <Icon name="share" size={16} />
            <span>{t("call.share")}</span>
          </AppButton>
          <AppButton
            className="text-button"
            disabled={turns.length === 0}
            onClick={exportRecord}
          >
            <Icon name="receipt" size={16} />
            <span>{t("call.export")}</span>
          </AppButton>
          <AppButton className="text-button" onClick={() => start(kind)}>
            <Icon name={kind === "video" ? "video" : "phone"} size={16} />
            <span>{t("callz.again")}</span>
          </AppButton>
        </div>
      </section>

      {shareSheet}
      {setupSheet}
    </main>
  )
}

export default CallTranslate
