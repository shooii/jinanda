import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { useT } from "@/lib/i18n"

/**
 * 快捷功能目录：只存 id / 图标 / 是否启用。
 * 名称与说明统一走 i18n（feature.<id> / feature.<id>Detail），
 * 不再把中文写进 localStorage，切换界面语言时首页磁贴会跟着变。
 */
export type Shortcut = {
  id: string
  icon: IconName
  enabled: boolean
}

export const defaultShortcuts: Shortcut[] = [
  { id: "meeting", icon: "calendar", enabled: true },
  { id: "travel", icon: "plane", enabled: true },
  { id: "camera", icon: "camera", enabled: true },
  { id: "call", icon: "phone", enabled: true },
  { id: "phrasebook", icon: "message", enabled: true },
  { id: "text", icon: "notes", enabled: false },
  { id: "watch", icon: "monitor", enabled: false },
  { id: "coach", icon: "sparkles", enabled: false },
]

/** 首页最多展示的快捷功能数量 */
export const MAX_SHORTCUTS = 5
/** 至少保留的快捷功能数量 */
export const MIN_SHORTCUTS = 2

/** 按 id 取功能名与说明，缺 key 时回退到 id 本身，避免出现空白磁贴 */
export function shortcutLabel(
  t: (key: string) => string,
  id: string,
): { title: string; detail: string } {
  const title = t(`feature.${id}`)
  const detail = t(`feature.${id}Detail`)
  return {
    title: title.includes("feature.") ? id : title,
    detail: detail.includes("feature.") ? "" : detail,
  }
}

/**
 * 用最新目录补齐历史数据。
 * localStorage 里的 shortcuts 是「整体替换」语义，老用户存的旧数组缺少后来新增的功能
 * （例如「音视频通话」），会导致新功能在首页与「更多功能」里都不可见。
 * 这里保留用户自己的启用状态与排序，只把目录里缺失的条目按默认值追加到末尾。
 */
export function mergeShortcuts(stored: Shortcut[]): Shortcut[] {
  if (!Array.isArray(stored) || stored.length === 0) {
    return defaultShortcuts.map((item) => ({ ...item }))
  }
  const known = new Set(stored.map((item) => item?.id))
  const missing = defaultShortcuts.filter((item) => !known.has(item.id))
  const restored = stored.map((item) => ({
    id: item.id,
    icon: item.icon ?? defaultShortcuts.find((d) => d.id === item.id)?.icon ?? "sparkles",
    enabled: item.enabled !== false,
  })) as Shortcut[]
  if (!missing.length) return restored
  return [...restored, ...missing.map((item) => ({ ...item }))]
}

export function ShortcutEditor({
  shortcuts,
  onClose,
  onSave,
}: {
  shortcuts: Shortcut[]
  onClose: () => void
  onSave: (shortcuts: Shortcut[]) => void
}) {
  const t = useT()
  const [draft, setDraft] = useState(shortcuts)
  const [notice, setNotice] = useState(t("shortcut.limit"))
  useEscapeKey(onClose)
  const enabled = draft.filter((item) => item.enabled)
  const available = draft.filter((item) => !item.enabled)

  const toggle = (id: string) => {
    const target = draft.find((item) => item.id === id)
    if (!target) return
    if (!target.enabled && enabled.length >= MAX_SHORTCUTS) {
      setNotice(t("shortcut.full"))
      return
    }
    if (target.enabled && enabled.length <= MIN_SHORTCUTS) {
      setNotice(t("shortcut.min"))
      return
    }
    setDraft((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
    setNotice(target.enabled ? t("shortcut.movedOut") : t("shortcut.added"))
  }

  const move = (id: string, direction: -1 | 1) => {
    const activeItems = draft.filter((item) => item.enabled)
    const currentIndex = activeItems.findIndex((item) => item.id === id)
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= activeItems.length) return
    const reordered = [...activeItems]
    ;[reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ]
    const inactiveItems = draft.filter((item) => !item.enabled)
    setDraft([...reordered, ...inactiveItems])
    setNotice(t("shortcut.reordered"))
  }

  return (
    <div className="editor-backdrop" onClick={onClose}>
      <div
        className="shortcut-editor"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("shortcut.edit")}
      >
        <header className="editor-header">
          <AppButton
            ariaLabel={t("shortcut.edit")}
            className="editor-close"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </AppButton>
          <div>
            <strong>{t("shortcut.edit")}</strong>
            <small>{t("shortcut.editHint")}</small>
          </div>
          <AppButton className="editor-save" onClick={() => onSave(draft)}>
            {t("shortcut.done")}
          </AppButton>
        </header>

        <div className="editor-hint">
          <Icon name="sparkles" size={16} />
          <span>{notice}</span>
          <b>{enabled.length}/{MAX_SHORTCUTS}</b>
        </div>

        <section className="editor-section">
          <div className="editor-section-title">
            <span>{t("shortcut.enabled")}</span>
            <AppButton
              onClick={() => {
                setDraft(defaultShortcuts.map((item) => ({ ...item })))
                setNotice(t("shortcut.resetDone"))
              }}
            >
              {t("shortcut.reset")}
            </AppButton>
          </div>
          <div className="shortcut-list">
            {enabled.map((item, index) => (
              <div className="shortcut-edit-row" key={item.id}>
                <span className="edit-row-icon">
                  <Icon name={item.icon} size={19} />
                </span>
                <span className="edit-row-copy">
                  <strong>{shortcutLabel(t, item.id).title}</strong>
                  <small>{shortcutLabel(t, item.id).detail}</small>
                </span>
                <span className="order-actions">
                  <AppButton
                    ariaLabel={`↑ ${shortcutLabel(t, item.id).title}`}
                    className={index === 0 ? "disabled up" : "up"}
                    onClick={() => move(item.id, -1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                  <AppButton
                    ariaLabel={`↓ ${shortcutLabel(t, item.id).title}`}
                    className={
                      index === enabled.length - 1 ? "disabled down" : "down"
                    }
                    onClick={() => move(item.id, 1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                </span>
                <AppButton
                  ariaLabel={`${t("shortcut.available")} ${shortcutLabel(t, item.id).title}`}
                  className="remove-shortcut"
                  onClick={() => toggle(item.id)}
                >
                  <Icon name="close" size={15} />
                </AppButton>
              </div>
            ))}
          </div>
        </section>

        <section className="editor-section more-section">
          <div className="editor-section-title">
            <span>{t("shortcut.available")}</span>
            <small>{t("shortcut.added")}</small>
          </div>
          <div className="shortcut-list">
            {available.length ? (
              available.map((item) => (
                <AppButton
                  className="shortcut-edit-row available-row"
                  key={item.id}
                  onClick={() => toggle(item.id)}
                >
                  <span className="edit-row-icon">
                    <Icon name={item.icon} size={19} />
                  </span>
                  <span className="edit-row-copy">
                    <strong>{shortcutLabel(t, item.id).title}</strong>
                    <small>{shortcutLabel(t, item.id).detail}</small>
                  </span>
                  <span className="add-shortcut">
                    <Icon name="plus" size={17} />
                  </span>
                </AppButton>
              ))
            ) : (
              <div className="all-added">
                <Icon name="check" size={16} /> {t("shortcut.allAdded")}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ShortcutEditor
