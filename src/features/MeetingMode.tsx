import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useT } from "@/lib/i18n"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"
import { downloadText } from "@/lib/store"

type Participant = { id: string; name: string; lang: LangId }

const MAX_PARTICIPANTS = 8

/** 每位发言人一个稳定色相，头像与转写气泡保持一致 */
const hueOf = (index: number) => [152, 28, 258, 340, 92, 196, 12, 312][index % 8]

export function MeetingMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [consent, setConsent] = useState(false)
  const [finished, setFinished] = useState(false)
  const [pickerId, setPickerId] = useState<string | null>(null)
  const [fullText, setFullText] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p-a", name: "Alex", lang: "en" },
    { id: "p-m", name: "Mia", lang: "en" },
  ])

  useEffect(() => {
    if (!recording || paused) return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [recording, paused])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  const full = participants.length >= MAX_PARTICIPANTS

  const addParticipant = () => {
    if (full) return
    setParticipants((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, name: `发言人 ${prev.length + 1}`, lang: "en" },
    ])
  }

  const setLang = (id: string, lang: LangId) =>
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, lang } : p)),
    )

  const removeParticipant = (id: string) =>
    setParticipants((prev) => prev.filter((p) => p.id !== id))

  const langSet = Array.from(new Set(participants.map((p) => p.lang)))

  const pickerTarget = useMemo(
    () => participants.find((p) => p.id === pickerId) ?? null,
    [participants, pickerId],
  )

  const startRecording = () => {
    if (!consent) {
      toast("请先勾选已获得参会者同意")
      return
    }
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
              ? "会议完成"
              : recording
                ? paused
                  ? "已暂停"
                  : "正在记录"
                : "准备就绪"}
          </span>
          {(finished || recording) && (
            <h1>{finished ? "纪要已生成" : time}</h1>
          )}
          <p>
            {finished
              ? "已整理关键决定、待办事项和双语全文"
              : recording
                ? paused
                  ? "已暂停记录，可随时继续"
                  : "正在识别多语言，并同步生成中文翻译"
                : "自动区分发言人，会后生成摘要与待办事项。"}
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
                <small>AI 已整理</small>
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
          <>
            <AppButton
              className={`consent-card ${consent ? "accepted" : ""}`}
              onClick={() => setConsent((value) => !value)}
            >
              <span>{consent ? <Icon name="check" size={15} /> : "1"}</span>
              <div>
                <strong>已获得参会者同意</strong>
                <small>开始前请告知所有参会者正在录音与转写</small>
              </div>
            </AppButton>

            <section className="meeting-participants">
              <div className="section-heading">
                <h2>{t("meeting.multi")}</h2>
                <AppButton
                  className="add-speaker"
                  disabled={full}
                  onClick={addParticipant}
                >
                  <Icon name="plus" size={15} /> {t("meeting.addSpeaker")}
                </AppButton>
              </div>
              <div className="participant-list">
                {participants.map((p, idx) => (
                  <div className="participant-row" key={p.id}>
                    <span
                      className="participant-avatar"
                      style={{ "--p-hue": hueOf(idx) } as CSSProperties}
                    >
                      {p.name.slice(0, 1)}
                    </span>
                    <button
                      className="participant-lang"
                      onClick={() => setPickerId(p.id)}
                      type="button"
                    >
                      <strong>{p.name}</strong>
                      <small>
                        {langOption(p.lang).native}
                        <Icon name="chevron" size={13} />
                      </small>
                    </button>
                    {participants.length > 1 && (
                      <AppButton
                        ariaLabel={`移除${p.name}`}
                        className="remove-participant"
                        onClick={() => removeParticipant(p.id)}
                      >
                        <Icon name="close" size={14} />
                      </AppButton>
                    )}
                  </div>
                ))}
              </div>
              <small className="participant-tip">{t("meeting.tip")}</small>
            </section>

          </>
        )}
      </main>
      {pickerTarget && (
        <LangPicker
          onClose={() => setPickerId(null)}
          onPick={(id) => {
            setLang(pickerTarget.id, id)
            setPickerId(null)
          }}
          open
          title={t("meeting.assignLang")}
          value={pickerTarget.lang}
        />
      )}
      <footer className="meeting-controls">
        {confirming ? (
          <div className="meeting-confirm" role="alertdialog" aria-label="确认结束会议">
            <strong>结束并生成纪要？</strong>
            <small>转写将停止，摘要与待办随后生成</small>
            <div className="meeting-confirm-actions">
              <AppButton onClick={() => setConfirming(false)}>
                继续记录
              </AppButton>
              <AppButton
                className="confirm-end"
                onClick={() => {
                  setConfirming(false)
                  setRecording(false)
                  setFinished(true)
                }}
              >
                结束并生成
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
                ariaLabel={recording ? "结束会议记录" : "开始会议记录"}
                className={`record-meeting ${recording ? "recording" : ""}`}
                onClick={() => {
                  if (finished) {
                    setFinished(false)
                    setSeconds(0)
                    setPaused(false)
                    return
                  }
                  if (recording) {
                    setConfirming(true)
                  } else {
                    startRecording()
                  }
                }}
              >
                {recording ? (
                  <span className="stop-square" />
                ) : (
                  <Icon name="mic" size={26} />
                )}
              </AppButton>
            </div>
            <strong>
              {finished
                ? "开始新会议"
                : recording
                  ? paused
                    ? "已暂停，可继续或结束"
                    : "点击结束并生成纪要"
                  : consent
                    ? "点击开始记录"
                    : "请先勾选参会者同意"}
            </strong>
            <small>
              {recording ? "内容已自动保存" : "首次使用会请求麦克风权限"}
            </small>
          </>
        )}
      </footer>
    </div>
  )
}

export default MeetingMode
