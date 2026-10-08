import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"

const steps = [
  { icon: "bluetooth" as const, titleKey: "onboarding.step1", detailKey: "onboarding.step1Detail" },
  { icon: "globe" as const, titleKey: "onboarding.step2", detailKey: "onboarding.step2Detail" },
  { icon: "mic" as const, titleKey: "onboarding.step3", detailKey: "onboarding.step3Detail" },
]

export function Onboarding({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label={t("onboarding.title")}>
      <div className="onboarding-card">
        <span className="onboarding-brand">
          <span className="onboarding-logo">L</span> LingoPods
        </span>
        <h1>{t("onboarding.title")}</h1>
        <p>{t("onboarding.subtitle")}</p>

        <ol className="onboarding-steps">
          {steps.map((step, index) => (
            <li key={step.titleKey}>
              <span className="onboarding-step-icon">
                <Icon name={step.icon} size={20} />
              </span>
              <div>
                <strong>
                  <em>{index + 1}</em>
                  {t(step.titleKey)}
                </strong>
                <small>{t(step.detailKey)}</small>
              </div>
            </li>
          ))}
        </ol>

        <AppButton className="onboarding-cta" onClick={onClose}>
          {t("onboarding.cta")}
        </AppButton>
      </div>
    </div>
  )
}

export default Onboarding
