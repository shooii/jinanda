import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"
import { sentences } from "@/lib/translate"

const PRACTICE = sentences.en.slice(0, 8)

export function Coach({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [picked, setPicked] = useState(PRACTICE[0])
  const [phase, setPhase] = useState<"idle" | "result">("idle")
  const score = { total: 84, accuracy: 87, fluency: 81 }

  const listen = () => {
    if (!("speechSynthesis" in window)) {
      toast("当前浏览器不支持朗读")
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(picked)
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }

  const read = () => {
    setPhase("result")
  }

  return (
    <main className="tab-page coach-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">示例句朗读与反馈演示</span>
          <h1>{t("coach.title")}</h1>
        </div>
        <AppButton ariaLabel="返回" className="page-icon-button" onClick={onClose}>
          <Icon name="close" />
        </AppButton>
      </header>
      <p className="demo-note">口语教练演示 · 可朗读示例句，评分仅展示反馈样式，尚未接入录音分析</p>

      <section className="coach-pick">
        <div className="section-heading">
          <h2>{t("coach.pick")}</h2>
        </div>
        <div className="coach-sentences">
          {PRACTICE.map((s: string) => (
            <AppButton
              key={s}
              className={picked === s ? "coach-sentence active" : "coach-sentence"}
              onClick={() => {
                setPicked(s)
                setPhase("idle")
              }}
            >
              {s}
            </AppButton>
          ))}
        </div>
      </section>

      <section className="coach-stage">
        <div className="coach-target">{picked}</div>
        {phase === "result" && (
          <div className="coach-result">
            <small>示例评分 · 不代表你的发音表现</small>
            <div className="coach-score">
              <strong>{score.total}</strong>
              <small>{t("coach.score")}</small>
            </div>
            <div className="coach-metrics">
              <div>
                <span>{t("coach.accuracy")}</span>
                <b>{score.accuracy}</b>
              </div>
              <div>
                <span>{t("coach.fluency")}</span>
                <b>{score.fluency}</b>
              </div>
            </div>
            <p className="coach-tip">真实发音反馈需接入录音分析服务</p>
          </div>
        )}
      </section>

      <footer className="coach-controls">
        <AppButton className="coach-listen" onClick={listen}>
          <Icon name="volume" size={20} />
          <span>{t("coach.listen")}</span>
        </AppButton>
        <AppButton className="coach-read" onClick={read}>
          <Icon name="sparkles" size={20} />
          <span>查看评分示例</span>
        </AppButton>
      </footer>
    </main>
  )
}

export default Coach
