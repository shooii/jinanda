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
      toast("当前设备不支持朗读")
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
          <span className="eyebrow">发音练习与实时反馈</span>
          <h1>{t("coach.title")}</h1>
        </div>
        <AppButton ariaLabel="返回" className="page-icon-button" onClick={onClose}>
          <Icon name="close" />
        </AppButton>
      </header>
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
            <small>本次发音评分</small>
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
            <p className="coach-tip">重音和连读再稳一点，整体已经很清楚。</p>
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
          <span>查看评分</span>
        </AppButton>
      </footer>
    </main>
  )
}

export default Coach
