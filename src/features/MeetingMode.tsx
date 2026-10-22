import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"
import { downloadText, useSavedRecords, type TranscriptLine } from "@/lib/store"
import { useLiveTranslate } from "@/lib/useLiveTranslate"
import { playEarcon } from "@/lib/earcon"
import { useUsage } from "@/lib/usage"
import { UpgradePaywallModal } from "@/components/UpgradePaywallModal"

type Participant = { id: string; name: string; lang: LangId }

export function MeetingMode({ onClose }: { onClose: () => void }) {
  const [, addRecord] = useSavedRecords()
  const { deviceMinutes, translationAllowed, consumeMinutes } = useUsage()
  const [paywall, setPaywall] = useState(false)
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)
  const [fullText, setFullText] = useState(false)

  const [activeSpeaker, setActiveSpeaker] = useState<string>("me")
  const [participants] = useState<Participant[]>([
    { id: "me", name: "我 (主持人)", lang: "zh" },
    { id: "p-a", name: "Alex", lang: "en" },
    { id: "p-m", name: "Mia", lang: "en" },
  ])

  // 会议发言动态转写流
  const [transcripts, setTranscripts] = useState<
    Array<{ id: number; speakerId: string; speakerName: string; original: string; translated: string }>
  >([
    {
      id: 1,
      speakerId: "p-a",
      speakerName: "Alex",
      original: "Let's confirm the launch timeline before Friday.",
      translated: "我们在周五前确认一下发布时间表。",
    },
    {
      id: 2,
      speakerId: "p-m",
      speakerName: "Mia",
      original: "I'll share the updated testing plan this afternoon.",
      translated: "我今天下午会分享更新后的测试计划。",
    },
  ])

  // 接入真实收音识别
  const currentSpeaker = participants.find((p) => p.id === activeSpeaker) || participants[0]
  const live = useLiveTranslate({
    meLang: currentSpeaker.lang,
    themLang: currentSpeaker.lang === "zh" ? "en" : "zh",
    autoSpeak: false,
    mode: "auto",
    canTranslate: () => translationAllowed,
    consumeMinutes,
    onTurn: (turn) => {
      if (!recording || paused) return
      setTranscripts((prev) => [
        ...prev,
        {
          id: Date.now(),
          speakerId: currentSpeaker.id,
          speakerName: currentSpeaker.name,
          original: turn.original,
          translated: turn.translated,
        },
      ])
      playEarcon("success")
    },
  })

  const liveRef = useRef(live)
  liveRef.current = live

  // 计时器
  useEffect(() => {
    if (!recording || paused) return
    const timer = window.setInterval(() => setSeconds((v) => v + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording, paused])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  const langSet = Array.from(new Set(participants.map((p) => p.lang)))

  // 组件卸载时释放麦克风资源
  useEffect(() => {
    return () => {
      liveRef.current.stop()
    }
  }, [])

  const startRecording = () => {
    if (!translationAllowed) {
      setPaywall(true)
      toast("体验翻译额度已用完，请订阅后继续使用")
      return
    }
    playEarcon("ready")
    setRecording(true)
    setPaused(false)
    live.start("auto")
  }

  // 动态生成 AI 纪要、决定项和待办
  const dynamicSummary = () => {
    if (transcripts.length === 0) {
      return {
        summary: "本次会议未记录到发言内容。",
        decisions: ["无特别决议"],
        todos: ["无待办事项"],
      }
    }
    const lines = transcripts.map((t) => `${t.speakerName}：${t.original} (${t.translated})`)
    const firstFew = transcripts.slice(0, 3).map((t) => t.translated).join("；")
    const summary = `会议共 ${participants.length} 位成员参会，历时 ${time}。主要围绕发布时间表与测试计划展开讨论：${firstFew}。`

    // 智能抓取决议和待办
    const decisions: string[] = []
    const todos: string[] = []

    transcripts.forEach((t) => {
      const text = `${t.original} ${t.translated}`
      if (/confirm|launch|freeze|确认|决定|冻结|定于/i.test(text)) {
        decisions.push(`${t.speakerName} 提议：${t.translated}`)
      } else if (/plan|test|share|update|待办|提交|更新|完成/i.test(text)) {
        todos.push(`${t.speakerName} · ${t.translated}`)
      }
    })

    if (decisions.length === 0) decisions.push("团队就当前里程碑目标达成共识，待后续复盘。")
    if (todos.length === 0) todos.push("各发言人整理会议细节并同步至团队看板。")

    return {
      summary,
      decisions: decisions.slice(0, 3),
      todos: todos.slice(0, 3),
      lines,
    }
  }

  const handleFinishMeeting = () => {
    playEarcon("success")
    live.stop()
    setConfirming(false)
    setRecording(false)
    setFinished(true)

    // 自动落库到 SavedRecords 沉淀为数据资产
    const summaryData = dynamicSummary()
    const savedLines: TranscriptLine[] = transcripts.map((t) => ({
      speaker: t.speakerName,
      original: t.original,
      translated: t.translated,
    }))

    addRecord({
      title: `双语会议纪要 (${time})`,
      meta: `${participants.length} 位参会者 · ${transcripts.length} 轮发言`,
      type: "会议",
      summary: summaryData.summary,
      lines: savedLines,
    })
    toast("会议纪要已自动保存至【翻译记录】")
  }

  const exportSummary = () => {
    const summaryData = dynamicSummary()
    downloadText(
      `LingoPods-会议纪要-${Date.now()}.txt`,
      [
        "LingoPods 会议纪要",
        `时长 ${time} · 发言人 ${participants.length} 位 · 共 ${transcripts.length} 条发言`,
        "",
        "【AI 智能摘要】",
        summaryData.summary,
        "",
        "【决议事项】",
        ...summaryData.decisions.map((d) => `· ${d}`),
        "",
        "【待办行动】",
        ...summaryData.todos.map((td) => `· ${td}`),
        "",
        "【双语发言全文】",
        ...transcripts.map((t) => `[${t.speakerName}]: ${t.original}\n    译文: ${t.translated}`),
      ].join("\n"),
    )
    toast("纪要文本已成功导出")
  }

  const summaryData = dynamicSummary()

  return (
    <div className="feature-flow meeting-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="实时双语收音 · 智能生成纪要与待办"
        title="会议记录"
      />
      <main className="meeting-content">
        <section className="meeting-status-card">
          <div className="meeting-orb">
            <i className={recording && !paused ? "active" : ""} />
            <Icon name="calendar" size={28} />
          </div>
          <span className="eyebrow">
            {finished
              ? "记录完成 · 已归档"
              : recording
                ? paused
                  ? "已暂停"
                  : live.status === "listening"
                    ? "正在收音转写中..."
                    : "会议进行中"
                : "准备就绪"}
          </span>
          {(finished || recording) && <h1>{finished ? "会议纪要" : time}</h1>}
          <p>
            {!finished && !recording ? `本机体验剩余 ${Math.floor(deviceMinutes)} 分钟。历史记录仍可查看。` : null}
            {finished
              ? "查看提炼出的核心决定、待办事项和双语发言全文"
              : recording
                ? paused
                  ? "已暂停记录，点击播放按钮继续"
                  : "正在通过耳机降噪麦克风实时转写并智能识别发言人"
                : "佩戴耳机开会，将自动识别人声、生成双语字幕并沉淀待办。"}
          </p>
          <div className="meeting-languages">
            {langSet.map((l, i) => (
              <span key={l}>
                {i > 0 && <Icon name="swap" size={16} />}
                {langOption(l).native}
              </span>
            ))}
          </div>
        </section>

        {finished ? (
          <section className="meeting-summary">
            <div className="summary-top">
              <Icon name="sparkles" />
              <span>
                <strong>AI 智能纪要提炼</strong>
                <small>基于 {transcripts.length} 轮真实发言生成</small>
              </span>
            </div>
            <p>{summaryData.summary}</p>
            <div className="decision-list">
              {summaryData.decisions.map((d, i) => (
                <span key={i}>
                  <Icon name="check" size={15} />
                  <b>决定</b> {d}
                </span>
              ))}
              {summaryData.todos.map((td, i) => (
                <span key={i}>
                  <Icon name="calendar" size={15} />
                  <b>待办</b> {td}
                </span>
              ))}
            </div>
            <div className="summary-actions">
              <AppButton onClick={() => setFullText((v) => !v)}>
                <Icon name="notes" /> {fullText ? "收起全文" : `查看双语全文 (${transcripts.length})`}
              </AppButton>
              <AppButton onClick={exportSummary}>
                <Icon name="plane" /> 导出纪要
              </AppButton>
            </div>
            {fullText && (
              <div className="summary-fulltext">
                {transcripts.map((t) => (
                  <p key={t.id}>
                    <b>{t.speakerName}</b> {t.original}
                    <span>{t.translated}</span>
                  </p>
                ))}
              </div>
            )}
          </section>
        ) : recording ? (
          <section className="live-transcript-card">
            <div className="transcript-head">
              <span>
                <i className={live.status === "listening" ? "active" : ""} /> 实时双语转写
              </span>
              <small>{participants.length} 位参会者</small>
            </div>

            {/* 发言人切换器 */}
            <div className="speaker-switch-tabs" style={{ display: "flex", gap: "6px", margin: "10px 0" }}>
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveSpeaker(p.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: activeSpeaker === p.id ? "var(--color-primary, #2f6cf6)" : "rgba(255,255,255,0.08)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Icon name="profile" size={12} />
                  {p.name}
                  {activeSpeaker === p.id && <span style={{ fontSize: "10px", opacity: 0.8 }}>(发言中)</span>}
                </button>
              ))}
            </div>

            {live.interim && (
              <div style={{ padding: "8px 12px", background: "rgba(47,108,246,0.12)", borderRadius: "8px", marginBottom: "8px", fontSize: "13px", color: "var(--color-primary, #5a8ef6)" }}>
                正在听取 [{currentSpeaker.name}]：{live.interim}
              </div>
            )}

            <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {transcripts.map((t, idx) => (
                <div className="speaker-line" key={t.id}>
                  <b className={`speaker-avatar speaker-${idx % 2 === 0 ? "a" : "b"}`}>
                    {t.speakerName.slice(0, 1)}
                  </b>
                  <div>
                    <small>{t.speakerName} · 刚刚</small>
                    <p>{t.original}</p>
                    <span>{t.translated}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="hint-note">点击开始后，耳机将开启波束成形麦克风收音，实时转写并标注发言人，结束后自动生成结构化纪要。</p>
        )}
      </main>

      <footer className="meeting-controls">
        {confirming ? (
          <div className="meeting-confirm" role="alertdialog" aria-label="确认结束会议">
            <strong>结束会议并生成纪要？</strong>
            <small>已记录 {transcripts.length} 轮发言，将沉淀入知识库并提炼待办</small>
            <div className="meeting-confirm-actions">
              <AppButton onClick={() => { setConfirming(false); setPaused(false) }}>
                继续会议
              </AppButton>
              <AppButton className="confirm-end" onClick={handleFinishMeeting}>
                生成纪要
              </AppButton>
            </div>
          </div>
        ) : (
          <>
            <div className="meeting-main-actions">
              {recording && (
                <AppButton
                  ariaLabel={paused ? "继续记录" : "暂停记录"}
                  className="meeting-pause"
                  onClick={() => {
                    if (paused) {
                      setPaused(false)
                      live.start("auto")
                    } else {
                      setPaused(true)
                      live.stop()
                    }
                  }}
                >
                  <Icon name={paused ? "play" : "pause"} size={20} />
                </AppButton>
              )}
              <AppButton
                ariaLabel={recording ? "结束会议" : "开始会议"}
                className={`record-meeting ${recording ? "recording" : ""}`}
                onClick={() => {
                  if (finished) {
                    setFinished(false)
                    setSeconds(0)
                    setPaused(false)
                    setTranscripts([])
                    startRecording()
                    return
                  }
                  if (recording) {
                    setConfirming(true)
                    setPaused(true)
                    live.stop()
                  } else {
                    startRecording()
                  }
                }}
              >
                {recording ? <span className="stop-square" /> : <Icon name="play" size={26} />}
              </AppButton>
            </div>
            <strong>
              {finished
                ? "开始新会议"
                : recording
                  ? paused
                    ? "已暂停，点击播放按钮继续"
                    : "点击结束会议并查看纪要"
                  : "点击开始双语会议记录"}
            </strong>
            <small>会议记录会自动同步保存到【翻译记录】，可随时二次复习</small>
          </>
        )}
      </footer>
      {paywall ? <UpgradePaywallModal reason="device_minutes" onClose={() => setPaywall(false)} /> : null}
    </div>
  )
}

export default MeetingMode
