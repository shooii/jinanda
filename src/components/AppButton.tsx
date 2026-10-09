import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"



export let toastListener: ((message: string) => void) | null = null

/** 轻提示：用于反馈操作结果（保存成功、已复制、请先填写等） */
export function toast(message: string) {
  toastListener?.(message)
}

export function AppToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    toastListener = (text) => {
      setMessage(text)
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setMessage(null), 2000)
    }
    return () => {
      toastListener = null
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  if (!message) return null
  return (
    <div className="saved-toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export function AppButton({
  children,
  className = "",
  onClick,
  ariaLabel,
  ariaPressed,
  disabled,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  ariaLabel?: string
  /** 用于「多选一」的选项芯片：让读屏也能知道当前选中项，不单靠颜色 */
  ariaPressed?: boolean
  disabled?: boolean
}) {
  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export default AppButton
