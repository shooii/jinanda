import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"

/**
 * 统一切换行：可选图标 + 标题 + 说明 + 右侧开关。
 * 整行可点、语义为 button（可键盘操作），避免「长得像开关但点不动」。
 * 全站开关统一用这一套，不再各处各写一份视觉。
 */
export function SwitchRow({
  title,
  detail,
  on,
  onToggle,
  icon,
}: {
  title: string
  detail?: string
  on: boolean
  onToggle: () => void
  icon?: IconName
}) {
  return (
    <AppButton ariaLabel={title} className="switch-row" onClick={onToggle}>
      {icon ? (
        <span className="switch-row-icon">
          <Icon name={icon} size={17} />
        </span>
      ) : null}
      <span className="switch-row-copy">
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      <i className={on ? "switch on" : "switch"} aria-hidden="true">
        <b />
      </i>
    </AppButton>
  )
}

export default SwitchRow
