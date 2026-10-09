/**
 * 文档语言与书写方向。
 *
 * index.html 上的 lang 与 dir 是写死的，界面语言切到阿拉伯语后仍然是
 * 「zh-CN + LTR」——读屏、断行与整份布局都会错。这个 hook 负责在语言变化时
 * 把它们同步到 <html>。
 */

import { useEffect } from "react"
import { useAppLanguage } from "@/lib/i18n"
import { bcp47, isRtlLanguage } from "@/lib/translate"

export function useDocumentLanguage() {
  const [lang] = useAppLanguage()
  useEffect(() => {
    const root = document.documentElement
    root.lang = bcp47(lang)
    root.dir = isRtlLanguage(lang) ? "rtl" : "ltr"
  }, [lang])
  return lang
}
