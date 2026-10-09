import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearErrors,
  recentErrors,
  reportError,
  setErrorReporter,
} from "@/lib/errors"

describe("错误上报", () => {
  beforeEach(() => {
    clearErrors()
    setErrorReporter(() => undefined)
  })

  it("记录错误消息、来源与时间", () => {
    const report = reportError(new Error("boom"), "manual", { where: "test" })
    expect(report.message).toBe("boom")
    expect(report.source).toBe("manual")
    expect(report.detail).toEqual({ where: "test" })
    expect(Date.parse(report.at)).not.toBeNaN()
    expect(recentErrors()).toHaveLength(1)
  })

  it("非 Error 抛出物也能记录", () => {
    expect(reportError("字符串原因", "promise").message).toBe("字符串原因")
  })

  it("空消息会被守卫住，回调抛错不影响主流程", () => {
    const spy = vi.fn(() => {
      throw new Error("上报服务挂了")
    })
    setErrorReporter(spy)
    expect(() => reportError(new Error("仍然要记录"), "window")).not.toThrow()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("缓冲区有上限，不会无限增长", () => {
    for (let i = 0; i < 80; i += 1) reportError(new Error(`e${i}`), "manual")
    expect(recentErrors().length).toBeLessThanOrEqual(50)
  })
})
