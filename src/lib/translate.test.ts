import { describe, expect, it } from "vitest"
import {
  allLanguages,
  applyTone,
  detectLang,
  sentences,
  translatePhrase,
  type LangId,
} from "@/lib/translate"

describe("语言库", () => {
  it("覆盖 20 种语言且 id 唯一", () => {
    expect(allLanguages).toHaveLength(20)
    expect(new Set(allLanguages.map((item) => item.id)).size).toBe(20)
  })

  it("每种语言都有 native / label / short", () => {
    for (const item of allLanguages) {
      expect(item.native.trim()).not.toBe("")
      expect(item.label.trim()).not.toBe("")
      expect(item.short.trim()).not.toBe("")
    }
  })

  it("句级词典每种语言的句数一致，否则按下标取句会串位", () => {
    const reference = sentences.zh.length
    expect(reference).toBeGreaterThan(0)
    for (const item of allLanguages) {
      expect(sentences[item.id as LangId], `语言 ${item.id} 句数不一致`).toHaveLength(reference)
    }
  })
})

describe("detectLang", () => {
  it("按脚本区分中日韩与西里尔、阿拉伯", () => {
    expect(detectLang("请问最近的地铁站在哪里？")).toBe("zh")
    expect(detectLang("こんにちは、はじめまして")).toBe("ja")
    expect(detectLang("안녕하세요")).toBe("ko")
    expect(detectLang("Привет, как дела")).toBe("ru")
    expect(detectLang("مرحبا بالعالم")).toBe("ar")
  })

  it("拉丁字母默认归入英文，靠高频词细分", () => {
    expect(detectLang("Where is the nearest subway station?")).toBe("en")
    expect(detectLang("Gracias por tu ayuda")).toBe("es")
  })

  it("空串有确定回落值，不抛错", () => {
    expect(detectLang("   ")).toBe("en")
  })
})

describe("translatePhrase", () => {
  it("命中句级词典时返回 exact", () => {
    const result = translatePhrase("请问最近的地铁站在哪里？", "zh", "en")
    expect(result.mode).toBe("exact")
    expect(result.text.trim()).not.toBe("")
    expect(result.text).not.toBe("请问最近的地铁站在哪里？")
  })

  it("同语言与空输入都返回 none 并原样输出", () => {
    expect(translatePhrase("你好", "zh", "zh")).toEqual({ text: "你好", mode: "none" })
    expect(translatePhrase("   ", "zh", "en")).toEqual({ text: "", mode: "none" })
  })

  it("词典未收录的长句不会被当成可靠译文", () => {
    const result = translatePhrase(
      "紫水晶在第七码头等一艘叫夜莺的船。",
      "zh",
      "en",
    )
    expect(result.mode).not.toBe("exact")
  })
})

describe("applyTone", () => {
  it("支持的语言能给出正式 / 随意变体", () => {
    const base = translatePhrase("请问最近的地铁站在哪里？", "zh", "en").text
    expect(applyTone(base, "en", "neutral")).toBe(base)
    expect(typeof applyTone(base, "en", "formal")).toBe("string")
  })
})
