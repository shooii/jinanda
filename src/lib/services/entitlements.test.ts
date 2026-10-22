import { afterEach, describe, expect, it, vi } from "vitest"
import * as api from "@/lib/services/api"
import { entitlementActive, subscriptionSnapshot, isEntitlement, refreshEntitlement, LOCAL_ENTITLEMENT } from "@/lib/services/entitlements"

const verified = {
  ...LOCAL_ENTITLEMENT,
  source: "apple" as const,
  status: "active" as const,
  planId: "yearly" as const,
  expiresAt: "2027-01-01T00:00:00.000Z",
  verified: true,
}

afterEach(() => { vi.restoreAllMocks() })

describe("shared account entitlement query", () => {
  it("does not query without an authenticated account", async () => {
    vi.spyOn(api, "apiConfigured").mockReturnValue(true)
    vi.spyOn(api, "getToken").mockReturnValue(null)
    const request = vi.spyOn(api, "request")
    await refreshEntitlement()
    expect(request).not.toHaveBeenCalled()
  })

  it("deduplicates concurrent queries but starts a fresh one after account switch", async () => {
    vi.spyOn(api, "apiConfigured").mockReturnValue(true)
    const token = vi.spyOn(api, "getToken").mockReturnValue("account-a")
    const pending: Array<(value: typeof LOCAL_ENTITLEMENT) => void> = []
    const request = vi.spyOn(api, "request").mockImplementation(() => new Promise((resolve) => { pending.push(resolve) }))
    const first = refreshEntitlement()
    expect(refreshEntitlement()).toBe(first)
    expect(request).toHaveBeenCalledTimes(1)
    token.mockReturnValue("account-b")
    const second = refreshEntitlement()
    expect(second).not.toBe(first)
    expect(request).toHaveBeenCalledTimes(2)
    pending[0](LOCAL_ENTITLEMENT)
    await first
    expect(refreshEntitlement()).toBe(second)
    pending[1](LOCAL_ENTITLEMENT)
    await second
    token.mockReturnValue(null)
    await refreshEntitlement()
  })
})

describe("server-verified subscription entitlement", () => {
  it("rejects malformed runtime responses and unknown sources", () => {
    for (const value of [null, [], {}, { ...verified, source: "invented" }, { ...verified, verified: "true" }, { ...verified, tier: "admin" }]) {
      expect(isEntitlement(value)).toBe(false)
    }
    expect(isEntitlement(verified)).toBe(true)
    expect(entitlementActive({ ...verified, source: "invented" } as unknown as typeof LOCAL_ENTITLEMENT)).toBe(false)
  })
  it("does not grant a local or unverified entitlement", () => {
    expect(entitlementActive(LOCAL_ENTITLEMENT)).toBe(false)
    expect(entitlementActive({ ...verified, verified: false })).toBe(false)
  })

  it("keeps eligible subscriptions active until their expiry", () => {
    for (const status of ["trialing", "active", "canceled_at_period_end"] as const) {
      expect(entitlementActive({ ...verified, status, trialEndsAt: "2027-01-01T00:00:00.000Z" }, Date.parse("2026-12-01T00:00:00.000Z"))).toBe(true)
    }
  })

  it("does not grant expired, refunded, revoked, paused, or charged-back states", () => {
    for (const status of ["none", "past_due", "expired", "refunded", "revoked", "paused", "chargeback"] as const) {
      expect(entitlementActive({ ...verified, status }, Date.parse("2026-12-01T00:00:00.000Z"))).toBe(false)
    }
  })

  it("rejects invalid expiry and requires an explicit unexpired grace period", () => {
    const now = Date.parse("2026-12-01T00:00:00.000Z")
    expect(entitlementActive({ ...verified, expiresAt: "invalid" }, now)).toBe(false)
    expect(entitlementActive(verified, Number.NaN)).toBe(false)
    expect(entitlementActive({ ...verified, status: "grace" }, now)).toBe(false)
    expect(entitlementActive({ ...verified, status: "grace", graceEndsAt: "invalid" }, now)).toBe(false)
    expect(entitlementActive({ ...verified, status: "grace", graceEndsAt: "2026-12-01T00:00:00.000Z" }, now)).toBe(false)
    expect(entitlementActive({ ...verified, status: "grace", graceEndsAt: "2026-12-02T00:00:00.000Z" }, now)).toBe(true)
  })

  it("retains full tier in explicit grace beyond the original billing period", () => {
    const now = Date.parse("2026-12-01T00:00:00.000Z")
    const grace = { ...verified, tier: "pro" as const, status: "grace" as const,
      expiresAt: "2026-11-30T00:00:00.000Z", graceEndsAt: "2026-12-03T00:00:00.000Z" }
    expect(subscriptionSnapshot(grace, now)).toMatchObject({ tier: "pro", paid: true, status: "grace", daysLeft: 2 })
    expect(subscriptionSnapshot({ ...grace, status: "account_hold" }, now).paid).toBe(false)
  })

  it("never infers a tier from SKU or a verified boolean alone", () => {
    const now = Date.parse("2026-12-01T00:00:00.000Z")
    expect(subscriptionSnapshot({ ...verified, skuId: "pro.yearly" }, now).tier).toBe("free")
    expect(subscriptionSnapshot({ ...verified, tier: "plus" }, now).tier).toBe("plus")
    expect(subscriptionSnapshot({ ...verified, tier: "pro", verified: false }, now).paid).toBe(false)
    expect(entitlementActive({ ...verified, source: "none" }, now)).toBe(false)
  })

  it("requires a real unexpired trial deadline and expires at its boundary", () => {
    const now = Date.parse("2026-12-01T00:00:00.000Z")
    expect(entitlementActive({ ...verified, status: "trialing", trialEndsAt: null }, now)).toBe(false)
    expect(entitlementActive({ ...verified, status: "trialing", trialEndsAt: "2026-12-01T00:00:00.000Z" }, now)).toBe(false)
  })

  it("does not grant a subscription after its expiry", () => {
    expect(entitlementActive(verified, Date.parse("2027-01-01T00:00:00.000Z"))).toBe(false)
  })
})
