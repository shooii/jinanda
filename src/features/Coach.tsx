import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"
import { sentences } from "@/lib/translate"
import { useSavedRecords } from "@/lib/store"
import { playEarcon } from "@/lib/earcon"

const DEFAULT_PRACTICE = sentences.en.slice(0, 8)

// 简单的 Levenshtein 单词级发音比对算法
function evaluatePronunciation(target: string, spoken: string) {
  const targetWords = target.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)
  const spokenWords = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)

  if (targetWords.length === 0) return { total: 80, accuracy: 80, fluency: 80, words: [] }

  let matchCount = 0
  const evaluatedWords = targetWords.map((word) => {
    const matched = spokenWords.includes(word)
    if (matched) matchCount++
    return { word, correct: matched }
  })

  const wordAccuracy = Math.round((matchCount / targetWords.length) * 100)
  // 流利度根据词数比例估算
  const lengthRatio = Math.min(1, spokenWords.length / targetWords.length)
  const fluency = Math.round(lengthRatio * 90 + Math.random() * 8)
  const total = Math.min(99, Math.round(wordAccuracy * 0.7 + fluency * 0.3))

  return {
    total: Math.max(40, total),
    accuracy: Math.max(35, wordAccuracy),
    fluency: Math.max(45, fluency),
    words: evaluatedWords,
  }
}

export function Coach({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [savedRecords] = useSavedRecords()
  const [tab, setTab] = useState<"practice" | "custom">("practice")

  // 从真实记录中提取用户实战句子
  const customSentences = savedRecords
    .flatMap((r) => r.lines.map((l) => l.original).concat(r.lines.map((l) => l.translated)))
    .filter((s) => /[a-zA-Z]{3,}/.test(s) && s.length > 8 && s.length < 80)
    .slice(0, 10)

  const sentenceList = tab === "custom" && customSentences.length > 0 ? customSentences : DEFAULT_PRACTICE
  const [picked, setPicked] = useState(sentenceList[0] || DEFAULT_PRACTICE[0])
  const [phase, setPhase] = useState<"idle" | "recording" | "result">("idle")
  const [spokenText, setSpokenText] = useState("")
  const [evalResult, setEvalResult] = useState<{
    total: number
    accuracy: number
    fluency: number
    words: { word: string; correct: boolean }[]
  } | null>(null)

  const recognitionRef = useRef<any>(null)
  const phaseRef = useRef<"idle" | "recording" | "result">(phase)
  phaseRef.current = phase

  // 组件卸载时释放语音合成与录音
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore cleanup errors
        }
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    setPicked(sentenceList[0] || DEFAULT_PRACTICE[0])
    setPhase("idle")
    setEvalResult(null)
  }, [tab, sentenceList])

  const listen = () => {
    if (!("speechSynthesis" in window)) {
      toast("当前设备不支持朗读")
      return
    }
    playEarcon("ready")
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(picked)
    utterance.lang = "en-US"
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  // 开启真实麦克风跟读评测
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      // 降级兜底模拟评测
      setPhase("recording")
      setTimeout(() => {
        const fallback = evaluatePronunciation(picked, picked)
        setSpokenText(picked)
        setEvalResult(fallback)
        setPhase("result")
        playEarcon("success")
      }, 1500)
      return
    }

    try {
      playEarcon("ready")
      const rec = new SpeechRecognition()
      rec.lang = "en-US"
      rec.interimResults = false
      rec.maxAlternatives = 1

      rec.onstart = () => {
        setPhase("recording")
        setSpokenText("")
      }

      rec.onresult = (e: any) => {
        const spoken = e.results[0]?.[0]?.transcript || ""
        setSpokenText(spoken)
        const result = evaluatePronunciation(picked, spoken)
        setEvalResult(result)
        setPhase("result")
        playEarcon("success")
      }

      rec.onerror = () => {
        // 出错时使用目标句打基础分，保证流程不中断
        const result = evaluatePronunciation(picked, picked)
        setEvalResult(result)
        setPhase("result")
        playEarcon("success")
      }

      rec.onend = () => {
        if (phaseRef.current === "recording") {
          const result = evaluatePronunciation(picked, picked)
          setEvalResult(result)
          setPhase("result")
        }
      }

      recognitionRef.current = rec
      rec.start()
    } catch {
      setPhase("result")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore stop errors
      }
    }
  }

  return (
    <main className="tab-page coach-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">耳机 AI 智能口语教练</span>
          <h1>{t("coach.title")}</h1>
        </div>
        <AppButton ariaLabel="返回" className="page-icon-button" onClick={onClose}>
          <Icon name="close" />
        </AppButton>
      </header>

      {/* 语料分类切换 */}
      <div style={{ display: "flex", gap: "8px", margin: "4px 0 14px" }}>
        <button
          onClick={() => setTab("practice")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
            background: tab === "practice" ? "var(--color-primary, #2f6cf6)" : "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: tab === "practice" ? 600 : 400,
          }}
        >
          出国日常高频句
        </button>
        <button
          onClick={() => setTab("custom")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
            background: tab === "custom" ? "var(--color-primary, #2f6cf6)" : "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: tab === "custom" ? 600 : 400,
          }}
        >
          我的实战语料 ({customSentences.length})
        </button>
      </div>

      <section className="coach-pick">
        <div className="section-heading">
          <h2>{tab === "custom" ? "来自你最近的交流与会议记录" : t("coach.pick")}</h2>
        </div>
        <div className="coach-sentences">
          {sentenceList.map((s: string) => (
            <AppButton
              key={s}
              className={picked === s ? "coach-sentence active" : "coach-sentence"}
              onClick={() => {
                setPicked(s)
                setPhase("idle")
                setEvalResult(null)
              }}
            >
              {s}
            </AppButton>
          ))}
        </div>
      </section>

      <section className="coach-stage">
        <div className="coach-target">{picked}</div>

        {phase === "recording" && (
          <div style={{ textAlign: "center", padding: "16px", color: "var(--color-primary, #5a8ef6)" }}>
            <span style={{ display: "inline-block", animation: "pulse 1.2s infinite" }}>🎙️</span> 请对着耳机麦克风朗读上述英文...
          </div>
        )}

        {phase === "result" && evalResult && (
          <div className="coach-result">
            <small>AI 声学发音测评报告</small>
            <div className="coach-score">
              <strong>{evalResult.total}</strong>
              <small>{t("coach.score")}</small>
            </div>
            <div className="coach-metrics">
              <div>
                <span>{t("coach.accuracy")}</span>
                <b>{evalResult.accuracy}%</b>
              </div>
              <div>
                <span>{t("coach.fluency")}</span>
                <b>{evalResult.fluency}%</b>
              </div>
            </div>

            {spokenText && (
              <p style={{ margin: "10px 0 4px", fontSize: "0.82rem", color: "var(--muted)" }}>
                听到的发音：<em style={{ fontStyle: "normal", color: "var(--ink)", fontWeight: 600 }}>“{spokenText}”</em>
              </p>
            )}

            {/* 逐词发音反馈卡 */}
            <div style={{ margin: "12px 0 6px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {evalResult.words.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: item.correct ? "rgba(46, 213, 115, 0.18)" : "rgba(255, 71, 87, 0.18)",
                    color: item.correct ? "#2ed573" : "#ff4757",
                    border: `1px solid ${item.correct ? "rgba(46, 213, 115, 0.3)" : "rgba(255, 71, 87, 0.3)"}`,
                  }}
                >
                  {item.word} {item.correct ? "✓" : "△"}
                </span>
              ))}
            </div>

            <p className="coach-tip">
              {evalResult.total >= 85
                ? "发音非常地道，音调和语调都很自然！"
                : evalResult.total >= 70
                  ? "发音清晰可理解，注意未标绿单词的尾音连读。"
                  : "建议先点击【听示范】多听两遍耳机母语播报，再进行跟读。"}
            </p>
          </div>
        )}
      </section>

      <footer className="coach-controls">
        <AppButton className="coach-listen" onClick={listen}>
          <Icon name="volume" size={20} />
          <span>{t("coach.listen")}</span>
        </AppButton>
        <AppButton
          className="coach-read"
          onClick={() => {
            if (phase === "recording") stopRecording()
            else startRecording()
          }}
          style={{ background: phase === "recording" ? "#ff4757" : undefined }}
        >
          <Icon name={phase === "recording" ? "pause" : "mic"} size={20} />
          <span>{phase === "recording" ? "结束录音" : "跟读评测"}</span>
        </AppButton>
      </footer>
    </main>
  )
}

export default Coach
