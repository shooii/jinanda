import { useEffect, useRef, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { useT } from "@/lib/i18n"
import { langOption, translatePhrase, type LangId } from "@/lib/translate"

type Source = { id: string; label: string; lang: LangId }

const SOURCES: Source[] = [
  { id: "movie", label: "电影", lang: "en" },
  { id: "class", label: "网课", lang: "en" },
  { id: "stream", label: "直播", lang: "ja" },
]

const SCENES: Record<string, { from: LangId; line: string }[]> = {
  movie: [
    { from: "en", line: "I can't believe we made it to the summit." },
    { from: "en", line: "Look at the horizon, it's incredible." },
    { from: "en", line: "We should head back before dark." },
    { from: "en", line: "Thank you for being here with me." },
  ],
  class: [
    { from: "en", line: "Today we will learn about neural networks." },
    { from: "en", line: "The loss function measures prediction error." },
    { from: "en", line: "Let's run a quick demo on the dataset." },
  ],
  stream: [
    { from: "ja", line: "こんにちは、今日の配信へようこそ。" },
    { from: "ja", line: "新しい製品を紹介します。" },
    { from: "ja", line: "ぜひチャンネル登録をお願いします。" },
  ],
}

export function WatchMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [running, setRunning] = useState(false)
  const [source, setSource] = useState<Source>(SOURCES[0])
  const [caps, setCaps] = useState<{ src: string; zh: string }[]>([])
  const streamRef = useRef<number | null>(null)
  useEscapeKey(onClose)

  useEffect(() => {
    if (!running) return
    const scenes = SCENES[source.id] ?? []
    let idx = 0
    streamRef.current = window.setInterval(() => {
      if (idx >= scenes.length) {
        if (streamRef.current) window.clearInterval(streamRef.current)
        return
      }
      const s = scenes[idx]
      const zh = translatePhrase(s.line, s.from, "zh").text
      setCaps((prev) => [...prev, { src: s.line, zh }])
      idx += 1
    }, 1800)
    return () => {
      if (streamRef.current) window.clearInterval(streamRef.current)
    }
  }, [running, source])

  const toggle = () => {
    if (running) {
      setRunning(false)
    } else {
      setCaps([])
      setRunning(true)
    }
  }

  return (
    <main className="tab-page watch-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{t("watch.tip")}</span>
          <h1>{t("watch.title")}</h1>
        </div>
        <AppButton ariaLabel="返回" className="page-icon-button" onClick={onClose}>
          <Icon name="close" />
        </AppButton>
      </header>

      <section className="watch-source">
        <div className="section-heading">
          <h2>{t("watch.source")}</h2>
        </div>
        <div className="watch-source-row">
          {SOURCES.map((s) => (
            <AppButton
              key={s.id}
              className={source.id === s.id ? "watch-source-chip active" : "watch-source-chip"}
              onClick={() => !running && setSource(s)}
            >
              <Icon name="monitor" size={16} />
              <span>{s.label}</span>
              <small>{langOption(s.lang).native}</small>
            </AppButton>
          ))}
        </div>
      </section>

      <section className="watch-stage">
        <div className="watch-stage-head">
          <span className={running ? "watch-live on" : "watch-live"}>
            {running ? t("watch.live") : t("watch.stop")}
          </span>
          <small>{langOption(source.lang).native} → 中文</small>
        </div>
        <div className="watch-captions">
          {caps.length === 0 && (
            <p className="watch-empty">将手机靠近声源，{t("watch.tip")}</p>
          )}
          {caps.map((c, i) => (
            <div className="watch-caption" key={i}>
              <p className="watch-src">{c.src}</p>
              <p className="watch-zh">{c.zh}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="watch-controls">
        <AppButton
          className={running ? "watch-stop" : "watch-start"}
          onClick={toggle}
        >
          <Icon name={running ? "pause" : "play"} size={20} />
          <span>{running ? t("watch.stop") : t("watch.start")}</span>
        </AppButton>
      </footer>
    </main>
  )
}

export default WatchMode
