import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { usePersistentState } from "@/lib/core"
import { useFavorites, usePhrases } from "@/lib/store"
import type { FavoriteEntry } from "@/lib/store"
import { langOption, translatePhraseOf } from "@/lib/translate"
import type { LangId } from "@/lib/translate"
import { useT } from "@/lib/i18n"

type Tab = "phrases" | "favorites"

/**
 * 常用语手册 + 收藏夹。
 * 常用语统一以中文存储，展示时按「目标语言」实时翻译；
 * 收藏夹收录来自记录页 / 文本翻译的原文 + 译文。
 */
export function Phrasebook({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [tab, setTab] = useState<Tab>("phrases")
  const [draft, setDraft] = useState("")
  const [picker, setPicker] = useState(false)
  const [to, setTo] = usePersistentState<LangId>("lingo.phrasebook-to", "en")
  const { phrases, addPhrase, removePhrase } = usePhrases()
  const { favorites, removeFavorite } = useFavorites()
  /** 正在「朗读」的条目 id，用于给出明确反馈（原型无真实 TTS） */
  const [speaking, setSpeaking] = useState<string | null>(null)

  const speak = (id: string) => {
    setSpeaking(id)
    toast(t("phrases.play"))
    window.setTimeout(() => {
      setSpeaking((current) => (current === id ? null : current))
    }, 1200)
  }

  const add = () => {
    if (!addPhrase(draft)) return
    setDraft("")
    toast(t("phrases.added"))
  }

  const row = (
    id: string,
    original: string,
    translated: string,
    onRemove: () => void,
  ) => (
    <div className="ph-row" key={id}>
      <div className="ph-row-copy">
        <strong>{original}</strong>
        <small className={translated ? "" : "empty"}>
          {translated || t("text.modeNone")}
        </small>
      </div>
      <AppButton
        ariaLabel={t("phrases.play")}
        className={speaking === id ? "ph-icon playing" : "ph-icon"}
        onClick={() => speak(id)}
      >
        <Icon name={speaking === id ? "pause" : "volume"} size={18} />
      </AppButton>
      <AppButton
        ariaLabel={t("phrases.delete")}
        className="ph-icon danger"
        onClick={onRemove}
      >
        <Icon name="close" size={17} />
      </AppButton>
    </div>
  )

  return (
    <div className="feature-flow ph-book">
      <FeatureHeader
        onClose={onClose}
        subtitle={t("phrases.subtitle")}
        title={t("phrases.title")}
      />

      <div className="ph-tabs" role="tablist">
        <AppButton
          className={tab === "phrases" ? "active" : ""}
          onClick={() => setTab("phrases")}
        >
          <Icon name="message" size={17} />
          <span>{t("phrases.tabPhrases")}</span>
        </AppButton>
        <AppButton
          className={tab === "favorites" ? "active" : ""}
          onClick={() => setTab("favorites")}
        >
          <Icon name="sparkles" size={17} />
          <span>{t("phrases.tabFav")}</span>
        </AppButton>
      </div>

      <div className="ph-target">
        <small>{t("camera.targetLang")}</small>
        <AppButton className="ph-target-btn" onClick={() => setPicker(true)}>
          {langOption(to).native}
          <Icon name="chevron" size={13} />
        </AppButton>
      </div>

      <main className="ph-body">
        {tab === "phrases" ? (
          <>
            <div className="ph-add">
              <input
                aria-label={t("phrases.placeholder")}
                maxLength={80}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") add()
                }}
                placeholder={t("phrases.placeholder")}
                value={draft}
              />
              <AppButton
                ariaLabel={t("phrases.tabPhrases")}
                className="ph-add-btn"
                disabled={!draft.trim()}
                onClick={add}
              >
                <Icon name="plus" size={18} />
              </AppButton>
            </div>
            <section className="ph-list">
              {phrases.length === 0 ? (
                <p className="empty-tip">{t("phrases.emptyPhrases")}</p>
              ) : (
                phrases.map((item) =>
                  row(
                    item.id,
                    item.text,
                    translatePhraseOf(item.text, to) || "",
                    () => {
                      removePhrase(item.id)
                      toast(t("phrases.removed"))
                    },
                  ),
                )
              )}
            </section>
          </>
        ) : (
          <section className="ph-list">
            {favorites.length === 0 ? (
              <p className="empty-tip">{t("phrases.emptyFav")}</p>
            ) : (
              favorites.map((item: FavoriteEntry) =>
                row(item.id, item.original, item.translated, () => {
                  removeFavorite(item.id)
                  toast(t("phrases.favRemove"))
                }),
              )
            )}
          </section>
        )}
      </main>

      <LangPicker
        onClose={() => setPicker(false)}
        onPick={(id) => {
          setTo(id)
          setPicker(false)
        }}
        open={picker}
        title={t("camera.targetLang")}
        value={to}
      />
    </div>
  )
}

export default Phrasebook
