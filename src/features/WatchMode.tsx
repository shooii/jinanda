import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, useLangPair, usePersistentState } from "@/lib/core"
import { useT } from "@/lib/i18n"
import { downloadText, useSavedRecords } from "@/lib/store"
import { langOption, watchLines, watchScripts } from "@/lib/translate"
import type { LangId } from "@/lib/translate"

/**
 * 观影模式：戴耳机看外语影片 / 网课 / 直播，实时生成字幕。
 *
 * 与对话模式的差别在于「单向」——只译影片的声音，不需要轮流发言，
 * 因此核心是：声音从哪来（拾音方式）、声音怎么出（原声还是配音）、
 * 字幕怎么对上画面（音画同步）。这三项决定观影能不能真的用起来。
 *
 * 字幕原文 / 译文统一取 watchLines 的同一条下标，任意语言对都干净。
 */

type Genre = "movie" | "series" | "class" | "live"
type CapMode = "bilingual" | "target" | "source"

type WatchPrefs = {
  genre: Genre
  capMode: CapMode
  capSize: number
  sync: number
}

const DEFAULT_PREFS: WatchPrefs = {
  genre: "movie",
  capMode: "bilingual",
  capSize: 1,
  sync: 0,
}

const GENRES: { id: Genre; icon: IconName; key: string }[] = [
  { id: "movie", icon: "monitor", key: "watch.gMovie" },
  { id: "series", icon: "video", key: "watch.gSeries" },
  { id: "class", icon: "notes", key: "watch.gClass" },
  { id: "live", icon: "users", key: "watch.gLive" },
]

const CAP_MODES: { id: CapMode; key: string }[] = [
  { id: "bilingual", key: "watch.capBilingual" },
  { id: "target", key: "watch.capTarget" },
  { id: "source", key: "watch.capSource" },
]

const CAP_SIZES = ["watch.capSmall", "watch.capNormal", "watch.capLarge"]

/** 单句字幕的基准间隔；音画同步在此基础上偏移 */
const BASE_GAP = 2200
/** 屏幕上同时呈现的最多字幕行数 */
const VISIBLE_LINES = 3

type Caption = { src: string; dst: string; at: number }

/** 毫秒 → SRT 时间码 */
function srtTime(ms: number): string {
  const t = Math.max(0, Math.round(ms))
  const pad = (n: number, w = 2) => String(n).padStart(w, "0")
  return `${pad(Math.floor(t / 3600000))}:${pad(Math.floor((t % 3600000) / 60000))}:${pad(
    Math.floor((t % 60000) / 1000),
  )},${pad(t % 1000, 3)}`
}

export function WatchMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { me, them, setMe, setThem } = useLangPair()
  const [prefs, setPrefs] = usePersistentState<WatchPrefs>(
    "lingo.watch-prefs",
    DEFAULT_PREFS,
  )
  const [running, setRunning] = useState(false)
  const [caps, setCaps] = useState<Caption[]>([])
  const [picker, setPicker] = useState<"src" | "dst" | null>(null)
  const [, addRecord] = useSavedRecords()
  const cursorRef = useRef(0)
  const startRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEscapeKey(onClose)

  const { genre, capMode, capSize, sync } = prefs
  const patch = (next: Partial<WatchPrefs>) =>
    setPrefs((prev) => ({ ...prev, ...next }))

  // 影片语言 = 对方语言，字幕语言 = 我的语言；与首页 / 对话共用同一份语言对
  const srcLang: LangId = them
  const dstLang: LangId = me

  useEffect(() => {
    if (!running) return
    const script = watchScripts[genre] ?? []
    const step = () => {
      if (cursorRef.current >= script.length) {
        setRunning(false)
        return
      }
      const lineIndex = script[cursorRef.current]
      const src = watchLines[srcLang]?.[lineIndex] ?? ""
      const dst = watchLines[dstLang]?.[lineIndex] ?? ""
      setCaps((prev) => [
        ...prev,
        { src, dst, at: Date.now() - startRef.current },
      ])
      cursorRef.current += 1
      // 同步为正 = 字幕延后出现（画面先行），为负 = 提前
      const gap = Math.max(400, Math.min(4200, BASE_GAP + sync * 1000))
      timerRef.current = window.setTimeout(step, gap)
    }
    timerRef.current = window.setTimeout(step, 900)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [running, genre, srcLang, dstLang, sync])

  const toggle = () => {
    if (running) {
      setRunning(false)
      return
    }
    setCaps([])
    cursorRef.current = 0
    startRef.current = Date.now()
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setCaps([])
    cursorRef.current = 0
  }

  const toSrt = (): string =>
    caps
      .map((cap, i) => {
        const end = caps[i + 1]?.at ?? cap.at + BASE_GAP
        const body =
          capMode === "source"
            ? cap.src
            : capMode === "target"
              ? cap.dst
              : `${cap.dst}\n${cap.src}`
        return `${i + 1}\n${srtTime(cap.at)} --> ${srtTime(end)}\n${body}\n`
      })
      .join("\n")

  const exportSrt = () => {
    if (caps.length === 0) return
    downloadText("LingoPods-字幕.srt", toSrt())
    toast(t("watch.exported"))
  }

  const saveRecord = () => {
    if (caps.length === 0) return
    addRecord({
      title: `${t(GENRES.find((g) => g.id === genre)?.key ?? "watch.gMovie")} · ${langOption(srcLang).native}`,
      meta: `${langOption(srcLang).native} → ${langOption(dstLang).native}`,
      summary: t("watch.lineCount").replace("{n}", String(caps.length)),
      type: "观影",
      lines: caps.map((cap) => ({
        speaker: langOption(srcLang).short,
        original: cap.src,
        translated: cap.dst,
      })),
    })
    toast(t("watch.saved"))
  }

  const visible = caps.slice(-VISIBLE_LINES)
  const sizeClass =
    capSize === 0 ? "small" : capSize === 2 ? "large" : "normal"

  return (
    <main className={running ? "tab-page watch-page live" : "tab-page watch-page"}>
      <header className="page-header">
        <div>
          <span className="eyebrow">实时字幕与样式</span>
          <h1>{t("watch.title")}</h1>
        </div>
        {/* 关闭即回首页，复用助眠页的「返回首页」文案，避免再造一个同义 key */}
        <AppButton ariaLabel={t("sleep.back")} className="page-icon-button" onClick={onClose}>
          <Icon name="close" />
        </AppButton>
      </header>
      <div className="watch-pair">
        <AppButton
          className="watch-pair-cell"
          disabled={running}
          onClick={() => setPicker("src")}
          ariaLabel={t("watch.source")}
        >
          <Icon name="monitor" size={15} />
          <span>{langOption(srcLang).native}</span>
          <Icon name="chevron" size={12} />
        </AppButton>
        <span className="watch-pair-arrow">
          <Icon name="swap" size={15} />
        </span>
        <AppButton
          className="watch-pair-cell"
          disabled={running}
          onClick={() => setPicker("dst")}
          ariaLabel={t("watch.captions")}
        >
          <Icon name="notes" size={15} />
          <span>{langOption(dstLang).native}</span>
          <Icon name="chevron" size={12} />
        </AppButton>
      </div>

      <section className="watch-stage">
        <div className="watch-stage-head">
          <span className={running ? "watch-live on" : "watch-live"}>
            <span className="watch-live-dot" />
            {running ? "正在生成字幕" : "实时字幕"}
          </span>
          <span className="watch-ai">AI 实时生成</span>
        </div>

        <div
          className={`watch-captions ${sizeClass} ${capMode}`}
          aria-live="polite"
        >
          {caps.length === 0 ? (
            <p className="watch-empty">选择内容类型，开始生成实时字幕</p>
          ) : (
            visible.map((cap, i) => (
              <div
                className={`watch-caption ${i === visible.length - 1 ? "current" : ""}`}
                key={`${cap.at}-${i}`}
              >
                {capMode !== "source" && <p className="watch-dst">{cap.dst}</p>}
                {capMode !== "target" && <p className="watch-src">{cap.src}</p>}
              </div>
            ))
          )}
        </div>

        {caps.length > 0 && (
          <p className="watch-count">
            {t("watch.lineCount").replace("{n}", String(caps.length))}
          </p>
        )}
      </section>

      {!running && (
        <section className="watch-setup">
          <div className="watch-group">
            <h2 className="watch-group-title">
              <Icon name="monitor" size={14} />
              {t("watch.genre")}
            </h2>
            <div className="watch-chips">
              {GENRES.map((item) => (
                <AppButton
                  key={item.id}
                  className={genre === item.id ? "watch-chip active" : "watch-chip"}
                  onClick={() => patch({ genre: item.id })}
                >
                  <Icon name={item.icon} size={15} />
                  <span>{t(item.key)}</span>
                </AppButton>
              ))}
            </div>
          </div>

          <div className="watch-group">
            <h2 className="watch-group-title">
              <Icon name="sliders" size={14} />
              字幕设置
            </h2>
            <div className="watch-row">
              <span className="watch-row-label">{t("watch.captions")}</span>
              <div className="watch-seg">
                {CAP_MODES.map((item) => (
                  <AppButton
                    key={item.id}
                    className={capMode === item.id ? "active" : ""}
                    onClick={() => patch({ capMode: item.id })}
                  >
                    {t(item.key)}
                  </AppButton>
                ))}
              </div>
            </div>
            <div className="watch-row">
              <span className="watch-row-label">{t("watch.capSize")}</span>
              <div className="watch-seg">
                <AppButton
                  onClick={() => patch({ capSize: Math.max(0, capSize - 1) })}
                  ariaLabel={t(CAP_SIZES[0])}
                >
                  A-
                </AppButton>
                <span className="watch-size-value">{t(CAP_SIZES[capSize])}</span>
                <AppButton
                  onClick={() => patch({ capSize: Math.min(2, capSize + 1) })}
                  ariaLabel={t(CAP_SIZES[2])}
                >
                  A+
                </AppButton>
              </div>
            </div>
            <div className="watch-sync">
              <div className="watch-sync-head">
                <span>{t("watch.sync")}</span>
                <b>{sync > 0 ? `+${sync}s` : `${sync}s`}</b>
              </div>
              <input
                type="range"
                min={-2}
                max={2}
                step={1}
                value={sync}
                aria-label={t("watch.sync")}
                onChange={(event) => patch({ sync: Number(event.target.value) })}
              />
              <div className="watch-sync-ends">
                <span>{t("watch.syncAhead")}</span>
                <span>{t("watch.syncBehind")}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="watch-controls">
        <AppButton
          className={running ? "watch-main stop" : "watch-main"}
          onClick={toggle}
        >
          <Icon name={running ? "pause" : "play"} size={20} />
          <span>{running ? "停止生成" : "开始生成字幕"}</span>
        </AppButton>
        <div className="watch-sub">
          <AppButton onClick={exportSrt} disabled={caps.length === 0}>
            <Icon name="notes" size={16} />
            <span>{t("watch.export")}</span>
          </AppButton>
          <AppButton onClick={saveRecord} disabled={caps.length === 0}>
            <Icon name="check" size={16} />
            <span>{t("watch.save")}</span>
          </AppButton>
          <AppButton onClick={reset} disabled={caps.length === 0}>
            <Icon name="close" size={16} />
            <span>{t("watch.clear")}</span>
          </AppButton>
        </div>
      </footer>

      <LangPicker
        open={picker !== null}
        title={picker === "dst" ? t("watch.captions") : t("watch.source")}
        value={picker === "dst" ? dstLang : srcLang}
        onPick={(id) => {
          if (picker === "dst") setMe(id)
          else setThem(id)
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />
    </main>
  )
}

export default WatchMode
