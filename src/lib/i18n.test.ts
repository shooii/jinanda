import { describe, expect, it } from "vitest"
import {
  allTranslationKeys,
  appLanguages,
  i18nCoverage,
  translateKey,
} from "@/lib/i18n"

describe("界面文案", () => {
  it("支持 20 种界面语言", () => {
    expect(appLanguages).toHaveLength(20)
  })

  it("每种语言的每个键都能取到非空文案", () => {
    const keys = allTranslationKeys()
    expect(keys.length).toBeGreaterThan(0)
    for (const lang of appLanguages) {
      for (const key of keys) {
        const value = translateKey(lang, key)
        expect(value, `${lang} 缺 ${key}`).not.toBe("")
        expect(value, `${lang} 未翻译 ${key}`).not.toBe(key)
      }
    }
  })

  it("中文是回退基准，覆盖必须完整", () => {
    const zh = i18nCoverage().find((item) => item.lang === "zh")
    expect(zh?.missing).toEqual([])
  })

  it("英文覆盖完整", () => {
    const en = i18nCoverage().find((item) => item.lang === "en")
    expect(en?.missing).toEqual([])
  })

  it("未知键原样返回，便于定位漏配", () => {
    expect(translateKey("zh", "not.a.real.key")).toBe("not.a.real.key")
  })
})
