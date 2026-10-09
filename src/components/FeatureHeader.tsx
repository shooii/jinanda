import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"

export function FeatureHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) {
  const t = useT()
  return (
    <header className="feature-header">
      <AppButton
        ariaLabel={t("speak.back")}
        className="feature-back"
        onClick={onClose}
      >
        <Icon name="chevron" />
      </AppButton>
      <div className="feature-title">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
    </header>
  )
}

export default FeatureHeader
