import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, useLangPair } from "@/lib/core"
import { downloadText, useSavedRecords } from "@/lib/store"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"
import { useLiveTranslate } from "@/lib/useLiveTranslate"
import { playEarcon } from "@/lib/earcon"

type Caption = { src: string; dst: string; at: number }
type SourceType = "demo" | "mic" | "internal"

function srtTime(ms: number): string {
  const t = Math.max(0, Math.round(ms))
  const pad = (n: number, w = 2) => String(n).padStart(w, "0")
  return `${pad(Math.floor(t / 3600000))}:${pad(Math.floor((t % 3600000) / 60000))}:${pad(
    Math.floor((t % 60000) / 1000),
  )},${pad(t % 1000, 3)}`
}

function mmss(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export type MediaScenario = {
  id: string
  title: string
  category: string
  durationText: string
  coverGradient: string
  accentColor: string
  badge: string
  lines: Array<{ src: string; dst: string }>
}

/** 4大精选实际外语媒体演示剧本 */
export const MEDIA_SCENARIOS: MediaScenario[] = [
  {
    id: "movie",
    title: "《星际穿越 · 极境探索》经典原声",
    category: "影视对白",
    durationText: "01:15",
    coverGradient: "linear-gradient(135deg, #181938 0%, #0d0e1c 100%)",
    accentColor: "#6c5ce7",
    badge: "4K 杜比原声",
    lines: [
      {
        src: "Do you believe it? We actually made it across the wormhole.",
        dst: "你能相信吗？我们真的成功穿过了虫洞。",
      },
      {
        src: "Look over there — I've never seen anything like this accretion disk.",
        dst: "看那边——我从未见过如此壮丽的吸积盘。",
      },
      {
        src: "Time runs differently here; every hour equals seven years on Earth.",
        dst: "这里的时间流速完全不同；这里的每一个小时等于地球上的整整七年。",
      },
      {
        src: "We don't have much time, we have to collect the telemetry and depart.",
        dst: "我们时间不多了，必须尽快收集完遥测数据立刻返航。",
      },
      {
        src: "Nature is resilient, and love is the one thing that transcends dimensions.",
        dst: "大自然生生不息，而爱是唯一能够超越维度界限的力量。",
      },
    ],
  },
  {
    id: "keynote",
    title: "《AI 神经同传技术演进》发布会演讲",
    category: "科技发布会",
    durationText: "01:20",
    coverGradient: "linear-gradient(135deg, #09203f 0%, #061224 100%)",
    accentColor: "#2ed573",
    badge: "TED 原声演讲",
    lines: [
      {
        src: "Today, we are thrilled to introduce zero-latency neural translation.",
        dst: "今天，我们极其激动地发布端侧零延迟神经同传技术。",
      },
      {
        src: "With on-device edge models, total stream latency drops below 60 milliseconds.",
        dst: "通过端侧轻量化边缘模型，系统流式延迟成功降低至60毫秒以内。",
      },
      {
        src: "You can watch any foreign keynote, stream, or lecture seamlessly.",
        dst: "无论观看任何海外发布会、在线公开课还是直播，都能无缝理解。",
      },
      {
        src: "Let us experience a real-time live demonstration on mobile hardware now.",
        dst: "现在，让我们在移动设备上亲身体验这场实况双语同传演示。",
      },
    ],
  },
  {
    id: "documentary",
    title: "《深蓝秘境：深海发光奇观》纪录片",
    category: "自然纪录片",
    durationText: "01:10",
    coverGradient: "linear-gradient(135deg, #0a3d62 0%, #061c2d 100%)",
    accentColor: "#00d2d3",
    badge: "BBC 纪实原声",
    lines: [
      {
        src: "In the deepest trenches of the Pacific, sunlight has never reached.",
        dst: "在太平洋最深邃的海沟中，阳光从未触及过这片幽深海域。",
      },
      {
        src: "Yet here, hydrothermal vents create an extraordinary cradle of life.",
        dst: "然而在热液喷口周围，却孕育出了令人惊叹的生命繁衍奇迹。",
      },
      {
        src: "Bioluminescent creatures illuminate the abyssal darkness with soft glow.",
        dst: "发光生物用柔和的幽蓝荧光，点亮了这片万古永恒的漆黑深海。",
      },
      {
        src: "Every observation here rewrites our understanding of living organisms.",
        dst: "这里的每一项全新发现，都在不断重塑人类对生命奥秘的认知。",
      },
    ],
  },
  {
    id: "podcast",
    title: "《全球科技前沿对话：无感智能》播客",
    category: "商业访谈",
    durationText: "01:30",
    coverGradient: "linear-gradient(135deg, #2d132c 0%, #150a16 100%)",
    accentColor: "#f368e0",
    badge: "海外播客精选",
    lines: [
      {
        src: "Welcome back to the Global Dialogue podcast. Great to have you with us.",
        dst: "欢迎回到《全球科技视野》播客，非常高兴与大家再次相聚。",
      },
      {
        src: "How do you foresee wearable audio transforming human language barriers?",
        dst: "您如何看待穿戴式智能音频设备彻底消除人类语言隔阂的前景？",
      },
      {
        src: "The most powerful interface is the one that disappears into everyday life.",
        dst: "最强大的交互界面，恰恰是自然融入日常生活、让人感知不到的存在。",
      },
      {
        src: "That is why lightweight smart earbuds represent the definitive future.",
        dst: "这也正是极简无感智能耳机所代表的必然未来走向。",
      },
    ],
  },
]

export function WatchMode({ onClose }: { onClose: () => void }) {
  const { me, them, setMe, setThem } = useLangPair()
  const [running, setRunning] = useState(false)
  const [sourceType, setSourceType] = useState<SourceType>("demo") // demo: 实际演示片源 | mic: 外部设备 | internal: 本机播放
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("movie")
  const [autoSpeak, setAutoSpeak] = useState(false) // 耳机轻声播报
  const [floating, setFloating] = useState(false) // 悬浮窗模式
  const [caps, setCaps] = useState<Caption[]>([])
  const [picker, setPicker] = useState<"src" | "dst" | null>(null)
  const [seconds, setSeconds] = useState(0)

  const [, addRecord] = useSavedRecords()
  const startRef = useRef(0)
  const tickRef = useRef<number | null>(null)
  const demoTimerRef = useRef<number | null>(null)
  const demoIndexRef = useRef(0)

  // 源语言 = 媒体影片原声 (默认 them/外语)，目标语言 = 译文字幕 (默认 me/母语)
  const srcLang: LangId = them
  const dstLang: LangId = me

  const activeScenario = MEDIA_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? MEDIA_SCENARIOS[0]

  // 麦克风真实流式环境拾音与同传
  const live = useLiveTranslate({
    meLang: dstLang,
    themLang: srcLang,
    autoSpeak,
    mode: "auto",
    onTurn: (turn) => {
      setCaps((prev) => [
        ...prev,
        {
          src: turn.who === "them" ? turn.original : turn.translated,
          dst: turn.who === "them" ? turn.translated : turn.original,
          at: Date.now() - startRef.current,
        },
      ])
      playEarcon("success")
    },
  })

  useEscapeKey(() => {
    if (picker) setPicker(null)
    else if (floating) setFloating(false)
    else onClose()
  })

  // 计时器与实际演示媒体字幕流
  useEffect(() => {
    if (!running) {
      if (tickRef.current) window.clearInterval(tickRef.current)
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current)
      return
    }

    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)

    // 如果处于演示模式（或真实拾音模式下辅助演示）
    if (sourceType === "demo") {
      const scriptLines = activeScenario.lines
      const feedNextLine = () => {
        if (demoIndexRef.current < scriptLines.length) {
          const item = scriptLines[demoIndexRef.current]
          setCaps((prev) => [
            ...prev,
            {
              src: item.src,
              dst: item.dst,
              at: Date.now() - startRef.current,
            },
          ])
          playEarcon("success")
          demoIndexRef.current += 1
          demoTimerRef.current = window.setTimeout(feedNextLine, 3200)
        } else {
          // 循环回放演示
          demoIndexRef.current = 0
          demoTimerRef.current = window.setTimeout(feedNextLine, 3600)
        }
      }

      demoTimerRef.current = window.setTimeout(feedNextLine, 1200)
    }

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current)
    }
  }, [running, sourceType, activeScenario])

  const liveRef = useRef(live)
  liveRef.current = live

  // 组件卸载时释放拾音与浮窗状态
  useEffect(() => {
    return () => {
      liveRef.current.stop()
      if (tickRef.current) window.clearInterval(tickRef.current)
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current)
    }
  }, [])

  const startDemoPlayback = (scenario?: MediaScenario) => {
    if (scenario) setSelectedScenarioId(scenario.id)
    setSourceType("demo")
    setCaps([])
    setSeconds(0)
    demoIndexRef.current = 0
    startRef.current = Date.now()
    setRunning(true)
    playEarcon("ready")
    toast(`已开始播放【${(scenario ?? activeScenario).title}】同传演示`)
  }

  const toggleRunning = () => {
    if (running) {
      playEarcon("toggle")
      live.stop()
      setRunning(false)
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current)
      if (caps.length > 0) {
        toast(`已停止同传 · 共捕获 ${caps.length} 句字幕`)
      }
    } else {
      playEarcon("ready")
      setCaps([])
      setSeconds(0)
      demoIndexRef.current = 0
      startRef.current = Date.now()
      setRunning(true)

      if (sourceType === "demo") {
        toast(`开始播放【${activeScenario.title}】实际演示`)
      } else if (sourceType === "internal") {
        setFloating(true)
        toast("已开启本机内录悬浮窗，切换至播放器即可边看视频边看字幕")
        live.start("auto")
      } else {
        toast("已开启麦克风环境拾音")
        live.start("auto")
      }
    }
  }

  const exportSrt = () => {
    if (caps.length === 0) return
    const content = caps
      .map((cap, i) => {
        const end = caps[i + 1]?.at ?? cap.at + 2500
        return `${i + 1}\n${srtTime(cap.at)} --> ${srtTime(end)}\n${cap.dst}\n${cap.src}\n`
      })
      .join("\n")

    downloadText(`LingoPods-同传字幕-${activeScenario.title}.srt`, content)
    toast("字幕 SRT 文件已导出")
  }

  const saveToRecords = () => {
    if (caps.length === 0) return
    const modeDesc =
      sourceType === "demo"
        ? `实测演示: ${activeScenario.title}`
        : sourceType === "internal"
          ? "本机播放内录"
          : "外部设备拾音"
    addRecord({
      title: `媒体同传 (${modeDesc}) · ${langOption(srcLang).native} ➔ ${langOption(dstLang).native}`,
      meta: `${langOption(srcLang).native} → ${langOption(dstLang).native}`,
      summary: `时长 ${mmss(seconds)} · 共 ${caps.length} 句字幕`,
      type: "观影",
      lines: caps.map((c) => ({
        speaker: "原声",
        original: c.src,
        translated: c.dst,
      })),
    })
    toast("已保存到【翻译记录】")
  }

  const clearCaps = () => {
    setCaps([])
    setSeconds(0)
    demoIndexRef.current = 0
    toast("字幕已清空")
  }

  const latestCap = caps[caps.length - 1]
  const prevCap = caps[caps.length - 2]
  /** 底部辅助操作：悬浮窗 / 存记录 / 导字幕 / 清空 */
  const auxActions = [
    { key: "float", icon: "device" as const, label: "悬浮窗", onTap: () => setFloating(true), ready: true },
    { key: "save", icon: "check" as const, label: "存记录", onTap: saveToRecords, ready: caps.length > 0 },
    { key: "srt", icon: "notes" as const, label: "导字幕", onTap: exportSrt, ready: caps.length > 0 },
    { key: "clear", icon: "close" as const, label: "清空", onTap: clearCaps, ready: caps.length > 0 },
  ]

  /** 声音来源三选一（开始后锁定，避免中途换源导致拾音链路错位）
      三个标签统一 4 字，窄屏不会折行 */
  const sourceTabs = (
    [
      { id: "demo" as SourceType, label: "外语片源", icon: "sparkles" as const },
      { id: "mic" as SourceType, label: "外放拾音", icon: "monitor" as const },
      { id: "internal" as SourceType, label: "本机播放", icon: "device" as const },
    ] as const
  ).map((tab) => {
    const isCur = sourceType === tab.id
    return (
      <button
        key={tab.id}
        onClick={() => {
          setSourceType(tab.id)
          playEarcon("toggle")
        }}
        style={{
          padding: "8px 4px",
          borderRadius: "11px",
          border: "none",
          cursor: "pointer",
          background: isCur ? "var(--teal, #2f6cf6)" : "transparent",
          color: isCur ? "#fff" : "var(--muted)",
          fontSize: "0.78rem",
          fontWeight: 650,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          transition: "all 0.18s ease",
        }}
      >
        <Icon name={tab.icon} size={14} />
        <span>{tab.label}</span>
      </button>
    )
  })

  /** 有字幕就保留舞台（冻结态），避免一按停止就把刚抓到的内容丢掉 */
  const showStage = running || caps.length > 0

  return (
    <main
      className="tab-page"
      style={{ paddingBottom: showStage ? "9.5rem" : "3rem", minHeight: "100dvh" }}
    >
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
          <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>媒体同传</h1>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
            {running ? `正在同传中 · ${mmss(seconds)}` : "外语视频 / 播客实时字幕"}
          </span>
        </div>

        {/* 耳机轻声播报开关 */}
        <button
          onClick={() => {
            setAutoSpeak((s) => !s)
            playEarcon("toggle")
            toast(autoSpeak ? "已关闭耳机播报（纯字幕模式）" : "已开启耳机轻声同传播报")
          }}
          style={{
            padding: "6px 10px",
            borderRadius: "20px",
            border: autoSpeak ? "1px solid #2ed573" : "1px solid var(--line)",
            background: autoSpeak ? "rgba(46, 213, 115, 0.12)" : "var(--surface)",
            color: autoSpeak ? "#2ed573" : "var(--muted)",
            fontSize: "0.74rem",
            fontWeight: 650,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <Icon name="headphones" size={14} />
          <span>{autoSpeak ? "耳机已播报" : "仅字幕"}</span>
        </button>
      </header>

      {/* 声音来源三选一 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
          margin: "0.4rem 1.15rem 0.6rem",
          padding: "3px",
          borderRadius: "14px",
          background: "var(--surface-soft)",
          border: "1px solid var(--line)",
          opacity: running ? 0.45 : 1,
          pointerEvents: running ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        {sourceTabs}
      </div>

      {/* 语言选择卡片：媒体声音 ➔ 我的字幕 */}
      <section
        style={{
          margin: "0 1.15rem 0.8rem",
          padding: "0.75rem 1rem",
          borderRadius: "16px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setPicker("src")}
            disabled={running}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "4px 6px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              cursor: running ? "default" : "pointer",
              textAlign: "left",
            }}
          >
            <small style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "2px" }}>媒体原声</small>
            <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
              {langOption(srcLang).native}
            </strong>
          </button>

          <button
            aria-label="交换语言"
            disabled={running}
            onClick={() => {
              const prevThem = them
              setThem(me)
              setMe(prevThem)
              playEarcon("toggle")
            }}
            style={{
              width: "2.1rem",
              height: "2.1rem",
              borderRadius: "50%",
              background: "var(--surface-soft)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              color: "var(--teal, #2f6cf6)",
              cursor: running ? "default" : "pointer",
              opacity: running ? 0.4 : 1,
            }}
          >
            <Icon name="swap" size={14} />
          </button>

          <button
            onClick={() => setPicker("dst")}
            disabled={running}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              padding: "4px 6px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              cursor: running ? "default" : "pointer",
              textAlign: "right",
            }}
          >
            <small style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "2px" }}>字幕译文</small>
            <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
              {langOption(dstLang).native}
            </strong>
          </button>
        </div>
      </section>

      {/* 开始前只给一张极简启动卡；字幕舞台与演示片源切换一律收进开始之后 */}
      {!showStage ? (
        <section
          style={{
            margin: "0 1.15rem",
            padding: "1.75rem 1.15rem",
            borderRadius: "20px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              margin: "0 auto 14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(47, 108, 246, 0.1)",
              color: "var(--teal, #2f6cf6)",
            }}
          >
            <Icon name="headphones" size={26} />
          </div>

          <strong style={{ display: "block", fontSize: "1.05rem", color: "var(--ink)", marginBottom: "6px" }}>
            戴上耳机，边看边听
          </strong>
          <p
            style={{
              margin: "0 auto 20px",
              maxWidth: "18rem",
              fontSize: "0.78rem",
              lineHeight: 1.65,
              color: "var(--muted)",
            }}
          >
            {sourceType === "demo"
              ? "一键起播外语片源，实时生成双语大字幕，耳机可轻声播报译文。"
              : sourceType === "internal"
                ? "开启后切到任意视频 App，字幕会以悬浮窗方式实时跟随。"
                : "把手机放在电脑或电视旁，自动拾取外放声音生成字幕。"}
          </p>

          <AppButton
            onClick={toggleRunning}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: "16px",
              background: "var(--teal, #2f6cf6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(47, 108, 246, 0.3)",
            }}
          >
            <Icon name="play" size={18} />
            <span>{sourceType === "internal" ? "开始同传并开启悬浮窗" : "开始同传"}</span>
          </AppButton>
        </section>
      ) : (
        <section
          style={{
            margin: "0 1.15rem",
            minHeight: "300px",
            borderRadius: "20px",
            background: "linear-gradient(180deg, #101218 0%, #080a0e 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 顶部实时状态条 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: running ? "#2ed573" : "rgba(255,255,255,0.25)",
                  boxShadow: running ? "0 0 10px #2ed573" : "none",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.74rem",
                  color: running ? "#2ed573" : "rgba(255,255,255,0.5)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {!running
                  ? `已停止 · 共 ${caps.length} 句`
                  : sourceType === "demo"
                    ? activeScenario.title
                    : sourceType === "internal"
                      ? "本机音频内录中"
                      : "正在拾音转写"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {caps.length > 0 && (
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                  共 {caps.length} 句
                </span>
              )}
              {running && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#2ed573",
                    background: "rgba(46, 213, 115, 0.15)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* 字幕内容区 */}
          <div style={{ margin: "auto 0", padding: "14px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {prevCap && (
                <div style={{ opacity: 0.45 }}>
                  <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", marginBottom: "2px" }}>
                    {prevCap.dst}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{prevCap.src}</div>
                </div>
              )}

              {latestCap && (
                <div style={{ animation: "fadeIn 0.25s ease-out" }}>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: "1.35",
                      marginBottom: "4px",
                    }}
                  >
                    {latestCap.dst}
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "#2ed573", fontWeight: 500 }}>{latestCap.src}</div>
                </div>
              )}

              {!latestCap && !live.interim && (
                <div
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.85rem",
                    padding: "28px 0",
                  }}
                >
                  {sourceType === "demo" ? "字幕流即将开始..." : "正在拾音，字幕会实时出现在这里"}
                </div>
              )}

              {live.interim && (
                <div style={{ color: "#5a8ef6", fontSize: "0.92rem" }}>
                  <span>{live.interim}</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "6px" }}>...</span>
                </div>
              )}
            </div>
          </div>

          {/* 演示片源切换：只有真的在跑「实际演示片源」时才出现 */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "8px",
              scrollbarWidth: "none",
              visibility: sourceType === "demo" ? "visible" : "hidden",
            }}
          >
            {MEDIA_SCENARIOS.map((sc) => {
              const isCur = sc.id === activeScenario.id
              return (
                <button
                  key={sc.id}
                  onClick={() => startDemoPlayback(sc)}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "8px",
                    border: isCur ? `1px solid ${sc.accentColor}` : "1px solid rgba(255,255,255,0.12)",
                    background: isCur ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                    color: isCur ? "#fff" : "rgba(255,255,255,0.7)",
                    fontSize: "0.7rem",
                    fontWeight: isCur ? 700 : 500,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {sc.category}
                </button>
              )
            })}
          </div>

          {/* 底部实时音波进度 */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(20, (seconds % 4) * 25 + 15))}%`,
                background: activeScenario.accentColor,
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </section>
      )}

      {/* 底部控制栏：只要舞台还在（含停止后的冻结态）就保留 */}
      {showStage && (
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0.8rem 1.15rem calc(1rem + env(safe-area-inset-bottom, 0px))",
            background: "linear-gradient(transparent, var(--paper) 35%)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <AppButton
            onClick={toggleRunning}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: "16px",
              background: running ? "#ff4757" : "var(--teal, #2f6cf6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.05rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              boxShadow: running
                ? "0 8px 24px rgba(255, 71, 87, 0.35)"
                : "0 8px 24px rgba(47, 108, 246, 0.35)",
            }}
          >
            <Icon name={running ? "pause" : "play"} size={20} />
            <span>{running ? "停止同传" : "重新开始"}</span>
          </AppButton>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {auxActions.map((action) => (
              <button
                key={action.key}
                onClick={action.onTap}
                disabled={!action.ready}
                style={{
                  padding: "9px 4px",
                  borderRadius: "12px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  color: action.ready ? "var(--ink)" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: action.ready ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  opacity: action.ready ? 1 : 0.45,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              >
                <Icon name={action.icon} size={15} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </footer>
      )}

      {/* 悬浮窗模式（边刷其他内容边看字幕） */}
      {floating && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "14px",
            right: "14px",
            background: "rgba(18, 20, 26, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "18px",
            padding: "12px 14px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(47, 108, 246, 0.35)",
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
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
                {sourceType === "demo"
                  ? `演示悬浮窗 · ${activeScenario.title}`
                  : sourceType === "internal"
                    ? "本机同传悬浮窗"
                    : "媒体同传悬浮窗"}{" "}
                · {mmss(seconds)}
              </strong>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setFloating(false)}
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
                onClick={() => {
                  toggleRunning()
                  setFloating(false)
                }}
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
                停止
              </button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px 10px" }}>
            {live.interim ? (
              <span style={{ color: "#5a8ef6", fontSize: "0.85rem" }}>{live.interim}</span>
            ) : latestCap ? (
              <div>
                <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block" }}>{latestCap.dst}</strong>
                <span style={{ color: "#2ed573", fontSize: "0.78rem" }}>{latestCap.src}</span>
              </div>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                {sourceType === "demo"
                  ? "🎙️ 演示已就绪，正在实时推送双语字幕..."
                  : sourceType === "internal"
                    ? "🎙️ 悬浮窗已就绪，切至视频 App 播放即可实时出字幕..."
                    : "🎙️ 正在拾音中..."}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 语言选择弹窗 */}
      <LangPicker
        open={picker !== null}
        title={picker === "dst" ? "字幕译文语言" : "媒体原声语言"}
        value={picker === "dst" ? dstLang : srcLang}
        onPick={(id) => {
          if (picker === "dst") setMe(id)
          else setThem(id)
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />
    </main>
  )
}

export default WatchMode
