import { useEffect, useState } from "react"



export type FeatureId = "dialogue" | "meeting" | "travel" | "camera"

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 存储不可用时静默降级 */
    }
  }, [key, value])

  return [value, setValue] as const
}

export function useEscapeKey(handler: () => void) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler()
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [handler])
}

export function transitionTo(update: () => void) {
  const documentWithTransitions = document as Document & {
    startViewTransition?: (callback: () => void) => void
  }

  if (documentWithTransitions.startViewTransition) {
    documentWithTransitions.startViewTransition(update)
  } else {
    update()
  }
}
