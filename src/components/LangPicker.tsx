import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { allLanguages, langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"

type LangPickerProps = {
  /** null 表示关闭 */
  open: boolean
  title: string
  value: LangId
  onPick: (lang: LangId) => void
  onClose: () => void
  /**
   * 源语言侧可选：传入后在最上方显示「检测语言」入口。
   * 目标语言侧不传，避免出现「翻译成自动检测」这种无意义选项。
   */
  detect?: {
    label: string
    hint: string
    active: boolean
    onPick: () => void
  }
}

/**
 * 语言选择底部面板 —— 首页 / 对话 / 拍照翻译 / 会议共用。
 * 复用 .call-picker-* 样式，保证全站语言选择交互一致。
 */
export function LangPicker({
  open,
  title,
  value,
  onPick,
  onClose,
  detect,
}: LangPickerProps) {
  if (!open) return null
  return (
    <div className="call-picker-backdrop" onClick={onClose}>
      <div
        className="call-picker-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <span className="eyebrow">{title}</span>
          <h2>{langOption(value).native}</h2>
        </header>
        <div className="call-picker-list">
          {detect ? (
            <AppButton
              className={detect.active ? "selected auto" : "auto"}
              onClick={detect.onPick}
            >
              <span className="language-code">
                <Icon name="sparkles" size={16} />
              </span>
              <span>
                <strong>{detect.label}</strong>
                <small>{detect.hint}</small>
              </span>
              {detect.active && <Icon name="check" />}
            </AppButton>
          ) : null}
          {allLanguages.map((item) => {
            const on = value === item.id
            return (
              <AppButton
                className={on ? "selected" : ""}
                key={item.id}
                onClick={() => onPick(item.id)}
              >
                <span className="language-code">{item.id.toUpperCase()}</span>
                <span>
                  <strong>{item.native}</strong>
                  <small>{item.label}</small>
                </span>
                {on && <Icon name="check" />}
              </AppButton>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LangPicker