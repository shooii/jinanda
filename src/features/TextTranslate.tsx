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
  useFavorites,
  useSavedRecords,
} from "@/lib/store"
import { langOption, sentences, translatePhrase, applyTone, detectLang } from "@/lib/translate"
import type { LangId, ToneId } from "@/lib/translate"
import { useAppLanguage, useT } from "@/lib/i18n"

type Side = "from" | "to"
/** 源语言可以是具体语言，也可以是「检测语言」 */
type FromLang = LangId | "auto"

export function TextTranslate({
  onClose,
  onNavigate,
}: {
  onClose: () => void
  onNavigate?: (feature: FeatureId) => void
}) {
  const t = useT()
  const [from, setFrom] = useState<FromLang>("zh")
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
  const { hasFavorite, toggleFavorite } = useFavorites()

  /** 源语言选「检测语言」时，按输入内容实时推断语种 */
  const [appLang] = useAppLanguage()
  const detected = useMemo(() => detectLang(input), [input])
  const effFrom: LangId = from === "auto" ? detected : from
  /**
   * 检测结果与目标语言相同时，「原文即译文」等于没有翻译。
   * 此时自动改译到界面语言（界面语言正好相同则退回中英互译），
   * 目标语按钮会如实显示最终使用的语言，用户仍可点开覆盖。
   */
  const effTo: LangId =
    from === "auto" && detected === to
      ? appLang !== detected
        ? appLang
        : detected === "zh"
          ? "en"
          : "zh"
      : to

  const result = useMemo(() => translatePhrase(input, effFrom, effTo), [input, effFrom, effTo])
  const toneText = applyTone(result.text, effTo, tone)
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
    setTo(effFrom)
    // 双向对译：把当前译文带回输入框，符合「交换语言」的直觉
    if (hasInput && result.mode !== "none") setInput(result.text)
  }

  const pick = (side: Side, lang: FromLang) => {
    if (side === "from") setFrom(lang)
    else setTo(lang as LangId)
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
    const lang = side === "from" ? effFrom : effTo
    window.setTimeout(() => {
      const list = sentences[lang] ?? sentences.zh
      const text = list[voiceCursor.current % list.length]
      voiceCursor.current += 1
      setInput(text)
      setListening(null)
      if (side === "to" && lang !== effFrom) {
        // 说的是译文语言：交换语向，让这句话成为新的「原文」
        setFrom(lang)
        setTo(effFrom)
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

  /** 收藏夹：收藏「原文 + 译文」，可在常语手册的收藏页回看 */
  const favText = toneText || t("text.modeNone")
  const favorited = hasFavorite(input.trim(), favText)
  const toggleFav = () => {
    const on = toggleFavorite({
      original: input.trim(),
      translated: favText,
      from: langOption(effFrom).short,
      to: langOption(effTo).short,
    })
    toast(on ? t("phrases.favAdd") : t("phrases.favRemove"))
    setMenu(false)
  }

  const saveRecord = () => {
    if (!hasInput) return
    addRecord({
      title: input.trim().slice(0, 18),
      meta: `${langOption(effFrom).label} → ${langOption(effTo).label}`,
      summary: toneText || t("text.modeNone"),
      type: "文本",
      lines: [
        {
          speaker: langOption(effFrom).short,
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
        title: input.trim().slice(0, 18) || langOption(effFrom).short,
        meta: `${langOption(effFrom).label} → ${langOption(effTo).label}`,
        time: "",
        summary: toneText || "",
        type: "文本",
        lines: [
          {
            speaker: langOption(effFrom).short,
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
          {side === "from" && from === "auto"
            ? t("text.detect")
            : langOption(lang).label}
          <Icon name="chevron" size={13} />
        </AppButton>
        {side === "from" && from === "auto" && hasInput ? (
          <small className="tt-lane-detect">
            {/* 用语言自身名称，避免在非中文界面下回落到中文语言名 */}
            {t("text.detected").replace("{lang}", langOption(lang).native)}
          </small>
        ) : null}
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
      <AppButton onClick={toggleFav} disabled={!hasInput}>
        <span className="speak-pop-mark" />
        <Icon name="sparkles" size={19} />
        <span className="speak-pop-label">
          {favorited ? t("phrases.favRemove") : t("phrases.favAdd")}
        </span>
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
        {langRow("from", effFrom, t("dialogue.myLang"))}
        <div className="tt-swap-row">
          <AppButton
            ariaLabel={t("dialogue.swapLang")}
            className="tt-swap"
            onClick={swap}
          >
            <Icon name="swap" size={17} />
          </AppButton>
        </div>
        {langRow("to", effTo, t("dialogue.otherLang"))}
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
        value={picker === "to" ? effTo : effFrom}
        onPick={(id) => pick(picker ?? "from", id)}
        onClose={() => setPicker(null)}
        detect={
          picker === "from"
            ? {
                label: t("text.detect"),
                hint: t("session.autoDetectDetail"),
                active: from === "auto",
                onPick: () => pick("from", "auto"),
              }
            : undefined
        }
      />
    </div>
  )
}

export default TextTranslate
