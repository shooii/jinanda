import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { usePersistentState, useLangPair } from "@/lib/core"
import { useT } from "@/lib/i18n"
import { langOption } from "@/lib/translate"



export function ModeIllustration({ mode }: { mode: string }) {
  return (
    <span
      className={`mode-illustration illustration-${mode}`}
      aria-hidden="true"
    >
      <span className="scene-user scene-me">
        <i className="scene-head">
          <b className="scene-bud" />
        </i>
        <i className="scene-body" />
        <small>我</small>
      </span>
      <span className="scene-route">
        <i />
        <i />
        <i />
      </span>
      <span className="scene-user scene-them">
        <i className="scene-head">
          <b className="scene-bud" />
        </i>
        <i className="scene-body" />
        <small>对方</small>
      </span>
      {(mode === "hybrid" || mode === "speaker") && (
        <span className="scene-phone">
          <i />
          <b className="phone-wave wave-left" />
          <b className="phone-wave wave-right" />
        </span>
      )}
    </span>
  )
}

export function DialogueMode({
  onClose,
  onStart,
}: {
  onClose: () => void
  onStart: () => void
}) {
  const t = useT()
  const [mode, setMode] = usePersistentState("lingo.dialogue-mode", "share")
  const {
    me: myLang,
    them: themLang,
    setMe: setMyLang,
    setThem: setThemLang,
    swap,
  } = useLangPair()
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const modes = [
    {
      id: "share",
      title: t("dialogue.modeShare"),
      detail: t("dialogue.modeShareDetail"),
      icon: "headphones" as IconName,
    },
    {
      id: "hybrid",
      title: t("dialogue.modeHybrid"),
      detail: t("dialogue.modeHybridDetail"),
      icon: "profile" as IconName,
    },
    {
      id: "speaker",
      title: t("dialogue.modeSpeaker"),
      detail: t("dialogue.modeSpeakerDetail"),
      icon: "audio" as IconName,
    },
  ]

  return (
    <div className="feature-flow dialogue-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle={t("dialogue.subtitle")}
        title={t("dialogue.title")}
      />
      <main className="dialogue-content">
        <section className="dialogue-language-card">
          <AppButton
            ariaLabel={t("dialogue.myLang")}
            onClick={() => setPicker("me")}
          >
            <span className="language-person">我</span>
            <p>
              <small>{t("dialogue.myLang")}</small>
              <strong>{langOption(myLang).native}</strong>
            </p>
          </AppButton>
          <AppButton
            ariaLabel={t("dialogue.swapLang")}
            className="language-swap"
            onClick={swap}
          >
            <Icon name="swap" size={17} />
          </AppButton>
          <AppButton
            ariaLabel={t("dialogue.otherLang")}
            onClick={() => setPicker("them")}
          >
            <span className="language-person other">TA</span>
            <p>
              <small>{t("dialogue.otherLang")}</small>
              <strong>{langOption(themLang).native}</strong>
            </p>
          </AppButton>
        </section>

        <div className="dialogue-section-head">
          <div>
            <h2>{t("dialogue.modesHeading")}</h2>
          </div>
          <span>{t("dialogue.modesHint")}</span>
        </div>
        <section className="dialogue-modes">
          {modes.map((item) => (
            <AppButton
              className={`dialogue-mode-card ${
                mode === item.id ? "active" : ""
              }`}
              key={item.id}
              onClick={() => setMode(item.id)}
            >
              <ModeIllustration mode={item.id} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <i className="mode-radio">{mode === item.id && <span />}</i>
            </AppButton>
          ))}
        </section>

        <div className="dialogue-privacy">
          <Icon name="headphones" size={18} />
          <span>
            <strong>{t("dialogue.privacyTitle")}</strong>
            <small>{t("dialogue.privacySub")}</small>
          </span>
        </div>
      </main>
      <footer className="dialogue-start-bar">
        <div>
          <span className="connected-dot" />
          <p>
            <strong>{t("dialogue.deviceReady")}</strong>
            <small>{t("dialogue.delay")}</small>
          </p>
        </div>
        <AppButton onClick={onStart}>
          <Icon name="mic" size={20} /> {t("dialogue.start")}
        </AppButton>
      </footer>

      <LangPicker
        onClose={() => setPicker(null)}
        onPick={(id) => {
          if (picker === "me") setMyLang(id)
          else setThemLang(id)
          setPicker(null)
        }}
        open={picker !== null}
        title={picker === "me" ? t("dialogue.myLang") : t("dialogue.otherLang")}
        value={picker === "me" ? myLang : themLang}
      />
    </div>
  )
}

export default DialogueMode
