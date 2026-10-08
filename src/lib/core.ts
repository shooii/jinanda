import { useEffect, useState } from "react"
import type { LangId } from "@/lib/translate"



export type FeatureId =
  | "dialogue"
  | "meeting"
  | "travel"
  | "camera"
  | "text"
  | "call"
  | "watch"
  | "coach"

export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    // 支持惰性初值：迁移历史数据等场景无需在渲染期重复计算
    const fallback =
      typeof initial === "function" ? (initial as () => T)() : initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
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

/**
 * 全局「我的语言 / 对方语言」——首页、对话、随身译、音视频通话共用同一份状态。
 * 旧版本每个页面各存一份（lingo.home-*、lingo.dialogue-*、lingo.speak-*、lingo.call-*），
 * 导致在首页改了语言、进会议却还是旧值。这里以 lingo.pair-* 为唯一来源，
 * 首次读取时按优先级迁移历史值，之后各页面共享，切换任意一处全局生效。
 */
const LEGACY_ME_KEYS = [
  "lingo.home-my-lang",
  "lingo.dialogue-my-lang",
  "lingo.speak-me",
  "lingo.call-me-lang",
]
const LEGACY_THEM_KEYS = [
  "lingo.home-them-lang",
  "lingo.dialogue-them-lang",
  "lingo.speak-them",
  "lingo.call-them-lang",
]

function readLegacyLang(keys: string[]): LangId | null {
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as LangId
      if (typeof parsed === "string" && parsed) return parsed
    } catch {
      /* 忽略损坏的旧值 */
    }
  }
  return null
}

export function useLangPair() {
  const [me, setMe] = usePersistentState<LangId>("lingo.pair-me", () => {
    const legacy = readLegacyLang(LEGACY_ME_KEYS)
    return legacy ?? "zh"
  })
  const [them, setThem] = usePersistentState<LangId>("lingo.pair-them", () => {
    const legacy = readLegacyLang(LEGACY_THEM_KEYS)
    return legacy ?? "en"
  })

  /** 交换双方语言，首页与通话页共用同一动作 */
  const swap = () => {
    setMe(them)
    setThem(me)
  }

  return { me, them, setMe, setThem, swap }
}
