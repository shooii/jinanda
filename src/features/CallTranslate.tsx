import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, useLangPair } from "@/lib/core"
import { useT } from "@/lib/i18n"
import {
  langOption,
} from "@/lib/translate"
import {
  useSavedRecords,
  usePrivacyPrefs,
  nowLabel,
  recordToText,
  downloadText,
  copyText,
} from "@/lib/store"
import { entitlementActive, useEntitlement } from "@/lib/services/entitlements"
import { createInviteLink, useRoomInvite } from "@/lib/room"
import { useLiveTranslate } from "@/lib/useLiveTranslate"

type CallKind = "video" | "voice"

type Turn = {
  who: "me" | "them"
  original: string
  translated: string
}

function mmss(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function CallTranslate({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [view, setView] = useState<"home" | "call" | "ended">("home")
  const [kind, setKind] = useState<CallKind>("video")
  const { me: meLang, them: themLang, setMe: setMeLang, setThem: setThemLang } =
    useLangPair()
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])
  /** 通话内的媒体状态：摄像头与麦克风都来自真实设备 */
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStream = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  /** 通话结束后落库的记录 id，用于避免重复写入 */
  const loggedId = useRef<string | null>(null)
  const [, addRecord] = useSavedRecords()
  const [privacy] = usePrivacyPrefs()
  const tick = useRef<number | null>(null)

  const { entitlement, serverConfigured } = useEntitlement()
  /** 通过邀请链接进入时，把语言对切到对方设定的组合（用本组件的 setter） */
  const roomInvite = useRoomInvite({ setMe: setMeLang, setThem: setThemLang })

  /**
   * 通话中的双语字幕走真实链路：麦克风 → 流式识别 → 翻译 → 朗读。
   * 说话方按识别出的语种判断，不再依赖预置台词。
   */
  const live = useLiveTranslate({
    meLang,
    themLang,
    autoSpeak: false,
    mode: "auto",
    onTurn: (turn) =>
      setTurns((prev) => [
        ...prev,
        { who: turn.who, original: turn.original, translated: turn.translated },
      ]),
  })
  /** 只有服务端明确判定「无权益」时才阻断；本地模式不阻断，只如实提示 */
  const entitlementBlocked =
    serverConfigured && entitlement.verified && !entitlementActive(entitlement)

  /**
   * 通话对象由「分享」决定，不再事先选择：
   * 点击视频/语音通话直接进通话，进来之后把邀请链接分享给对方。
   */
  const peerName = t("call.them")

  /** 唯一会挡住的只有「服务端明确判定没有权益」这一种情况 */
  const startBlockedReason = entitlementBlocked ? t("callx.needQuota") : ""
  const canStart = startBlockedReason === ""

  useEscapeKey(() => {
    if (picker) setPicker(null)
    else if (view !== "home") setView("home")
    else onClose()
  })

  // 进入通话：重置本次通话状态
  useEffect(() => {
    if (view !== "call") return
    setSeconds(0)
    setTurns([])
  }, [view])

  // 通话计时：进入通话即开始
  useEffect(() => {
    if (view !== "call") return
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [view])

  /** 打开摄像头（真前置摄像头，仅视频通话需要） */
  const openCamera = () => {
    if (!navigator.mediaDevices?.getUserMedia) return
    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })
        cameraStream.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play().catch(() => undefined)
        }
      } catch {
        setCameraOn(false)
        toast("无法打开摄像头，请检查浏览器权限")
      }
    })()
  }

  const closeCamera = () => {
    cameraStream.current?.getTracks().forEach((track) => track.stop())
    cameraStream.current = null
  }

  /**
   * 点击视频/语音通话：直接进通话，并在同一个手势里启动真实翻译链路
   * （端侧识别与翻译模型要求用户手势才允许下载），随后由「分享」邀请对方。
   */
  const start = (nextKind: CallKind) => {
    setKind(nextKind)
    loggedId.current = null
    setMicOn(true)
    setCameraOn(nextKind === "video")
    setView("call")
    if (nextKind === "video") openCamera()
    live.start("auto")
  }

  const toggleCamera = () => {
    const track = cameraStream.current?.getVideoTracks()[0]
    if (!track) {
      setCameraOn(true)
      openCamera()
      return
    }
    track.enabled = !track.enabled
    setCameraOn(track.enabled)
  }

  /** 麦克风开关＝是否在拾音并实时翻译 */
  const toggleMic = () => {
    if (micOn) {
      live.stop()
      setMicOn(false)
    } else {
      live.start("auto")
      setMicOn(true)
    }
  }

  const [shareOpen, setShareOpen] = useState(false)

  /** 分享内容＝一句说明 + 邀请链接，对方点开即可加入同一语言对 */
  const shareParts = () => ({
    title: t("call.title"),
    text: t("call.shareDesc"),
    url: createInviteLink(meLang, themLang),
  })

  const copyInvite = () => {
    void copyText(createInviteLink(meLang, themLang)).then((ok) =>
      toast(ok ? t("callx.inviteCopied") : "复制失败，请手动复制链接"),
    )
  }

  /**
   * 分享目标列表。
   *
   * 有公开网页分享入口的服务（WhatsApp / Telegram / 短信 / 邮件）直接跳过去，
   * 具体发给哪个联系人由对方在应用里选；微信、企业微信这类没有公开网页分享
   * 入口的，只能复制内容后到应用里粘贴，这里如实提示，不假装能直接跳转。
   */
  const shareTargets: {
    id: string
    label: string
    icon: IconName
    href?: (parts: { title: string; text: string; url: string }) => string
  }[] = [
    { id: "wechat", label: "WeChat", icon: "message" },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "phone",
      href: ({ text, url }) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: "navigate",
      // Telegram 的分享意图要求 url 与 text 分开传
      href: ({ text, url }) =>
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      id: "sms",
      label: t("callx.shareSms"),
      icon: "message",
      href: ({ text, url }) => `sms:?body=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      id: "email",
      label: t("callx.shareEmail"),
      icon: "notes",
      href: ({ title, text, url }) =>
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
    },
  ]

  const shareTo = (target: { href?: (parts: { title: string; text: string; url: string }) => string }) => {
    const parts = shareParts()
    setShareOpen(false)
    if (target.href) {
      window.open(target.href(parts), "_blank", "noopener,noreferrer")
      return
    }
    void copyText(`${parts.text} ${parts.url}`).then((ok) =>
      toast(ok ? t("callx.shareCopyHint") : "复制失败，请手动复制链接"),
    )
  }

  /** 更多应用：交给系统分享面板，列表里没有的应用从这里走 */
  const shareMore = () => {
    const url = createInviteLink(meLang, themLang)
    setShareOpen(false)
    const share = (
      navigator as Navigator & {
        share?: (data: { title: string; text: string; url: string }) => Promise<void>
      }
    ).share
    if (!share) {
      copyInvite()
      return
    }
    void share
      .call(navigator, { title: t("call.title"), text: t("call.shareDesc"), url })
      .catch(copyInvite)
  }

  useEffect(() => () => closeCamera(), [])

  /** 通话结束：直接落进「记录」页，与拍照 / 文本记录同列 */
  const hangup = () => {
    live.stop()
    if (tick.current) window.clearInterval(tick.current)
    // 只要对方接入过就记一条：按seconds > 0 判断会让「接通后立刻挂断」静默丢失记录
    if ((turns.length > 0 || seconds > 0) && !loggedId.current && privacy.save) {
      const entry = addRecord({
        title: `${kind === "video" ? t("call.video") : t("call.voice")} · ${peerName}`,
        meta: `${meName} ⇄ ${themName}`,
        summary: `通话时长 ${mmss(seconds)}`,
        type: "通话",
        lines: transcript(),
        call: { kind, seconds, peer: peerName, channel: "App 内通话" },
      })
      loggedId.current = entry.id
    }
    closeCamera()
    setView("ended")
  }

  const meName = langOption(meLang).label
  const themName = langOption(themLang).label

  const transcript = () =>
    turns.map((line) => ({
      speaker: line.who === "me" ? t("call.me") : peerName,
      original: line.original,
      translated: line.translated,
    }))

  const exportRecord = () => {
    const text = recordToText({
      id: "call",
      title: `${t("call.title")} · ${peerName} · ${mmss(seconds)}`,
      meta: `${meName} ⇄ ${themName}`,
      time: nowLabel(),
      summary: "双语实时字幕",
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

  /* ---------------- 落地页 ---------------- */
  if (view === "home") {
    return (
      <main className="tab-page call-page">
        <header className="callx-nav">
          <AppButton
            ariaLabel={t("sleep.back")}
            className="callx-nav-back"
            onClick={onClose}
          >
            <Icon name="chevron" size={18} />
          </AppButton>
          <h1>{t("call.title")}</h1>
          <span />
        </header>

        {roomInvite && (
          <p className="call-joined" role="status">
            <Icon name="check" size={15} />
            <span>{t("callx.joinedBanner")}</span>
          </p>
        )}

        {/* 生效语言对：选定联系人后由联系人母语决定 */}
        <section className="call-pair-card">
          <div className="callx-lang-stack">
            <AppButton className="callx-lang-row" onClick={() => setPicker("me")}>
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
        </section>

        {/* 主操作：点击直接进通话，进来之后再用「分享」邀请对方 */}
        <section className="call-start">
          <div className="call-dial-actions">
            <AppButton
              className="call-btn call-btn-video"
              disabled={!canStart}
              onClick={() => start("video")}
            >
              <Icon name="video" size={20} />
              <span>{t("callx.startVideo")}</span>
            </AppButton>
            <AppButton
              className="call-btn call-btn-voice"
              disabled={!canStart}
              onClick={() => start("voice")}
            >
              <Icon name="mic" size={20} />
              <span>{t("callx.startVoice")}</span>
            </AppButton>
          </div>
          {!canStart && <p className="call-dial-blocked">{startBlockedReason}</p>}
        </section>

        {langPicker}
      </main>
    )
  }

  /* ---------------- 通话中 ---------------- */
  if (view === "call") {
    const cap = turns.slice(-3)
    return (
      <main className="call-stage">
        {kind === "video" ? (
          <video
            autoPlay
            className={`call-selfview ${cameraOn ? "" : "off"}`}
            muted
            playsInline
            ref={videoRef}
          />
        ) : (
          <div className="call-voice-stage">
            <span className="callx-peer-glow" />
            <Icon name="audio" size={30} />
            <strong>{themName}</strong>
          </div>
        )}

        <header className="callx-stage-top">
          <div className="callx-stage-langs">
            <span>{themName}</span>
            <Icon name="swap" size={14} />
            <span>{meName}</span>
          </div>
          <b className="callx-stage-timer">{mmss(seconds)}</b>
        </header>

        {/* 还没人说话时提示先分享：邀请对方是这个页面的第一步 */}
        {turns.length === 0 && (
          <div className="callx-stage-hint">
            <small>{t("callz.shareTo")}</small>
            <strong>{t("callz.shareHint")}</strong>
          </div>
        )}

        {cap.length > 0 && (
          <div className="call-caps">
            <span className="call-caps-label">
              <Icon name="translate" size={13} />
              {t("callx.live")}
            </span>
            {cap.map((line, i) => (
              <div className={`call-cap ${line.who}`} key={i}>
                <small className="call-cap-who">
                  {line.who === "me" ? t("call.me") : peerName}
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
            <div className="call-ctrl">
              <AppButton
                ariaLabel={cameraOn ? t("call.cameraOn") : t("call.cameraOff")}
                className={`call-ctrl-btn ${cameraOn ? "on" : "off"}`}
                onClick={toggleCamera}
              >
                <Icon name="video" size={20} />
              </AppButton>
              <small>{cameraOn ? t("call.cameraOn") : t("call.cameraOff")}</small>
            </div>
            <div className="call-ctrl">
              <AppButton
                ariaLabel={micOn ? t("call.micOn") : t("call.micOff")}
                className={`call-ctrl-btn ${micOn ? "on" : "off"}`}
                onClick={toggleMic}
              >
                <Icon name="mic" size={20} />
              </AppButton>
              <small>{micOn ? t("call.micOn") : t("call.micOff")}</small>
            </div>
            <div className="call-ctrl">
              <AppButton
                ariaLabel={t("call.share")}
                className="call-ctrl-btn share"
                onClick={() => setShareOpen(true)}
              >
                <Icon name="share" size={20} />
              </AppButton>
              <small>{t("call.share")}</small>
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

        {shareOpen && (
          <div
            className="call-picker-backdrop"
            onClick={() => setShareOpen(false)}
          >
            <div
              aria-label={t("callz.shareTo")}
              aria-modal="true"
              className="call-picker-sheet"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <header>
                <h2>{t("callz.shareTo")}</h2>
              </header>
              <div className="call-share-list">
                {shareTargets.map((item) => (
                  <button
                    className="call-share-row"
                    key={item.id}
                    onClick={() => shareTo(item)}
                  >
                    <span className="call-share-icon">
                      <Icon name={item.icon} size={18} />
                    </span>
                    <strong>{item.label}</strong>
                    <Icon name="chevron" size={15} />
                  </button>
                ))}
                <button className="call-share-row" onClick={shareMore}>
                  <span className="call-share-icon">
                    <Icon name="share" size={18} />
                  </span>
                  <strong>{t("callx.shareMore")}</strong>
                  <Icon name="chevron" size={15} />
                </button>
                <button
                  className="call-share-row"
                  onClick={() => {
                    setShareOpen(false)
                    copyInvite()
                  }}
                >
                  <span className="call-share-icon">
                    <Icon name="notes" size={18} />
                  </span>
                  <strong>{t("callx.inviteCopy")}</strong>
                  <Icon name="chevron" size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
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
          <span className="callx-peer-avatar xl">
            <Icon name={kind === "video" ? "video" : "audio"} size={22} />
          </span>
          <span className="call-summary-label">{t("callz.callingWith")}</span>
          <strong>{peerName}</strong>
          <small>
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
                <small>{line.who === "me" ? t("call.me") : peerName}</small>
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

    </main>
  )
}

export default CallTranslate
