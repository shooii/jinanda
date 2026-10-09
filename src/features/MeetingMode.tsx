import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"
import { downloadText } from "@/lib/store"

type Participant = { id: string; name: string; lang: LangId }

const participants: Participant[] = [
  { id: "p-a", name: "Alex", lang: "en" },
  { id: "p-m", name: "Mia", lang: "en" },
]

export function MeetingMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)
  const [fullText, setFullText] = useState(false)

  useEffect(() => {
    if (!recording || paused) return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [recording, paused])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  const langSet = Array.from(new Set(participants.map((p) => p.lang)))

  const startRecording = () => {
    setRecording(true)
    setPaused(false)
  }

  const exportSummary = () => {
    downloadText(
      "LingoPods-会议纪要.txt",
      [
        "LingoPods 会议纪要",
        `时长 ${time} · 发言人 ${participants.length} 位`,
        "",
        "【三句话摘要】",
        "团队确认周五前完成发布时间表，并在下周二前提交新版测试计划。上线范围仍需产品负责人最终确认。",
        "",
        "【决定】周五前冻结发布时间表",
        "【待办】Mia · 下周二提交测试计划",
        "【待确认】产品负责人确认上线范围",
      ].join("\n"),
    )
    toast("纪要已导出")
  }

  return (
    <div className="feature-flow meeting-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="实时转写与 AI 纪要"
        title="会议记录"
      />
      <main className="meeting-content">
        <section className="meeting-status-card">
          <div className="meeting-orb">
            <i className={recording ? "active" : ""} />
            <Icon name="calendar" size={28} />
          </div>
          <span className="eyebrow">
            {finished
              ? "记录完成"
              : recording
                ? paused
                  ? "已暂停"
                  : "正在记录"
                : "准备就绪"}
          </span>
          {(finished || recording) && (
            <h1>{finished ? "会议纪要" : time}</h1>
          )}
          <p>
            {finished
              ? "查看决定、待办事项和双语全文"
              : recording
                ? paused
                  ? "已暂停记录，可随时继续"
                  : "正在实时转写双语内容"
                : "开始记录后会自动生成双语转写与会议纪要。"}
          </p>
          <div className="meeting-languages">
            {langSet.length <= 2 ? (
              langSet.map((l, i) => (
                <span key={l}>
                  {i > 0 && <Icon name="swap" size={16} />}
                  {langOption(l).native}
                </span>
              ))
            ) : (
              <span>{t("meeting.multi")} · {participants.length} 人</span>
            )}
          </div>
        </section>

        {finished ? (
          <section className="meeting-summary">
            <div className="summary-top">
              <Icon name="sparkles" />
              <span>
                <strong>三句话摘要</strong>
                <small>AI 生成</small>
              </span>
            </div>
            <p>
              团队确认周五前完成发布时间表，并在下周二前提交新版测试计划。上线范围仍需产品负责人最终确认。
            </p>
            <div className="decision-list">
              <span>
                <Icon name="check" size={15} />
                <b>决定</b> 周五前冻结发布时间表
              </span>
              <span>
                <Icon name="calendar" size={15} />
                <b>待办</b> Mia · 下周二提交测试计划
              </span>
              <span>
                <Icon name="profile" size={15} />
                <b>待确认</b> 产品负责人确认上线范围
              </span>
            </div>
            <div className="summary-actions">
              <AppButton onClick={() => setFullText((v) => !v)}>
                <Icon name="notes" /> {fullText ? "收起全文" : "查看全文"}
              </AppButton>
              <AppButton onClick={exportSummary}>
                <Icon name="plane" /> 导出
              </AppButton>
            </div>
            {fullText && (
              <div className="summary-fulltext">
                <p>
                  <b>Alex</b> Let's confirm the launch timeline before Friday.
                  <span>我们在周五前确认一下发布时间表。</span>
                </p>
                <p>
                  <b>Mia</b> I'll share the updated testing plan...
                  <span>我会分享更新后的测试计划……</span>
                </p>
                <p>
                  <b>Alex</b> Ping me once the staging build is green.
                  <span>预发布环境通过后叫我一声。</span>
                </p>
              </div>
            )}
          </section>
        ) : recording ? (
          <section className="live-transcript-card">
            <div className="transcript-head">
              <span>
                <i /> 实时转写
              </span>
              <small>{participants.length} 位发言人</small>
            </div>
            {participants.slice(0, 2).map((p, idx) => (
              <div
                className={`speaker-line ${idx === 1 ? "upcoming" : ""}`}
                key={p.id}
              >
                <b className={`speaker-avatar speaker-${idx === 0 ? "a" : "b"}`}>
                  {p.name.slice(0, 1)}
                </b>
                <div>
                  <small>
                    {p.name} · {langOption(p.lang).native} ·{" "}
                    {idx === 0 ? "刚刚" : "正在说"}
                  </small>
                  <p>
                    {idx === 0
                      ? "Let's confirm the launch timeline before Friday."
                      : "I'll share the updated testing plan..."}
                  </p>
                  <span>
                    {idx === 0
                      ? "我们在周五前确认一下发布时间表。"
                      : "我会分享更新后的测试计划……"}
                  </span>
                </div>
              </div>
            ))}
            {participants.length > 2 && (
              <div className="extra-speakers">
                {participants.slice(2).map((p) => (
                  <span key={p.id} className="extra-speaker-chip">
                    <b>{p.name.slice(0, 1)}</b>
                    {p.name} · {langOption(p.lang).native}
                  </span>
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="hint-note">点击开始后会实时转写每位发言人的内容，并按发言人分栏显示字幕。</p>
        )}
      </main>
      <footer className="meeting-controls">
        {confirming ? (
          <div className="meeting-confirm" role="alertdialog" aria-label="确认结束会议">
            <strong>结束会议并查看纪要？</strong>
            <small>结束后将生成会议摘要与待办事项</small>
            <div className="meeting-confirm-actions">
              <AppButton onClick={() => { setConfirming(false); setPaused(false) }}>
                继续会议
              </AppButton>
              <AppButton
                className="confirm-end"
                onClick={() => {
                  setConfirming(false)
                  setRecording(false)
                  setFinished(true)
                }}
              >
                查看纪要
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
                  onClick={() => setPaused((value) => !value)}
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
                    startRecording()
                    return
                  }
                  if (recording) {
                    setConfirming(true)
                    setPaused(true)
                  } else {
                    startRecording()
                  }
                }}
              >
                {recording ? (
                  <span className="stop-square" />
                ) : (
                  <Icon name="play" size={26} />
                )}
              </AppButton>
            </div>
            <strong>
              {finished
                ? "开始新会议"
                : recording
                  ? paused
                    ? "已暂停，可继续或结束"
                    : "点击结束并查看纪要"
                  : "点击开始记录"}
            </strong>
            <small>
              记录内容会同步保存到翻译记录
            </small>
          </>
        )}
      </footer>
    </div>
  )
}

export default MeetingMode
