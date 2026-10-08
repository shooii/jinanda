import type { ReactNode } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



/**
 * 通用信息弹层：法务文档、保修信息、服务状态等只读内容共用。
 * 复用 profile-panel 的既有样式，保持与其它弹层一致的观感。
 */
export function InfoSheet({
  title,
  eyebrow,
  icon,
  onClose,
  children,
}: {
  title: string
  eyebrow?: string
  icon?: IconName
  onClose: () => void
  children: ReactNode
}) {
  useEscapeKey(onClose)

  return (
    <div
      className="profile-panel-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" />
        <header>
          <div>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h2>{title}</h2>
          </div>
          <AppButton ariaLabel={`关闭${title}`} onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>
        {icon ? (
          <span className="info-sheet-icon">
            <Icon name={icon} size={26} />
          </span>
        ) : null}
        {children}
      </div>
    </div>
  )
}

export default InfoSheet
