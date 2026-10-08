import { useEffect } from "react"
import type { IconName } from "@/components/Icon"
import { usePersistentState } from "@/lib/core"



export type ThemeMode = "light" | "dark" | "system"

export const themeModes: {
  id: ThemeMode
  icon: IconName
}[] = [
  { id: "light", icon: "sun" },
  { id: "dark", icon: "moon" },
  { id: "system", icon: "monitor" },
]

/** 主题项的文案 key：theme.<id> / theme.<id>Detail */
export const themeLabelKey = (mode: ThemeMode) => `theme.${mode}`
export const themeDetailKey = (mode: ThemeMode) => `theme.${mode}Detail`

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return mode
}

export function useThemeMode() {
  const [mode, setMode] = usePersistentState<ThemeMode>(
    "lingo.theme",
    "system",
  )

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(mode)
    }
    apply()
    if (mode === "system") {
      media.addEventListener("change", apply)
      return () => media.removeEventListener("change", apply)
    }
  }, [mode])

  return [mode, setMode] as const
}
