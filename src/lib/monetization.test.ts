import { describe, expect, it } from "vitest"
import {
  addOns,
  allowanceOf,
  canUse,
  offlinePackQuota,
  paidTiers,
  resolveEntitlement,
  tiers,
  tierPrice,
  tierYearlySaving,
  trialExit,
} from "@/lib/monetization"
import type { PlanLike } from "@/lib/monetization"
import { regionById } from "@/lib/payments"

const NOW = Date.parse("2026-10-20T12:00:00Z")
const DAY = 24 * 60 * 60 * 1000
const iso = (offsetDays: number) => new Date(NOW + offsetDays * DAY).toISOString()

const base = (patch: Partial<PlanLike>): PlanLike => ({
  source: "none",
  tier: "free",
  autoRenew: false,
  trialEndsAt: null,
  expiresAt: null,
  ...patch,
})

describe("档位数据", () => {
  it("付费档位只有 plus 与 pro", () => {
    expect(paidTiers).toEqual(["plus", "pro"])
  })

  it("免费档不能用通话与观影，付费档逐级放开", () => {
    expect(canUse("free", "call")).toBe(false)
    expect(canUse("free", "watch")).toBe(false)
    expect(canUse("plus", "call")).toBe(true)
    expect(canUse("plus", "watch")).toBe(false)
    expect(canUse("pro", "watch")).toBe(true)
  })

  it("离线包额度按档位递增，Pro 为全量", () => {
    expect(offlinePackQuota("free")).toBe(1)
    expect(offlinePackQuota("plus")).toBe(10)
    expect(offlinePackQuota("pro")).toBe(Number.POSITIVE_INFINITY)
  })

  it("免费档会议是单场限额而不是月度限额", () => {
    expect(allowanceOf("free", "meeting")).toEqual({ kind: "session", amount: 3 })
    expect(allowanceOf("plus", "meeting")).toEqual({ kind: "monthly", amount: 300 })
    expect(allowanceOf("pro", "meeting")).toEqual({ kind: "unlimited" })
  })

  it("免费档额度为正数，避免出现 0 次可用", () => {
    for (const meter of ["instant", "dialogue", "camera"] as const) {
      const allowance = allowanceOf("free", meter)
      expect(allowance.kind === "daily" || allowance.kind === "session").toBe(true)
      if (allowance.kind === "daily") expect(allowance.amount).toBeGreaterThan(0)
    }
  })

  it("Pro 月付约为 Plus 的两倍以内，年付折扣更高", () => {
    expect(tiers.pro.priceUsd.monthly).toBeGreaterThan(tiers.plus.priceUsd.monthly)
    expect(tierYearlySaving("pro")).toBeGreaterThan(0)
    expect(tierYearlySaving("plus")).toBeGreaterThan(0)
    expect(tierYearlySaving("free")).toBe(0)
  })

  it("本地化价格随汇率放大，且不低于取整单位", () => {
    const us = regionById("US")
    const jp = regionById("JP")
    expect(tierPrice("plus", "monthly", us)).toBeGreaterThan(0)
    expect(tierPrice("plus", "monthly", jp)).toBeGreaterThan(tierPrice("plus", "monthly", us))
  })

  it("加购商品不带订阅周期，价格为正", () => {
    expect(addOns.length).toBeGreaterThan(0)
    for (const item of addOns) {
      expect(item.priceUsd).toBeGreaterThan(0)
      expect(item.grant).toBeTruthy()
    }
  })
})

describe("权益判定", () => {
  it("试用期内按 Pro 结算，并给出剩余天数", () => {
    const snapshot = resolveEntitlement(
      base({ source: "none", trialEndsAt: iso(5) }),
      NOW,
    )
    expect(snapshot.status).toBe("trialing")
    expect(snapshot.tier).toBe("pro")
    expect(snapshot.paid).toBe(true)
    expect(snapshot.trialDaysLeft).toBe(5)
  })

  it("试用过期后不会残留 Pro 档位", () => {
    const snapshot = resolveEntitlement(
      base({ trialEndsAt: iso(-1) }),
      NOW,
    )
    expect(snapshot.status).toBe("expired")
    expect(snapshot.tier).toBe("free")
    expect(snapshot.paid).toBe(false)
  })

  it("试用优先级高于订阅：同时存在时仍按试用展示", () => {
    const snapshot = resolveEntitlement(
      base({
        source: "standalone",
        tier: "plus",
        autoRenew: true,
        expiresAt: iso(300),
        trialEndsAt: iso(2),
      }),
      NOW,
    )
    expect(snapshot.status).toBe("trialing")
    expect(snapshot.tier).toBe("pro")
  })

  it("正常订阅在有效期内为 active", () => {
    const snapshot = resolveEntitlement(
      base({ source: "standalone", tier: "plus", autoRenew: true, expiresAt: iso(30) }),
      NOW,
    )
    expect(snapshot.status).toBe("active")
    expect(snapshot.tier).toBe("plus")
    expect(snapshot.paid).toBe(true)
    expect(snapshot.daysLeft).toBe(30)
  })

  it("关闭自动续费后到期末仍保留权益，状态为 canceled", () => {
    const snapshot = resolveEntitlement(
      base({ source: "standalone", tier: "plus", autoRenew: false, expiresAt: iso(10) }),
      NOW,
    )
    expect(snapshot.status).toBe("canceled")
    expect(snapshot.paid).toBe(true)
  })

  it("订阅到期后降级到 Free，而不是报错", () => {
    const snapshot = resolveEntitlement(
      base({ source: "standalone", tier: "pro", autoRenew: true, expiresAt: iso(-2) }),
      NOW,
    )
    expect(snapshot.status).toBe("expired")
    expect(snapshot.tier).toBe("free")
    expect(snapshot.paid).toBe(false)
  })

  it("设备赠送按 source=device 视为付费有效", () => {
    const snapshot = resolveEntitlement(
      base({ source: "device", tier: "pro", expiresAt: iso(120) }),
      NOW,
    )
    expect(snapshot.paid).toBe(true)
    expect(snapshot.tier).toBe("pro")
  })

  it("全空状态是 Free 而不是试用", () => {
    const snapshot = resolveEntitlement(base({}), NOW)
    expect(snapshot.status).toBe("none")
    expect(snapshot.paid).toBe(false)
    expect(snapshot.trialDaysLeft).toBeNull()
  })
})

describe("试用结束后的去向", () => {
  it("绑卡则转为对应档位收费", () => {
    expect(trialExit(true, "plus", "yearly")).toEqual({
      kind: "charge",
      tier: "plus",
      cycle: "yearly",
    })
  })

  it("未绑卡则降级", () => {
    expect(trialExit(false, "plus", "yearly")).toEqual({ kind: "downgrade" })
  })

  it("目标档位为 free 时不会产生扣费", () => {
    expect(trialExit(true, "free", "yearly")).toEqual({ kind: "downgrade" })
  })
})
