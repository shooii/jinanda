import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"



export let toastListener: ((message: string) => void) | null = null

export function demoToast(message = "原型演示：该功能开发中") {
  toastListener?.(message)
}

export function DemoToast() {
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
    <div className="saved-toast demo-toast" role="status">
      {message}
    </div>
  )
}

export function AppButton({
  children,
  className = "",
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={className}
      onClick={onClick ?? (() => demoToast())}
      type="button"
    >
      {children}
    </button>
  )
}

export default AppButton
