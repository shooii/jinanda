import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
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
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const [captionOn, setCaptionOn] = useState(true)
  const [joined, setJoined] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])
  /** 通话结束后落库的记录 id，用于避免重复写入 */
  const loggedId = useRef<string | null>(null)
  const [, addRecord] = useSavedRecords()
  const [privacy] = usePrivacyPrefs()
  const tick = useRef<number | null>(null)

  const peer = PEERS.find((item) => item.id === peerId && item.lang === themLang) ?? {
    id: "guest", name: "对方", lang: themLang, hue: 210,
  }
  const peerHue = { "--peer-hue": peer.hue } as CSSProperties

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
    setJoined(false)
  }, [view])

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
    setView("call")
  }

  /** 通话结束：直接落进「记录」页，与拍照 / 文本记录同列 */
  const hangup = () => {
    if (tick.current) window.clearInterval(tick.current)
    // 只要对方接入过就记一条：按seconds > 0 判断会让「接通后立刻挂断」静默丢失记录
    if ((joined || seconds > 0) && !loggedId.current && privacy.save) {
      const entry = addRecord({
        title: `示例${kind === "video" ? t("call.video") : t("call.voice")} · ${peer.name}`,
        meta: `${meName} ⇄ ${themName}`,
        summary: `交互演示 · ${mmss(seconds)}`,
        type: "通话",
        lines: transcript(),
        call: { kind, seconds, peer: peer.name, channel: "演示" },
      })
      loggedId.current = entry.id
    }
    setView("ended")
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
      title: `示例${t("call.title")} · ${peer.name} · ${mmss(seconds)}`,
      meta: `${meName} ⇄ ${themName}`,
      time: nowLabel(),
      summary: "预置双语字幕 · 交互演示",
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
        else {
          setThemLang(id)
          setPeerId(PEERS.find((item) => item.lang === id)?.id ?? "guest")
        }
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
            ariaLabel="返回"
            className="callx-nav-back"
            onClick={onClose}
          >
            <Icon name="chevron" size={18} />
          </AppButton>
          <h1>{t("call.title")}</h1>
          <span />
        </header>

        {/* 通话记录统一收进「记录」页，此处不再重复展示；联系人在拨通后选择 */}
        <section className="call-dial">
          <p className="demo-note">交互演示 · 当前版本不能拨打真实电话或连接第三方通话</p>
          <p className="call-dial-note">查看模拟通话中的双语字幕</p>
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
          <div className="call-demo-peers">
            <small>选择示例角色</small>
            <div className="callx-peer-row">
              {PEERS.map((item) => (
                <AppButton
                  className={`callx-peer ${item.id === peer.id ? "on" : ""}`}
                  key={item.id}
                  onClick={() => pickPeer(item)}
                >
                  <span className="callx-peer-avatar" style={{ "--peer-hue": item.hue } as CSSProperties}>
                    {initialOf(item.name)}
                  </span>
                  <span className="callx-peer-copy"><strong>{item.name}</strong></span>
                </AppButton>
              ))}
            </div>
          </div>
          <div className="call-dial-actions">
            <AppButton
              className="call-btn call-btn-video"
              onClick={() => start("video")}
            >
              <Icon name="video" size={20} />
              <span>体验视频通话</span>
            </AppButton>
            <AppButton
              className="call-btn call-btn-voice"
              onClick={() => start("voice")}
            >
              <Icon name="mic" size={20} />
              <span>体验语音通话</span>
            </AppButton>
          </div>
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
        <p className="demo-note call-demo-note">示例通话 · 不会开启麦克风或摄像头，也不会呼叫联系人</p>
        {joined ? (
          <div className="callx-peer-stage" style={peerHue}>
            <span className="callx-peer-glow" />
            <div className="callx-peer-center">
              <span className="callx-peer-avatar xl">
                {initialOf(peer.name)}
              </span>
              <strong>{peer.name}</strong>
              <small>
                {themName} · 示例通话
              </small>
            </div>
          </div>
        ) : (
          <div className="call-video off"><span className="call-video-grid" /></div>
        )}

        <header className="callx-stage-top">
          <div className="callx-stage-langs">
            <span>{themName}</span>
            <Icon name="swap" size={14} />
            <span>{meName}</span>
          </div>
          {joined && <b className="callx-stage-timer">{mmss(seconds)}</b>}
        </header>

        {!joined && (
          <div className="callx-stage-hint">
            <small>字幕演示</small>
            <strong>点击下方按钮，查看双语字幕示例</strong>
          </div>
        )}

        {captionOn && cap.length > 0 && (
          <div className="call-caps">
            <span className="call-caps-label">
              <Icon name="translate" size={13} />
              示例字幕
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
            {joined && <div className="call-ctrl">
              <AppButton
                className={`call-ctrl-btn ${captionOn ? "on" : "off"}`}
                onClick={() => setCaptionOn((v) => !v)}
              >
                <Icon name="notes" size={20} />
              </AppButton>
              <small>
                {captionOn ? t("callx.captionOn") : t("callx.captionOff")}
              </small>
            </div>}
            {!joined && <div className="call-ctrl">
              <AppButton
                ariaLabel="开始字幕示例"
                className="call-ctrl-btn share"
                onClick={() => setJoined(true)}
              >
                <Icon name="play" size={20} />
              </AppButton>
              <small>开始字幕示例</small>
            </div>}
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
            演示 ·{" "}
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
