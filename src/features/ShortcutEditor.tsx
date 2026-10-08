import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export type Shortcut = {
  id: string
  title: string
  detail: string
  icon: IconName
  enabled: boolean
}

export const defaultShortcuts: Shortcut[] = [
  {
    id: "meeting",
    title: "会议记录",
    detail: "转写与 AI 纪要",
    icon: "calendar",
    enabled: true,
  },
  {
    id: "travel",
    title: "旅行模式",
    detail: "离线也能使用",
    icon: "plane",
    enabled: true,
  },
  {
    id: "camera",
    title: "拍照翻译",
    detail: "菜单、路牌与文档",
    icon: "camera",
    enabled: true,
  },
  {
    id: "call",
    title: "音视频通话",
    detail: "通话实时翻译",
    icon: "phone",
    enabled: true,
  },
  {
    id: "text",
    title: "文本翻译",
    detail: "输入或粘贴文字",
    icon: "notes",
    enabled: false,
  },
  {
    id: "watch",
    title: "媒体同传",
    detail: "电影 · 网课听成母语",
    icon: "monitor",
    enabled: false,
  },
  {
    id: "coach",
    title: "口语教练",
    detail: "AI 评分你的发音",
    icon: "sparkles",
    enabled: false,
  },
]

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
  if (!missing.length) return stored
  return [...stored, ...missing.map((item) => ({ ...item }))]
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
  const [draft, setDraft] = useState(shortcuts)
  const [notice, setNotice] = useState("首页最多展示 5 个快捷功能")
  useEscapeKey(onClose)
  const enabled = draft.filter((item) => item.enabled)
  const available = draft.filter((item) => !item.enabled)

  const toggle = (id: string) => {
    const target = draft.find((item) => item.id === id)
    if (!target) return
    if (!target.enabled && enabled.length >= 5) {
      setNotice("请先移除一个快捷功能，再添加新的")
      return
    }
    if (target.enabled && enabled.length <= 2) {
      setNotice("至少保留 2 个快捷功能")
      return
    }
    setDraft((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
    setNotice(target.enabled ? "已移至更多功能" : "已添加到首页")
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
    setNotice("排序已更新")
  }

  return (
    <div className="editor-backdrop" onClick={onClose}>
      <div
        className="shortcut-editor"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="编辑快捷功能"
      >
        <header className="editor-header">
          <AppButton
            ariaLabel="取消编辑"
            className="editor-close"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </AppButton>
          <div>
            <strong>编辑快捷功能</strong>
            <small>按你的使用习惯排列首页</small>
          </div>
          <AppButton className="editor-save" onClick={() => onSave(draft)}>
            完成
          </AppButton>
        </header>

        <div className="editor-hint">
          <Icon name="sparkles" size={16} />
          <span>{notice}</span>
          <b>{enabled.length}/5</b>
        </div>

        <section className="editor-section">
          <div className="editor-section-title">
            <span>首页快捷功能</span>
            <AppButton
              onClick={() => {
                setDraft(defaultShortcuts.map((item) => ({ ...item })))
                setNotice("已恢复默认排序")
              }}
            >
              恢复默认
            </AppButton>
          </div>
          <div className="shortcut-list">
            {enabled.map((item, index) => (
              <div className="shortcut-edit-row" key={item.id}>
                <span className="edit-row-icon">
                  <Icon name={item.icon} size={19} />
                </span>
                <span className="edit-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <span className="order-actions">
                  <AppButton
                    ariaLabel={`上移${item.title}`}
                    className={index === 0 ? "disabled up" : "up"}
                    onClick={() => move(item.id, -1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                  <AppButton
                    ariaLabel={`下移${item.title}`}
                    className={
                      index === enabled.length - 1 ? "disabled down" : "down"
                    }
                    onClick={() => move(item.id, 1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                </span>
                <AppButton
                  ariaLabel={`移除${item.title}`}
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
            <span>更多功能</span>
            <small>点击添加到首页</small>
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
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className="add-shortcut">
                    <Icon name="plus" size={17} />
                  </span>
                </AppButton>
              ))
            ) : (
              <div className="all-added">
                <Icon name="check" size={16} /> 所有功能都已添加到首页
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ShortcutEditor
