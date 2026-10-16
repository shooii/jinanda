import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, useLangPair } from "@/lib/core"
import { langOption } from "@/lib/translate"
import { useSavedRecords, usePrivacyPrefs, copyText } from "@/lib/store"
import { createInviteLink } from "@/lib/room"
import { useLiveTranslate } from "@/lib/useLiveTranslate"
import { playEarcon } from "@/lib/earcon"

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

export type CallScenario = {
  id: string
  title: string
  category: string
  peerName: string
  peerTitle: string
  peerLocation: string
  avatarBg: string
  turns: Turn[]
  quickReplies: string[]
}

export const CALL_SCENARIOS: CallScenario[] = [
  {
    id: "business",
    title: "跨国商务交付会谈",
    category: "商务跨国连线",
    peerName: "Alex Vance",
    peerTitle: "海外业务总监",
    peerLocation: "英国 · 伦敦 (UTC+0)",
    avatarBg: "linear-gradient(135deg, #2f6cf6, #1b4bcf)",
    turns: [
      {
        who: "them",
        original: "Hello! Glad we could connect. Did you review our revised launch timeline?",
        translated: "你好！很高兴能连线。你们查看我们修改后的发布时间表了吗？",
      },
      {
        who: "me",
        original: "看到了，我们前端与音频算法团队已经完成联调，确认可以在周五前完成交付。",
        translated: "Yes, our team has completed integration and confirmed delivery before Friday.",
      },
      {
        who: "them",
        original: "Fantastic. We will run regression tests tomorrow and finalize the sign-off.",
        translated: "太棒了。我们明天会进行回归测试，并最终签署验收确认书。",
      },
      {
        who: "me",
        original: "没问题，有任何即时问题随时电话沟通，我们保持全天在线支持。",
        translated: "No problem. Let us know if anything comes up, we will remain on standby.",
      },
    ],
    quickReplies: [
      "已完成联调，确认周五前完成交付",
      "明天回归测试我们会全程配合保障",
      "稍后我会把详细测试报告发到邮箱",
    ],
  },
  {
    id: "hotel",
    title: "海外旅行酒店与出行确认",
    category: "旅行与前台",
    peerName: "Sarah Dupont",
    peerTitle: "前台礼宾主管",
    peerLocation: "法国 · 巴黎 (UTC+1)",
    avatarBg: "linear-gradient(135deg, #10ac84, #1dd1a1)",
    turns: [
      {
        who: "them",
        original: "Bonjour! Front desk concierge speaking. How may I assist your upcoming stay?",
        translated: "您好！这里是酒店礼宾前台。请问有什么可以协助您即将开始的入住？",
      },
      {
        who: "me",
        original: "你好，我们航班预计今晚十点落地戴高乐机场，请问能安排专车接机吗？",
        translated: "Hello, our flight arrives at CDG around 10 PM. Can you arrange an airport pickup?",
      },
      {
        who: "them",
        original: "Certainly! Our driver will be waiting at Terminal 2E holding your name sign.",
        translated: "当然可以！我们的专车司机将在 2E 航站楼举牌等候您的到来。",
      },
      {
        who: "me",
        original: "太感谢了！另外麻烦帮我们保留一间高层无烟且安静的房间。",
        translated: "Thank you so much! Also please reserve a quiet non-smoking room on a high floor.",
      },
    ],
    quickReplies: [
      "我们航班今晚十点落地，请协助安排接机",
      "麻烦帮我们保留高层无烟安静的房间",
      "费用记在房账上即可，非常感谢",
    ],
  },
  {
    id: "interview",
    title: "硅谷远程架构技术交流",
    category: "技术与面试",
    peerName: "David Miller",
    peerTitle: "硅谷首席架构师",
    peerLocation: "美国 · 旧金山 (UTC-8)",
    avatarBg: "linear-gradient(135deg, #e056fd, #686de0)",
    turns: [
      {
        who: "them",
        original: "Hi! Let's discuss how your team handles edge real-time audio synchronization.",
        translated: "嗨！我们来聊聊你们团队是如何处理边缘端实时音频同步的吧。",
      },
      {
        who: "me",
        original: "我们采用了环形音频缓冲与 Web Audio 调度，将端到端延迟控制在50毫秒以内。",
        translated: "We use ring audio buffering and Web Audio scheduling to keep latency under 50ms.",
      },
      {
        who: "them",
        original: "Impressive approach. How do you prevent acoustic feedback when earphones auto-speak?",
        translated: "很棒的方案。那当耳机轻声播报译文时，你们如何避免麦克风声学回声？",
      },
      {
        who: "me",
        original: "我们集成了回声消除与双向通道互斥锁，确保播报与拾音互不干扰。",
        translated: "We integrated AEC and two-way mutex locks to isolate playback from recording.",
      },
    ],
    quickReplies: [
      "我们采用环形音频缓冲，将延迟控制在50毫秒内",
      "通过回声消除与双工互斥，彻底消除串音",
      "该方案已在移动端验证，功耗与稳定性表现优异",
    ],
  },
]

export function CallTranslate({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"home" | "call" | "ended">("home")
  const [kind, setKind] = useState<CallKind>("video")
  const { me: meLang, them: themLang, setMe: setMeLang, setThem: setThemLang } = useLangPair()
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])

  // 场景与演示控制
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("business")
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [demoTurnIndex, setDemoTurnIndex] = useState(0)

  // 悬浮同传窗状态
  const [floatingActive, setFloatingActive] = useState(false)

  // 音视频控制
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStream = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const loggedId = useRef<string | null>(null)
  const [, addRecord] = useSavedRecords()
  const [privacy] = usePrivacyPrefs()
  const tick = useRef<number | null>(null)
  const demoTimer = useRef<number | null>(null)

  const activeScenario = CALL_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? CALL_SCENARIOS[0]

  // 麦克风流式实时转写与同传链路
  const live = useLiveTranslate({
    meLang,
    themLang,
    autoSpeak: false,
    mode: "auto",
    onTurn: (turn) => {
      setTurns((prev) => [
        ...prev,
        { who: turn.who, original: turn.original, translated: turn.translated },
      ])
      playEarcon("success")
    },
  })

  useEscapeKey(() => {
    if (picker) setPicker(null)
    else if (view === "call") stopCall()
    else onClose()
  })

  // 只要处于全屏通话或悬浮同传中，持续计时；全屏/悬浮切换不丢失对话数据与时长
  const isCalling = view === "call" || floatingActive
  useEffect(() => {
    if (!isCalling) {
      if (tick.current) window.clearInterval(tick.current)
      return
    }
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [isCalling])

  // 通话中实际演示推进逻辑
  useEffect(() => {
    if (!isCalling || !demoPlaying) {
      if (demoTimer.current) window.clearTimeout(demoTimer.current)
      return
    }

    const scriptTurns = activeScenario.turns
    const scheduleNext = () => {
      if (demoTurnIndex < scriptTurns.length) {
        const nextTurn = scriptTurns[demoTurnIndex]
        setTurns((prev) => [...prev, nextTurn])
        playEarcon("success")
        setDemoTurnIndex((idx) => idx + 1)
        demoTimer.current = window.setTimeout(scheduleNext, 3400)
      } else {
        // 循环或保持
        demoTimer.current = window.setTimeout(() => {
          setDemoTurnIndex(0)
          scheduleNext()
        }, 5000)
      }
    }

    demoTimer.current = window.setTimeout(scheduleNext, 1200)

    return () => {
      if (demoTimer.current) window.clearTimeout(demoTimer.current)
    }
  }, [isCalling, demoPlaying, demoTurnIndex, activeScenario])

  const liveRef = useRef(live)
  liveRef.current = live

  // 组件卸载时释放音视频与拾音资源
  useEffect(() => {
    return () => {
      liveRef.current.stop()
      closeCamera()
      if (tick.current) window.clearInterval(tick.current)
      if (demoTimer.current) window.clearTimeout(demoTimer.current)
    }
  }, [])

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
        // 演示模式下摄像头不可用时不强求
      }
    })()
  }

  const closeCamera = () => {
    cameraStream.current?.getTracks().forEach((track) => track.stop())
    cameraStream.current = null
  }

  // 开始 App 内通话（支持选择是否开启实际演示）
  const startCall = (nextKind: CallKind, withDemo = true) => {
    playEarcon("ready")
    setSeconds(0)
    setTurns([])
    setKind(nextKind)
    loggedId.current = null
    setMicOn(true)
    setCameraOn(nextKind === "video")
    setFloatingActive(false)
    setDemoPlaying(withDemo)
    setDemoTurnIndex(0)
    setView("call")
    if (nextKind === "video") openCamera()
    live.start("auto")
    if (withDemo) {
      toast(`已开启与【${activeScenario.peerName}】的实际演示通话`)
    }
  }

  // 开始屏幕悬浮同传窗（配合微信/电话等外部应用）
  const startFloatingMode = (withDemo = false) => {
    playEarcon("ready")
    setSeconds(0)
    setTurns([])
    loggedId.current = null
    setFloatingActive(true)
    setDemoPlaying(withDemo)
    setDemoTurnIndex(0)
    live.start("auto")
    toast("悬浮窗已开启，支持在微信、电话中查看实时字幕")
  }

  // 快捷回复发言（模拟我方开口，同步转写为英文发送）
  const handleQuickReply = (text: string) => {
    const matchedTurn = activeScenario.turns.find((t) => t.who === "me" && t.original.includes(text.slice(0, 4)))
    const englishTranslation =
      matchedTurn?.translated ?? "Understood. We will proceed according to the agreed plan."

    setTurns((prev) => [
      ...prev,
      {
        who: "me",
        original: text,
        translated: englishTranslation,
      },
    ])
    playEarcon("success")
    toast("我方已发言 · 已同传为英文发送")
  }

  // 通话中切换演示连线对象（场景选择只存在于通话界面内，接通前不暴露）
  const cycleScenario = () => {
    const idx = CALL_SCENARIOS.findIndex((s) => s.id === selectedScenarioId)
    const next = CALL_SCENARIOS[(idx + 1) % CALL_SCENARIOS.length]
    setSelectedScenarioId(next.id)
    setTurns([])
    setDemoTurnIndex(0)
    playEarcon("toggle")
    toast(`已切换连线对象：${next.peerName} · ${next.title}`)
  }

  // 挂断/结束通话
  const stopCall = () => {
    playEarcon("toggle")
    live.stop()
    if (tick.current) window.clearInterval(tick.current)
    if (demoTimer.current) window.clearTimeout(demoTimer.current)
    setDemoPlaying(false)

    if ((turns.length > 0 || seconds > 2) && privacy.save) {
      const modeTitle = floatingActive ? "外部通话同传" : kind === "video" ? "视频通话同传" : "语音通话同传"
      addRecord({
        title: `${modeTitle} · ${activeScenario.peerName} (${activeScenario.title})`,
        meta: `${langOption(meLang).label} ⇄ ${langOption(themLang).label}`,
        summary: `时长 ${mmss(seconds)} · 同传 ${turns.length} 轮发言`,
        type: "通话",
        lines: turns.map((t) => ({
          speaker: t.who === "me" ? "我" : activeScenario.peerName,
          original: t.original,
          translated: t.translated,
        })),
        call: { kind, seconds, peer: activeScenario.peerName, channel: modeTitle },
      })
    }

    closeCamera()
    setFloatingActive(false)
    setView("ended")
  }

  const handleShareLink = () => {
    const link = createInviteLink(meLang, themLang)
    void copyText(link).then((ok) => {
      toast(ok ? "通话链接已复制，发给对方即可加入" : "复制失败")
    })
  }

  // 语言格里只放短名（中文 / English），完整名（中文（普通话））留给 title / 归档元信息，
  // 否则窄屏会被挤成两行并顶到卡片外
  const meName = langOption(meLang).native
  const themName = langOption(themLang).native
  const meLabel = langOption(meLang).label
  const themLabel = langOption(themLang).label

  const langPicker = (
    <LangPicker
      onClose={() => setPicker(null)}
      onPick={(id) => {
        if (picker === "me") setMeLang(id)
        else setThemLang(id)
        setPicker(null)
      }}
      open={picker !== null}
      title={picker === "me" ? "我的语言" : "对方语言"}
      value={picker === "me" ? meLang : themLang}
    />
  )

  /* ---------------- 1. 首页：设计系统一致性适配 + 绝不空着的实景演示专区 ---------------- */
  if (view === "home") {
    return (
      <main className="tab-page" style={{ paddingBottom: "3rem", minHeight: "100dvh" }}>
        {/* 规范顶栏 */}
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: "10px",
            padding: "0.8rem 1.15rem 0.5rem",
          }}
        >
          <AppButton
            ariaLabel="返回"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              color: "var(--ink)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onClick={onClose}
          >
            <Icon name="chevron" size={18} style={{ transform: "rotate(180deg)" }} />
          </AppButton>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>通话同传</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "2px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ed573" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                耳机已就绪 · 双向同传
              </span>
            </div>
          </div>

          <AppButton
            ariaLabel="分享链接"
            title="复制通话链接"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              color: "var(--ink)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onClick={handleShareLink}
          >
            <Icon name="share" size={16} />
          </AppButton>
        </header>

        {/* 语言选择卡片 */}
        <section
          style={{
            margin: "0.4rem 1.15rem 0.8rem",
            padding: "0.85rem 1rem",
            borderRadius: "18px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setPicker("me")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "6px 8px",
                borderRadius: "12px",
                background: "var(--surface-soft)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <small style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "2px" }}>我讲</small>
              <strong style={{ fontSize: "1rem", color: "var(--ink)" }} title={meLabel}>
                {meName}
              </strong>
            </button>

            <button
              aria-label="交换语言"
              onClick={() => {
                const prev = meLang
                setMeLang(themLang)
                setThemLang(prev)
                playEarcon("toggle")
              }}
              style={{
                width: "2.2rem",
                height: "2.2rem",
                borderRadius: "50%",
                background: "var(--surface-soft)",
                border: "1px solid var(--line)",
                display: "grid",
                placeItems: "center",
                color: "var(--teal, #2f6cf6)",
                cursor: "pointer",
              }}
            >
              <Icon name="swap" size={15} />
            </button>

            <button
              onClick={() => setPicker("them")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "6px 8px",
                borderRadius: "12px",
                background: "var(--surface-soft)",
                border: "none",
                cursor: "pointer",
                textAlign: "right",
              }}
            >
              <small style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "2px" }}>对方讲</small>
              <strong style={{ fontSize: "1rem", color: "var(--ink)" }} title={themLabel}>
                {themName}
              </strong>
            </button>
          </div>
        </section>

        {/* 核心功能入口 1：直接发起通话 */}
        <section style={{ padding: "0 1.15rem", marginBottom: "0.8rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => startCall("video", true)}
              style={{
                padding: "16px 12px",
                borderRadius: "18px",
                border: "none",
                background: "linear-gradient(135deg, #2f6cf6, #1b4bcf)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 8px 24px rgba(47, 108, 246, 0.28)",
                transition: "transform 0.12s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="video" size={20} />
              </div>
              <strong style={{ fontSize: "0.95rem" }}>视频通话</strong>
              <small style={{ fontSize: "0.7rem", opacity: 0.85 }}>自视画面 · 双语字幕</small>
            </button>

            <button
              onClick={() => startCall("voice", true)}
              style={{
                padding: "16px 12px",
                borderRadius: "18px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.12s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "var(--surface-soft)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--teal, #2f6cf6)",
                }}
              >
                <Icon name="mic" size={20} />
              </div>
              <strong style={{ fontSize: "0.95rem" }}>语音通话</strong>
              <small style={{ fontSize: "0.7rem", color: "var(--muted)" }}>纯净语音 · 实时转写</small>
            </button>
          </div>
        </section>

        {/* 核心功能入口 2：外部通话悬浮字幕窗 */}
        <section style={{ padding: "0 1.15rem", marginBottom: "1rem" }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <Icon name="headphones" size={15} style={{ color: "#2ed573" }} />
                <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>悬浮同传窗</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
                在微信、电话等通话里悬浮看字幕
              </p>
            </div>

            <button
              onClick={() => startFloatingMode(false)}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: "var(--surface-soft)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                fontSize: "0.8rem",
                fontWeight: 650,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              开启
            </button>
          </div>
        </section>

        {/* 接通前不放任何演示内容：真实通话里用户只看得到「拨号」，
            演示对白 / 场景切换全部收进接通后的通话界面 */}
        <p
          style={{
            margin: "0 1.15rem 1.3rem",
            fontSize: "0.74rem",
            lineHeight: 1.6,
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          接通后自动进入实景演示，随时可以直接开口参与交流。
        </p>

        {/* 悬浮窗状态 */}
        {floatingActive && (
          <div
            style={{
              position: "fixed",
              bottom: "82px",
              left: "14px",
              right: "14px",
              background: "rgba(20, 22, 28, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "18px",
              padding: "12px 14px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(47, 108, 246, 0.35)",
              zIndex: 9999,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#2ed573",
                    boxShadow: "0 0 8px #2ed573",
                  }}
                />
                <strong style={{ fontSize: "0.82rem", color: "#fff" }}>
                  悬浮同传中 · {mmss(seconds)}
                </strong>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => {
                    setView("call")
                    setFloatingActive(false)
                    if (kind === "video" && !cameraStream.current) {
                      openCamera()
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    color: "#fff",
                    fontSize: "0.72rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  全屏
                </button>
                <button
                  onClick={stopCall}
                  style={{
                    background: "#ff4757",
                    border: "none",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 650,
                    padding: "3px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  挂断
                </button>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "0.85rem",
              }}
            >
              {live.interim ? (
                <span style={{ color: "#5a8ef6" }}>{live.interim}</span>
              ) : turns.length > 0 ? (
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                    {turns[turns.length - 1].original}
                  </div>
                  <div style={{ color: "#2ed573", fontSize: "0.82rem" }}>
                    {turns[turns.length - 1].translated}
                  </div>
                </div>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                  🎙️ 正在收音，请直接开口交流...
                </span>
              )}
            </div>
          </div>
        )}

        {langPicker}
      </main>
    )
  }

  /* ---------------- 2. 通话中：极简沉浸式全屏 + 实际连线演示画面（绝不空着） ---------------- */
  if (view === "call") {
    const recentTurns = turns.slice(-2)
    // 一旦有字幕进入，舞台中央的「连线对象」身份块就要让位：
    // 否则它会和半透明字幕气泡叠在一起，看着像文字糊成一团
    const hasCaptions = recentTurns.length > 0

    return (
      <main
        style={{
          position: "fixed",
          inset: 0,
          background: "#08090d",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 999,
          overflow: "hidden",
        }}
      >
        {/* 视频或语音舞台背景（高清模拟跨国视频连线画面与音波动效） */}
        {kind === "video" ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "#0b0d14", overflow: "hidden" }}>
            {/* 真实摄像头画面（若有权限）或拟真对方海外视频画面 */}
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                background: "radial-gradient(circle at center, #18223d 0%, #080a11 100%)",
              }}
            >
              {/* 连线网络状态指示 */}
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  left: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(0,0,0,0.5)",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)",
                  fontSize: "0.68rem",
                  color: "#2ed573",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ed573" }} />
                <span>1080P 60fps · 延迟 38ms</span>
              </div>

              {/* 对方视频形象动态卡片（有字幕后上移让位） */}
              <div
                data-peer-info
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: hasCaptions ? "translateY(calc(-24vh - 50px)) scale(0.62)" : "none",
                  opacity: hasCaptions ? 0.65 : 1,
                  transition:
                    "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    background: activeScenario.avatarBg,
                    display: "grid",
                    placeItems: "center",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "#fff",
                    boxShadow: "0 0 40px rgba(47, 108, 246, 0.4)",
                    marginBottom: "16px",
                    position: "relative",
                  }}
                >
                  <span>{activeScenario.peerName.charAt(0)}</span>
                  {/* 发言时波纹扩散圈 */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-10px",
                      borderRadius: "50%",
                      border: "2px solid rgba(47, 108, 246, 0.6)",
                      animation: "pulse 2s infinite ease-out",
                    }}
                  />
                </div>

                <strong style={{ fontSize: "1.15rem", marginBottom: "4px" }}>
                  {activeScenario.peerName}
                </strong>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                  {activeScenario.peerTitle} · {activeScenario.peerLocation}
                </span>
              </div>

              {/* 右上角我方画中画镜头 */}
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: "16px",
                  width: "90px",
                  height: "125px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "#1c202c",
                  border: "2px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                }}
              >
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                    opacity: cameraOn ? 1 : 0.1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    fontSize: "0.62rem",
                    background: "rgba(0,0,0,0.6)",
                    padding: "1px 5px",
                    borderRadius: "4px",
                  }}
                >
                  我
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              background: "radial-gradient(circle at center, #151a28 0%, #08090e 100%)",
            }}
          >
            <div
              data-peer-info
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                transform: hasCaptions ? "translateY(calc(-24vh - 50px)) scale(0.62)" : "none",
                opacity: hasCaptions ? 0.65 : 1,
                transition:
                  "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: activeScenario.avatarBg,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  boxShadow: "0 0 36px rgba(47, 108, 246, 0.4)",
                  position: "relative",
                }}
              >
                <span>{activeScenario.peerName.charAt(0)}</span>
                {/* 语音声波脉冲环 */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-12px",
                    borderRadius: "50%",
                    border: "2px solid rgba(46, 213, 115, 0.5)",
                  }}
                />
              </div>
              <strong style={{ fontSize: "1.2rem", letterSpacing: "0.02em" }}>
                {activeScenario.peerName}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                {activeScenario.peerTitle} · 语音同传连线中
              </span>
            </div>
          </div>
        )}

        {/* 顶部状态栏 */}
        <header
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "calc(0.8rem + env(safe-area-inset-top, 0px)) 1.2rem 0.6rem",
            background: "linear-gradient(rgba(0,0,0,0.7), transparent)",
          }}
        >
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              fontSize: "0.76rem",
              fontWeight: 650,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{meName} ⇄ {themName}</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ color: "#2ed573" }}>{activeScenario.title}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {demoPlaying && (
              <button
                onClick={cycleScenario}
                aria-label="切换演示连线对象"
                title={`切换演示连线对象（当前：${activeScenario.title}）`}
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Icon name="swap" size={12} />
              </button>
            )}
            <button
              onClick={() => {
                setDemoPlaying((p) => !p)
                toast(!demoPlaying ? "已恢复实际演示" : "已暂停实际演示")
              }}
              style={{
                background: demoPlaying ? "rgba(46, 213, 115, 0.2)" : "rgba(255,255,255,0.15)",
                border: demoPlaying ? "1px solid #2ed573" : "1px solid rgba(255,255,255,0.2)",
                color: demoPlaying ? "#2ed573" : "#fff",
                fontSize: "0.7rem",
                fontWeight: 650,
                padding: "3px 8px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              {demoPlaying ? "演示中" : "暂停演示"}
            </button>
            <b style={{ fontSize: "0.95rem", fontVariantNumeric: "tabular-nums" }}>{mmss(seconds)}</b>
          </div>
        </header>

        {/* 中下部：双语流式实时字幕气泡（绝不空着） */}
        <div
          data-captions
          style={{
            position: "relative",
            zIndex: 3,
            // 顶住上方空白：字幕固定在快捷回复条之上，而不是漂在屏幕正中
            marginTop: "auto",
            padding: "0 1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "36vh",
            overflowY: "auto",
          }}
        >
          {recentTurns.map((turn, i) => (
            <div
              key={i}
              style={{
                alignSelf: turn.who === "me" ? "flex-end" : "flex-start",
                maxWidth: "88%",
                padding: "8px 12px",
                borderRadius: "14px",
                background:
                  turn.who === "me"
                    ? "rgba(47, 108, 246, 0.9)"
                    : "rgba(20, 22, 28, 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: "0.72rem", opacity: 0.75, marginBottom: "2px" }}>
                {turn.who === "me" ? "我方发言" : `${activeScenario.peerName} [原声]`}
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 650, marginBottom: "2px" }}>
                {turn.original}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: turn.who === "me" ? "rgba(255,255,255,0.88)" : "#2ed573",
                  fontWeight: 500,
                }}
              >
                {turn.who === "them" ? `🎧 耳机译文：${turn.translated}` : `🌐 同传译文：${turn.translated}`}
              </div>
            </div>
          ))}

          {live.interim && (
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "85%",
                padding: "8px 12px",
                borderRadius: "14px",
                background: "rgba(47, 108, 246, 0.45)",
                backdropFilter: "blur(10px)",
                fontSize: "0.9rem",
              }}
            >
              <span>{live.interim}</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "6px" }}>翻译中...</span>
            </div>
          )}

          {turns.length === 0 && !live.interim && (
            <div
              style={{
                alignSelf: "center",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(10px)",
                fontSize: "0.8rem",
                color: "#2ed573",
              }}
            >
              🎙️ 正在进行与 {activeScenario.peerName} 的同传通话连线...
            </div>
          )}
        </div>

        {/* 底部快捷回复栏：让用户随时一键体验插话回复同传 */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            padding: "6px 1.2rem 0",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {activeScenario.quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(reply)}
              style={{
                padding: "5px 10px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: "0.72rem",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              💬 {reply}
            </button>
          ))}
        </div>

        {/* 底部经典通话控制栏 */}
        <footer
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "1rem 1.5rem calc(1.3rem + env(safe-area-inset-bottom, 0px))",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          {/* 麦克风开关 */}
          <button
            onClick={() => {
              setMicOn((m) => {
                if (m) live.stop()
                else live.start("auto")
                return !m
              })
              playEarcon("toggle")
            }}
            title={micOn ? "静音" : "开启麦克风"}
            style={{
              width: "3.2rem",
              height: "3.2rem",
              borderRadius: "50%",
              background: micOn ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
              border: "none",
              color: micOn ? "#fff" : "rgba(255,255,255,0.4)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="mic" size={20} />
          </button>

          {/* 摄像头开关（仅视频） */}
          {kind === "video" && (
            <button
              onClick={() => {
                setCameraOn((c) => {
                  if (c) closeCamera()
                  else openCamera()
                  return !c
                })
                playEarcon("toggle")
              }}
              title={cameraOn ? "关闭摄像头" : "开启摄像头"}
              style={{
                width: "3.2rem",
                height: "3.2rem",
                borderRadius: "50%",
                background: cameraOn ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                border: "none",
                color: cameraOn ? "#fff" : "rgba(255,255,255,0.4)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <Icon name="video" size={20} />
            </button>
          )}

          {/* 最小化为悬浮窗 */}
          <button
            onClick={() => {
              playEarcon("toggle")
              setView("home")
              setFloatingActive(true)
            }}
            title="最小化为悬浮窗"
            style={{
              width: "3.2rem",
              height: "3.2rem",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "none",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="device" size={20} />
          </button>

          {/* 红色挂断按钮 */}
          <button
            onClick={stopCall}
            title="结束通话"
            style={{
              width: "3.8rem",
              height: "3.8rem",
              borderRadius: "50%",
              background: "#ff4757",
              border: "none",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(255, 71, 87, 0.4)",
            }}
          >
            <Icon name="close" size={24} />
          </button>
        </footer>
      </main>
    )
  }

  /* ---------------- 3. 通话结束结算页 ---------------- */
  return (
    <main className="tab-page" style={{ padding: "2rem 1.15rem", minHeight: "100dvh" }}>
      <section
        style={{
          marginTop: "2rem",
          padding: "24px 18px",
          textAlign: "center",
          borderRadius: "20px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(46, 213, 115, 0.16)",
            color: "#2ed573",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon name="check" size={28} />
        </div>
        <h2 style={{ fontSize: "1.3rem", margin: "0 0 6px", color: "var(--ink)" }}>通话已结束</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 20px" }}>
          与 {activeScenario.peerName} · 时长 {mmss(seconds)} · 同传 {turns.length} 轮发言已自动归档
        </p>

        {/* 通话对白简要回顾 */}
        {turns.length > 0 && (
          <div
            style={{
              textAlign: "left",
              background: "var(--surface-soft)",
              borderRadius: "14px",
              padding: "12px",
              marginBottom: "20px",
              maxHeight: "180px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              border: "1px solid var(--line)",
            }}
          >
            {turns.slice(0, 3).map((t, idx) => (
              <div key={idx} style={{ fontSize: "0.78rem" }}>
                <span style={{ fontWeight: 700, color: t.who === "me" ? "var(--teal, #2f6cf6)" : "#2ed573" }}>
                  {t.who === "me" ? "我方" : activeScenario.peerName}：
                </span>
                <span style={{ color: "var(--ink)" }}>{t.original}</span>
              </div>
            ))}
          </div>
        )}

        <AppButton
          onClick={() => {
            setView("home")
            setFloatingActive(false)
          }}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: "14px",
            background: "linear-gradient(135deg, var(--teal, #2f6cf6), #1b4bcf)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: "0 6px 20px rgba(47, 108, 246, 0.3)",
          }}
        >
          完成
        </AppButton>
      </section>
    </main>
  )
}

export default CallTranslate
