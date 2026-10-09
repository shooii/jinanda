import { describe, expect, it } from "vitest"
import { bcp47, describeRecognitionError, type RecognitionErrorReason } from "@/lib/speech"
import { allLanguages } from "@/lib/translate"

describe("语言标签", () => {
  it("每一种语言都有合法 BCP-47 标签", () => {
    for (const item of allLanguages) {
      expect(bcp47(item.id)).toMatch(/^[a-z]{2}(-[A-Za-z]{2,4})?$/)
    }
  })

  it("中英文使用常见方言标签", () => {
    expect(bcp47("zh")).toBe("zh-CN")
    expect(bcp47("en")).toBe("en-US")
  })
})

describe("识别错误提示", () => {
  const reasons: RecognitionErrorReason[] = [
    "denied",
    "unsupported",
    "network",
    "nocapture",
    "lang",
    "silent",
    "failed",
  ]

  it("每种原因都给出可执行的提示", () => {
    const messages = reasons.map((reason) => describeRecognitionError(reason))
    for (const message of messages) expect(message.trim()).not.toBe("")
    // 不同原因给出不同提示，避免用户无法区分
    expect(new Set(messages).size).toBe(reasons.length)
  })

  it("未知失败会把底层错误码带出来，便于排查", () => {
    expect(describeRecognitionError("failed", "some-error")).toContain("some-error")
  })
})
