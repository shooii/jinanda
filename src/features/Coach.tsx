import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"
import { sentences } from "@/lib/translate"

const PRACTICE = sentences.zh.slice(0, 8)

export function Coach({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [picked, setPicked] = useState(PRACTICE[0])
  const [phase, setPhase] = useState<"idle" | "scoring" | "result">("idle")
  const [score, setScore] = useState({ total: 0, accuracy: 0, fluency: 0 })

  const listen = () => {
    setPhase("idle")
  }

  const read = () => {
    setPhase("scoring")
    window.setTimeout(() => {
      // 原型：基于句子长度与稳定性的确定性评分（真实产品由端侧发音模型给出）
      const base = 72 + (picked.length % 5) * 4
      const accuracy = Math.min(99, base + 3)
      const fluency = Math.min(99, base - 2)
      const total = Math.round((accuracy + fluency) / 2)
      setScore({ total, accuracy, fluency })
      setPhase("result")
    }, 1200)
  }

  return (
    <main className="tab-page coach-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{t("coach.subtitle")}</span>
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
            <p className="coach-tip">{t("coach.tipResult")}</p>
          </div>
        )}
      </section>

      <footer className="coach-controls">
        <AppButton className="coach-listen" onClick={listen}>
          <Icon name="volume" size={20} />
          <span>{t("coach.listen")}</span>
        </AppButton>
        <AppButton className="coach-read" onClick={read}>
          <Icon name={phase === "scoring" ? "pause" : "mic"} size={20} />
          <span>
            {phase === "scoring"
              ? t("coach.scoring")
              : phase === "result"
                ? t("coach.tryAgain")
                : t("coach.record")}
          </span>
        </AppButton>
      </footer>
    </main>
  )
}

export default Coach
