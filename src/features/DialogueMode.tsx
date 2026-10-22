import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { UpgradePaywallModal } from "@/components/UpgradePaywallModal"
import { useLangPair } from "@/lib/core"
import { useT } from "@/lib/i18n"
import { useDevices } from "@/lib/store"
import { useUsage } from "@/lib/usage"
import { langOption } from "@/lib/translate"
export type DialogueModeId = "share" | "hybrid" | "speaker"

export function DialogueMode({
  onClose,
  onStart,
  mode,
  onModeChange,
}: {
  onClose: () => void
  onStart: () => void
  mode: DialogueModeId
  onModeChange: (mode: DialogueModeId) => void
}) {
  const t = useT()
  const { active } = useDevices()
  const connected = active.status === "connected"
  const { gate, quotaOf } = useUsage()
  const [paywall, setPaywall] = useState(false)
  const dialogueQuota = quotaOf("dialogue")
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
      id: "share" as DialogueModeId,
      title: t("dialogue.modeShare"),
      detail: t("dialogue.modeShareDetail"),
      icon: "headphones" as IconName,
    },
    {
      id: "hybrid" as DialogueModeId,
      title: t("dialogue.modeHybrid"),
      detail: t("dialogue.modeHybridDetail"),
      icon: "profile" as IconName,
    },
    {
      id: "speaker" as DialogueModeId,
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
          <span>选择一种开始</span>
        </div>
        <section className="dialogue-modes" role="radiogroup" aria-label={t("dialogue.modesHeading")}>
          {modes.map((item) => (
            <AppButton
              className={`dialogue-mode-card ${
                mode === item.id ? "active" : ""
              }`}
              role="radio"
              ariaChecked={mode === item.id}
              key={item.id}
              onClick={() => onModeChange(item.id)}
            >
              <span className="dialogue-mode-icon"><Icon name={item.icon} size={22} /></span>
              <span className="dialogue-mode-copy">
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <i className="mode-radio">{mode === item.id && <span />}</i>
            </AppButton>
          ))}
        </section>

      </main>
      <footer className="dialogue-start-bar">
        <div>
          <p>
            <strong>{!connected && mode !== "speaker" ? "耳机未连接 · 将使用手机麦克风与扬声器" : mode === "speaker" ? "声音由手机播放" : "双耳已就绪 · 可开始对话"}</strong>
            {dialogueQuota.kind === "daily" ? (
              <small className="quota-inline">
                今日剩余 {Math.round(dialogueQuota.remaining)} 分钟
              </small>
            ) : null}
          </p>
        </div>
        <AppButton
          onClick={() => {
            // 门禁放在动作发生的那一刻，而不是进页面就拦
            const result = gate("dialogue")
            if (!result.allowed) {
              toast("今日免费同传额度已用完")
              setPaywall(true)
              return
            }
            onStart()
          }}
        >
          <Icon name="mic" size={20} /> {t("dialogue.start")}
        </AppButton>
      </footer>

      {paywall ? (
        <UpgradePaywallModal
          reason="quota_exceeded"
          onClose={() => setPaywall(false)}
                 />
      ) : null}

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
