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
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      <AppButton ariaLabel="功能设置" className="feature-settings">
        <Icon name="settings" size={19} />
      </AppButton>
    </header>
  )
}

export default FeatureHeader
