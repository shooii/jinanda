import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"



export function FeatureHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <header className="feature-header">
      <AppButton
        ariaLabel="返回首页"
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
