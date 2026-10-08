import { useMemo, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import {
  copyText,
  downloadText,
  recordToText,
  useSavedRecords,
} from "@/lib/store"
import { langOption, sentences, translatePhrase, applyTone } from "@/lib/translate"
import type { LangId, ToneId } from "@/lib/translate"
import { useT } from "@/lib/i18n"

type Side = "from" | "to"

export function TextTranslate({
  onClose,
  onNavigate,
}: {
  onClose: () => void
  onNavigate?: (feature: FeatureId) => void
}) {
  const t = useT()
  const [from, setFrom] = useState<LangId>("zh")
  const [to, setTo] = useState<LangId>("en")
  const [input, setInput] = useState("")
  const [playing, setPlaying] = useState(false)
  const [tone, setTone] = useState<ToneId>("neutral")
  const [picker, setPicker] = useState<Side | null>(null)
  const [menu, setMenu] = useState(false)
  /** 正在拾音的语言区：真实录音不可用，这里只做状态呈现，避免静默无反馈 */
  const [listening, setListening] = useState<Side | null>(null)
  const voiceCursor = useRef(0)
  const [, addRecord] = useSavedRecords()

  const result = useMemo(() => translatePhrase(input, from, to), [input, from, to])
  const toneText = applyTone(result.text, to, tone)
  const hasInput = input.trim().length > 0
  const modeNote =
    result.mode === "exact"
      ? null
      : result.mode === "mixed"
        ? t("text.modeMixed")
        : t("text.modeNone")

  useEscapeKey(() => {
    if (picker) setPicker(null)
    else if (menu) setMenu(false)
    else onClose()
  })

  const swap = () => {
    setFrom(to)
    setTo(from)
    // 双向对译：把当前译文带回输入框，符合「交换语言」的直觉
    if (hasInput && result.mode !== "none") setInput(result.text)
  }

  const pick = (side: Side, lang: LangId) => {
    if (side === "from") setFrom(lang)
    else setTo(lang)
    setPicker(null)
  }

  const play = () => {
    setPlaying(true)
    window.setTimeout(() => setPlaying(false), 1800)
    toast(t("text.reading"))
  }

  /**
   * 语音输入：点按后按当前语言取一句高频表达填入对应区域。
   * 真实拾音不可用时也必须给出明确反馈，不能静默无响应。
   */
  const dictate = (side: Side) => {
    if (listening) {
      setListening(null)
      return
    }
    setListening(side)
    const lang = side === "from" ? from : to
    window.setTimeout(() => {
      const list = sentences[lang] ?? sentences.zh
      const text = list[voiceCursor.current % list.length]
      voiceCursor.current += 1
      setInput(text)
      setListening(null)
      if (side === "to" && lang !== from) {
        // 说的是译文语言：交换语向，让这句话成为新的「原文」
        setFrom(lang)
        setTo(from)
      }
    }, 1200)
  }

  const clear = () => {
    setInput("")
    setMenu(false)
    toast(t("text.cleared"))
  }

  const copyOut = async () => {
    const ok = await copyText(result.text || "")
    toast(ok ? t("text.copied") : t("text.copyFail"))
    setMenu(false)
  }

  const saveRecord = () => {
    if (!hasInput) return
    addRecord({
      title: input.trim().slice(0, 18),
      meta: `${langOption(from).label} → ${langOption(to).label}`,
      summary: toneText || t("text.modeNone"),
      type: "文本",
      lines: [
        {
          speaker: langOption(from).short,
          original: input.trim(),
          translated: toneText || t("text.modeNone"),
        },
      ],
    })
    setMenu(false)
    toast(t("text.saved"))
  }

  const exportRecord = () => {
    downloadText(
      "text-translate.txt",
      recordToText({
        id: "text",
        title: input.trim().slice(0, 18) || langOption(from).short,
        meta: `${langOption(from).label} → ${langOption(to).label}`,
        time: "",
        summary: toneText || "",
        type: "文本",
        lines: [
          {
            speaker: langOption(from).short,
            original: input.trim(),
            translated: toneText || "",
          },
        ],
      }),
    )
    setMenu(false)
    toast(t("text.saved"))
  }

  const tabs: { id: FeatureId; label: string; icon: IconName }[] = [
    { id: "text", label: t("speak.tabTranslate"), icon: "translate" },
    { id: "camera", label: t("speak.tabCamera"), icon: "camera" },
    { id: "dialogue", label: t("speak.tabConversation"), icon: "users" },
  ]

  const langRow = (side: Side, lang: LangId, tag: string) => (
    <div className={`tt-lane ${side}`}>
      <div className="tt-lane-head">
        <AppButton
          className="tt-lane-lang"
          onClick={() => setPicker(side)}
          ariaLabel={tag}
        >
          {langOption(lang).label}
          <Icon name="chevron" size={13} />
        </AppButton>
      </div>
      {side === "from" ? (
        <textarea
          className="tt-lane-text"
          placeholder={langOption(lang).native}
          value={input}
          rows={2}
          aria-label={tag}
          onChange={(event) => setInput(event.target.value)}
        />
      ) : (
        <p className={`tt-lane-text readonly ${hasInput ? "" : "empty"}`}>
          {hasInput ? toneText || t("text.modeNone") : langOption(lang).native}
        </p>
      )}
      <AppButton
        ariaLabel={listening === side ? t("text.listening") : t("text.voice")}
        className={`tt-lane-mic ${listening === side ? "listening" : ""}`}
        onClick={() => dictate(side)}
      >
        <Icon name="mic" size={24} />
      </AppButton>
    </div>
  )

  const moreMenu = (
    <div className="speak-popover speak-pop-more">
      <AppButton
        className={hasInput ? "" : "active"}
        onClick={() => {
          setMenu(false)
          play()
        }}
        disabled={!hasInput}
      >
        <span className="speak-pop-mark" />
        <Icon name={playing ? "pause" : "audio"} size={19} />
        <span className="speak-pop-label">{t("text.reading")}</span>
      </AppButton>
      <AppButton onClick={copyOut} disabled={!hasInput}>
        <span className="speak-pop-mark" />
        <Icon name="notes" size={19} />
        <span className="speak-pop-label">{t("text.copy")}</span>
      </AppButton>
      <AppButton onClick={saveRecord} disabled={!hasInput}>
        <span className="speak-pop-mark" />
        <Icon name="plus" size={19} />
        <span className="speak-pop-label">{t("text.save")}</span>
      </AppButton>
      <AppButton onClick={exportRecord} disabled={!hasInput}>
        <span className="speak-pop-mark" />
        <Icon name="plane" size={19} />
        <span className="speak-pop-label">{t("call.export")}</span>
      </AppButton>
      <hr />
      <div className="tt-tone-row">
        {(["neutral", "formal", "casual"] as ToneId[]).map((id) => (
          <AppButton
            key={id}
            className={tone === id ? "active" : ""}
            onClick={() => setTone(id)}
          >
            {id === "neutral"
              ? t("tone.neutral")
              : id === "formal"
                ? t("tone.formal")
                : t("tone.casual")}
          </AppButton>
        ))}
      </div>
      {hasInput ? (
        <>
          <hr />
          <AppButton className="danger" onClick={clear}>
            <span className="speak-pop-mark" />
            <Icon name="close" size={19} />
            <span className="speak-pop-label">{t("text.clear")}</span>
          </AppButton>
        </>
      ) : null}
    </div>
  )

  return (
    <div className="tt-page">
      {menu ? <div className="speak-scrim" onClick={() => setMenu(false)} /> : null}

      <header className="tt-bar">
        <AppButton
          ariaLabel={t("speak.back")}
          className="speak-bar-back"
          onClick={onClose}
        >
          <Icon name="chevron" size={18} />
        </AppButton>
        <h1 className="tt-bar-title">{t("speak.tabTranslate")}</h1>
        <AppButton
          ariaLabel={t("text.more")}
          className={`speak-bar-more ${menu ? "open" : ""}`}
          onClick={() => setMenu((v) => !v)}
        >
          <Icon name="more" size={18} />
        </AppButton>
        {menu ? moreMenu : null}
      </header>

      <main className="tt-card">
        {langRow("from", from, t("dialogue.myLang"))}
        <div className="tt-swap-row">
          <AppButton
            ariaLabel={t("dialogue.swapLang")}
            className="tt-swap"
            onClick={swap}
          >
            <Icon name="swap" size={17} />
          </AppButton>
        </div>
        {langRow("to", to, t("dialogue.otherLang"))}
        {modeNote && hasInput ? <p className="tt-note">{modeNote}</p> : null}
      </main>

      <nav className="speak-tabs">
        {tabs.map((tab) => (
          <AppButton
            key={tab.id}
            className={tab.id === "text" ? "active" : ""}
            onClick={() => {
              if (tab.id !== "text") onNavigate?.(tab.id)
            }}
          >
            <Icon name={tab.icon} size={19} />
            <span>{tab.label}</span>
          </AppButton>
        ))}
      </nav>

      <LangPicker
        open={picker !== null}
        title={t("speak.pickLanguage")}
        value={picker === "to" ? to : from}
        onPick={(id) => pick(picker ?? "from", id)}
        onClose={() => setPicker(null)}
      />
    </div>
  )
}

export default TextTranslate
