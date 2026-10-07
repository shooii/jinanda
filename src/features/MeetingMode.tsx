import { useEffect, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"



export function MeetingMode({ onClose }: { onClose: () => void }) {
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [consent, setConsent] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!recording || paused) return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [recording, paused])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

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
          <h1>
            {finished
              ? "纪要已生成"
              : recording
                ? time
                : "让每个重点都有迹可循"}
          </h1>
          <p>
            {finished
              ? "已整理关键决定、待办事项和双语全文"
              : recording
                ? paused
                  ? "已暂停记录，可随时继续"
                  : "正在识别英语，并同步生成中文翻译"
                : "自动区分发言人，会后生成摘要与待办事项。"}
          </p>
          <div className="meeting-languages">
            <span>英语</span>
            <Icon name="swap" size={16} />
            <span>中文</span>
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
              <AppButton>
                <Icon name="notes" /> 查看全文
              </AppButton>
              <AppButton>
                <Icon name="plane" /> 导出
              </AppButton>
            </div>
          </section>
        ) : recording ? (
          <section className="live-transcript-card">
            <div className="transcript-head">
              <span>
                <i /> 实时转写
              </span>
              <small>2 位发言人</small>
            </div>
            <div className="speaker-line">
              <b className="speaker-avatar speaker-a">A</b>
              <div>
                <small>Alex · 刚刚</small>
                <p>Let's confirm the launch timeline before Friday.</p>
                <span>我们在周五前确认一下发布时间表。</span>
              </div>
            </div>
            <div className="speaker-line upcoming">
              <b className="speaker-avatar speaker-b">M</b>
              <div>
                <small>Mia · 正在说</small>
                <p>I'll share the updated testing plan...</p>
                <span>我会分享更新后的测试计划……</span>
              </div>
            </div>
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
            <section className="meeting-benefits">
              <div>
                <Icon name="mic" />
                <span>
                  <strong>智能区分发言人</strong>
                  <small>最多识别 8 位参会者</small>
                </span>
              </div>
              <div>
                <Icon name="sparkles" />
                <span>
                  <strong>AI 自动整理</strong>
                  <small>摘要、决定与待办事项</small>
                </span>
              </div>
              <div>
                <Icon name="notes" />
                <span>
                  <strong>双语会议纪要</strong>
                  <small>原文与翻译可随时回看</small>
                </span>
              </div>
            </section>
          </>
        )}
      </main>
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
                    setConsent(true)
                    setRecording(true)
                    setPaused(false)
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
                    : "确认同意并开始"}
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
