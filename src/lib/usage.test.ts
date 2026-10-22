import { describe, expect, it } from "vitest"
import {
  consumeMeter,
  dayKey,
  emptyLedger,
  gateFeature,
  monthKey,
  quotaView,
  rollForward,
} from "@/lib/usage"
import type { MeterLedger } from "@/lib/usage"

const NOW = new Date("2026-10-20T12:00:00")

const ledgerFor = (
  patch: Partial<MeterLedger> = {},
  now = NOW,
): MeterLedger => ({ ...emptyLedger(now), ...patch })

describe("台账滚动", () => {
  it("同一天同一月不重置", () => {
    const ledger = ledgerFor({ daily: { instant: 5 }, monthly: { meeting: 30 } })
    const next = rollForward(ledger, NOW)
    expect(next).toBe(ledger)
  })

  it("跨日只清日额度，保留月额度", () => {
    const ledger = ledgerFor({
      day: "2026-10-19",
      month: "2026-10",
      daily: { instant: 20 },
      monthly: { meeting: 120 },
    })
    const next = rollForward(ledger, NOW)
    expect(next.day).toBe("2026-10-20")
    expect(next.daily.instant).toBeUndefined()
    expect(next.monthly.meeting).toBe(120)
  })

  it("跨月同时清日额度与月额度", () => {
    const ledger = ledgerFor({
      day: "2026-09-30",
      month: "2026-09",
      daily: { instant: 3 },
      monthly: { meeting: 200, call: 20 },
    })
    const next = rollForward(ledger, NOW)
    expect(next.month).toBe("2026-10")
    expect(next.daily).toEqual({})
    expect(next.monthly).toEqual({})
  })

  it("日期键补零且稳定", () => {
    expect(dayKey(new Date("2026-01-05T00:00:00"))).toBe("2026-01-05")
    expect(monthKey(new Date("2026-01-05T00:00:00"))).toBe("2026-01")
  })
})

describe("额度视图", () => {
  it("免费档即时翻译是每日 20 次", () => {
    const view = quotaView("free", "instant", ledgerFor(), NOW)
    expect(view.kind).toBe("daily")
    expect(view.limit).toBe(20)
    expect(view.remaining).toBe(20)
    expect(view.ratio).toBe(0)
    expect(view.exhausted).toBe(false)
  })

  it("接近上限时标记 nearLimit", () => {
    const view = quotaView("free", "instant", ledgerFor({ daily: { instant: 17 } }), NOW)
    expect(view.remaining).toBe(3)
    expect(view.nearLimit).toBe(true)
    expect(view.exhausted).toBe(false)
  })

  it("用尽时 exhausted 为真且进度封顶", () => {
    const view = quotaView("free", "instant", ledgerFor({ daily: { instant: 25 } }), NOW)
    expect(view.remaining).toBe(0)
    expect(view.exhausted).toBe(true)
    expect(view.ratio).toBe(1)
  })

  it("不限量档位 remaining 为 Infinity 且不显示进度", () => {
    const view = quotaView("plus", "instant", ledgerFor({ monthly: { instant: 99 } }), NOW)
    expect(view.kind).toBe("unlimited")
    expect(view.remaining).toBe(Number.POSITIVE_INFINITY)
    expect(view.ratio).toBe(0)
    expect(view.used).toBe(99)
  })

  it("免费档会议给的是单场上限而不是总量上限", () => {
    const view = quotaView("free", "meeting", ledgerFor(), NOW)
    expect(view.kind).toBe("session")
    expect(view.sessionCap).toBe(3)
    expect(view.exhausted).toBe(false)
  })

  it("通话在免费档视为不可用", () => {
    const view = quotaView("free", "call", ledgerFor(), NOW)
    expect(view.kind).toBe("blocked")
    expect(view.exhausted).toBe(true)
  })

  it("Plus 会议是月度 300 分钟", () => {
    const view = quotaView("plus", "meeting", ledgerFor({ monthly: { meeting: 299 } }), NOW)
    expect(view.limit).toBe(300)
    expect(view.remaining).toBe(1)
    expect(view.nearLimit).toBe(true)
  })
})

describe("记账", () => {
  it("额度内正常记账并返回最新视图", () => {
    const result = consumeMeter("free", "instant", 1, ledgerFor(), NOW)
    expect(result.ok).toBe(true)
    expect(result.ledger.daily.instant).toBe(1)
    expect(result.view.remaining).toBe(19)
  })

  it("超出额度时不写入，保证进度条不溢出", () => {
    const start = ledgerFor({ daily: { instant: 19 } })
    const result = consumeMeter("free", "instant", 2, start, NOW)
    expect(result.ok).toBe(false)
    expect(result.ledger.daily.instant).toBe(19)
    expect(result.view.remaining).toBe(1)
  })

  it("正好用满时成功，下一次失败", () => {
    const first = consumeMeter("free", "instant", 20, ledgerFor(), NOW)
    expect(first.ok).toBe(true)
    expect(first.view.exhausted).toBe(true)
    const second = consumeMeter("free", "instant", 1, first.ledger, NOW)
    expect(second.ok).toBe(false)
  })

  it("不限量档位仍然记账，用于统计", () => {
    const result = consumeMeter("pro", "meeting", 45, ledgerFor(), NOW)
    expect(result.ok).toBe(true)
    expect(result.ledger.monthly.meeting).toBe(45)
  })

  it("不可用档位拒绝记账", () => {
    const result = consumeMeter("free", "call", 1, ledgerFor(), NOW)
    expect(result.ok).toBe(false)
    expect(result.ledger.monthly.call).toBeUndefined()
  })

  it("非法数量不产生负数用量", () => {
    const result = consumeMeter("free", "instant", Number.NaN, ledgerFor(), NOW)
    expect(result.ok).toBe(true)
    expect(result.ledger.daily.instant).toBe(0)
  })
})

describe("功能门禁", () => {
  it("未开放的档位直接拦截", () => {
    const gate = gateFeature("plus", "watch", ledgerFor(), NOW)
    expect(gate.allowed).toBe(false)
    if (!gate.allowed) expect(gate.reason).toBe("feature_locked")
  })

  it("额度用尽时拦截并回传计量器", () => {
    const gate = gateFeature("free", "instant", ledgerFor({ daily: { instant: 20 } }), NOW)
    expect(gate.allowed).toBe(false)
    if (!gate.allowed) {
      expect(gate.reason).toBe("quota_exceeded")
      expect(gate.meter).toBe("instant")
      expect(gate.remaining).toBe(0)
    }
  })

  it("额度充足时放行", () => {
    expect(gateFeature("free", "instant", ledgerFor(), NOW).allowed).toBe(true)
  })

  it("无计量器的功能只做开关判定", () => {
    expect(gateFeature("pro", "watch", ledgerFor(), NOW).allowed).toBe(true)
    expect(gateFeature("pro", "speakerDiarization", ledgerFor(), NOW).allowed).toBe(true)
    expect(gateFeature("plus", "speakerDiarization", ledgerFor(), NOW).allowed).toBe(false)
  })

  it("免费档会议允许开始，单场时长由 sessionCap 控制", () => {
    expect(gateFeature("free", "meeting", ledgerFor(), NOW).allowed).toBe(true)
  })
})
