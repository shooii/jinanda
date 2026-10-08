import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import {
  downloadText,
  recordToText,
  sampleRecords,
  useSavedRecords,
} from "@/lib/store"
import type { SavedRecord } from "@/lib/store"
import { useT } from "@/lib/i18n"



const typeIcon = (record: SavedRecord): IconName => {
  if (record.type === "会议") return "calendar"
  if (record.type === "拍照") return "camera"
  if (record.type === "文本") return "notes"
  if (record.type === "通话") return record.call?.kind === "voice" ? "phone" : "video"
  return "globe"
}

const FILTERS = [
  { id: "全部", key: "records.filterAll" },
  { id: "对话", key: "records.filterDialogue" },
  { id: "通话", key: "records.filterCall" },
  { id: "会议", key: "records.filterMeeting" },
  { id: "拍照", key: "records.filterPhoto" },
  { id: "文本", key: "records.filterText" },
] as const

export function Records() {
  const [filter, setFilter] = useState("全部")
  const [saved] = useSavedRecords()
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState<SavedRecord | null>(null)
  const records: SavedRecord[] = [...saved, ...sampleRecords]
  const t = useT()
  const typeLabel = (type: string): string => {
    if (type === "会议") return t("records.tMeeting")
    if (type === "拍照") return t("records.tPhoto")
    if (type === "文本") return t("records.tText")
    if (type === "通话") return t("records.tCall")
    return t("records.tDialogue")
  }

  useEscapeKey(() => {
    if (selected) {
      setSelected(null)
      setPlaying(false)
      setProgress(0)
    }
  })

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer)
          setPlaying(false)
          return 100
        }
        return value + 2
      })
    }, 120)
    return () => window.clearInterval(timer)
  }, [playing])

  const playAudio = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    setProgress(0)
    setPlaying(true)
  }

  const visibleRecords =
    filter === "全部"
      ? records
      : records.filter((record) => record.type === filter)

  return (
    <main className="tab-page records-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{t("records.eyebrow")}</span>
          <h1>{t("records.title")}</h1>
        </div>
        <AppButton
          ariaLabel={t("records.exportAria")}
          className="page-icon-button"
          disabled={records.length === 0}
          onClick={() => {
            downloadText(
              "LingoPods-全部记录.txt",
              records.map((record) => recordToText(record)).join("\n\n"),
            )
            toast("已导出全部记录")
          }}
        >
          <Icon name="plane" />
        </AppButton>
      </header>

      <div className="filter-row">
        {FILTERS.map((item) => (
          <AppButton
            className={filter === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setFilter(item.id)}
          >
            {t(item.key)}
          </AppButton>
        ))}
      </div>

      <section className="record-list">
        {visibleRecords.length === 0 ? (
          <p className="empty-tip">
            {t("records.emptyFilter")}
          </p>
        ) : (
          visibleRecords.map((record) => (
          <AppButton
            className="record-card"
            key={record.id}
            onClick={() => {
              setSelected(record)
              setPlaying(false)
              setProgress(0)
            }}
          >
            <span className={`record-type type-${record.type}`}>
              <Icon name={typeIcon(record)} size={20} />
            </span>
            <span className="record-copy">
              <span className="record-title">
                <strong>{record.title}</strong>
                <small>{record.time}</small>
              </span>
              <small>{record.meta}</small>
            </span>
            <Icon name="chevron" size={17} />
          </AppButton>
          ))
        )}
      </section>
      {selected && (
        <div className="record-detail-backdrop">
          <div
            className="record-detail"
            role="dialog"
            aria-modal="true"
            aria-label="翻译记录详情"
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">
                  {typeLabel(selected.type)}
                  {t("records.typeSuffix")}
                </span>
                <h2>{selected.title}</h2>
                <small>
                  {selected.meta} · {selected.time}
                </small>
              </div>
              <AppButton
                ariaLabel={t("records.detailAria")}
                onClick={() => {
                  setSelected(null)
                  setPlaying(false)
                  setProgress(0)
                }}
              >
                <Icon name="close" />
              </AppButton>
            </header>
            <section className="detail-summary">
              <span>
                <Icon name="sparkles" size={17} /> {t("records.aiSummary")}
              </span>
              <p>{selected.summary}</p>
              <div>
                <b>{selected.lines.length || 2}</b>
                <small>{t("records.segBilingual")}</small>
                <b>{Math.max(1, Math.round(selected.lines.length / 2))}</b>
                <small>{t("records.segSpeakers")}</small>
              </div>
            </section>

            <section className="detail-player">
              <AppButton
                ariaLabel={
                  playing
                    ? t("records.playOriginalPause")
                    : t("records.playOriginal")
                }
                className={playing ? "player-toggle playing" : "player-toggle"}
                onClick={playAudio}
              >
                <Icon name={playing ? "pause" : "play"} size={18} />
              </AppButton>
              <div className="player-track">
                <small>
                  {playing
                    ? t("records.playerPlaying")
                    : t("records.playerIdle")}
                </small>
                <span className="player-progress">
                  <i style={{ width: `${progress}%` }} />
                </span>
              </div>
              <b>{progress}%</b>
            </section>

            <section className="detail-transcript">
              {selected.lines.map((line, index) => (
                <div key={index}>
                  <span
                    className={`speaker-avatar ${index % 2 === 0 ? "speaker-a" : "speaker-b"}`}
                  >
                    {line.speaker.slice(0, 1)}
                  </span>
                  <p>
                    <small>{t("records.original")}</small>
                    <strong>{line.original}</strong>
                    <i>{line.translated}</i>
                  </p>
                </div>
              ))}
            </section>
            <div className="detail-actions">
              <AppButton onClick={playAudio}>
                <Icon name={playing ? "pause" : "audio"} />
                <span>
                  {playing
                    ? t("records.playOriginalPause")
                    : t("records.playOriginal")}
                </span>
              </AppButton>
              <AppButton
                onClick={() => {
                  downloadText(
                    `${selected.title}.txt`,
                    recordToText(selected),
                  )
                  toast(`已导出「${selected.title}.txt」`)
                }}
              >
                <Icon name="notes" /> {t("records.export")}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Records
