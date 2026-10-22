/** Server responses are display projections; paid operations must also be authorized by the server. */
import { useEffect, useState, useSyncExternalStore } from "react"
import { apiConfigured, describeApiError, getToken, request } from "@/lib/services/api"
import type { EntitlementSnapshot, Tier } from "@/lib/monetization"

export type EntitlementSource = "device" | "standalone" | "apple" | "google" | "stripe" | "none"
export type EntitlementStatus =
  | "none" | "trialing" | "active" | "canceled_at_period_end"
  | "past_due" | "grace" | "account_hold" | "paused" | "expired"
  | "refunded" | "revoked" | "chargeback"

export type Entitlement = {
  source: EntitlementSource
  status: EntitlementStatus
  /** Explicit server-authorized tier; never infer it from a product name. */
  tier?: Tier | null
  planId: "monthly" | "yearly" | null
  skuId: string | null
  subscriptionId: string | null
  transactionId: string | null
  currency: string | null
  expiresAt: string | null
  cancelAt: string | null
  trialStartsAt: string | null
  trialEndsAt: string | null
  graceEndsAt: string | null
  autoRenew: boolean
  verified: boolean
}

export const LOCAL_ENTITLEMENT: Entitlement = {
  source: "none", status: "none", tier: null, planId: null, skuId: null,
  subscriptionId: null, transactionId: null, currency: null,
  expiresAt: null, cancelAt: null, trialStartsAt: null, trialEndsAt: null,
  graceEndsAt: null, autoRenew: false, verified: false,
}

export type PurchaseReceipt = {
  channelId: string
  planId: "monthly" | "yearly"
  receipt: string
  transactionId: string
}

function requireSession() {
  if (!getToken()) throw new Error("请先登录，再查询或验证购买权益")
}

export async function verifyPurchase(receipt: PurchaseReceipt): Promise<Entitlement> {
  requireSession()
  const result = await request<Entitlement>("/v1/entitlements/verify", { method: "POST", body: receipt })
  // Query the account projection again; a verification response is not a local grant.
  void refreshEntitlement()
  return result
}

export function fetchEntitlement(): Promise<Entitlement> {
  requireSession()
  return request<Entitlement>("/v1/entitlements")
}

const future = (value: string | null | undefined, now: number) => {
  const time = Date.parse(value ?? "")
  return Number.isFinite(time) && time > now
}

const sources: readonly string[] = ["device", "standalone", "apple", "google", "stripe", "none"]
const statuses: readonly string[] = ["none", "trialing", "active", "canceled_at_period_end", "past_due", "grace", "account_hold", "paused", "expired", "refunded", "revoked", "chargeback"]

/** Reject malformed account projections instead of trusting TypeScript's network cast. */
export function isEntitlement(value: unknown): value is Entitlement {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  const nullableStrings = ["skuId", "subscriptionId", "transactionId", "currency", "expiresAt", "cancelAt", "trialStartsAt", "trialEndsAt", "graceEndsAt"]
  return sources.includes(String(item.source)) && statuses.includes(String(item.status))
    && [undefined, null, "free", "plus", "pro"].includes(item.tier as string | null | undefined)
    && [null, "monthly", "yearly"].includes(item.planId as string | null)
    && typeof item.verified === "boolean" && typeof item.autoRenew === "boolean"
    && nullableStrings.every((key) => item[key] === null || typeof item[key] === "string")
}

export function entitlementActive(entitlement: Entitlement, now = Date.now()): boolean {
  if (!isEntitlement(entitlement) || entitlement.verified !== true || entitlement.source === "none" || !Number.isFinite(now)) return false
  // Grace is a separate, explicit access window, potentially beyond the original expiry.
  if (entitlement.status === "grace") return future(entitlement.graceEndsAt, now)
  if (!future(entitlement.expiresAt, now)) return false
  if (entitlement.status === "trialing") return future(entitlement.trialEndsAt, now)
  return entitlement.status === "active" || entitlement.status === "canceled_at_period_end"
}

/** The only production tier projection. Local PlanState is never an authorization source. */
export function subscriptionSnapshot(entitlement: Entitlement, now = Date.now()): EntitlementSnapshot {
  const paid = entitlementActive(entitlement, now) && (entitlement.tier === "plus" || entitlement.tier === "pro")
  const deadline = entitlement.status === "grace" ? entitlement.graceEndsAt
    : entitlement.status === "trialing" ? entitlement.trialEndsAt : entitlement.expiresAt
  const days = paid ? Math.max(0, Math.ceil((Date.parse(deadline ?? "") - now) / 86400000)) : null
  return {
    tier: paid ? entitlement.tier as Tier : "free",
    paid,
    status: paid ? (entitlement.status === "canceled_at_period_end" ? "canceled" : entitlement.status) as EntitlementSnapshot["status"]
      : entitlement.verified ? "expired" : "none",
    daysLeft: days,
    trialDaysLeft: paid && entitlement.status === "trialing" ? days : null,
  }
}

type QueryState = { entitlement: Entitlement; checking: boolean; error: string | null }
const emptyState: QueryState = { entitlement: LOCAL_ENTITLEMENT, checking: false, error: null }
let state = emptyState
let owner: string | null = null
let generation = 0
let inFlight: Promise<void> | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const getSnapshot = () => owner === getToken() ? state : emptyState

/** Single shared query, deduplicated across membership, paywall, and feature gates. */
export function refreshEntitlement(): Promise<void> {
  const token = getToken()
  if (owner !== token) {
    generation += 1
    owner = token
    state = emptyState
    inFlight = null
    emit()
  }
  if (!apiConfigured() || !token) {
    state = emptyState
    emit()
    return Promise.resolve()
  }
  if (inFlight) return inFlight
  const current = ++generation
  state = { ...state, checking: true, error: null }
  emit()
  inFlight = (async () => {
    try {
      const entitlement = await fetchEntitlement()
      if (current !== generation || token !== getToken()) return
      if (!isEntitlement(entitlement)) throw new Error("Invalid entitlement response")
      state = { entitlement, checking: false, error: null }
    } catch (cause) {
      if (current !== generation || token !== getToken()) return
      // Failure never falls back to a local or stale paid plan.
      state = { entitlement: LOCAL_ENTITLEMENT, checking: false, error: describeApiError(cause) }
    } finally {
      if (current === generation) { inFlight = null; emit() }
    }
  })()
  return inFlight
}

if (typeof window !== "undefined") {
  window.addEventListener("lingo:auth-changed", () => { void refreshEntitlement() })
}

export function useEntitlement() {
  const query = useSyncExternalStore(subscribe, getSnapshot, () => emptyState)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const refresh = () => { setNow(Date.now()); void refreshEntitlement() }
    const visible = () => { if (document.visibilityState === "visible") refresh() }
    refresh()
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", visible)
    const timer = window.setInterval(() => {
      setNow(Date.now())
      if (document.visibilityState === "visible") void refreshEntitlement()
    }, 30000)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", visible)
    }
  }, [])
  return { ...query, now, refresh: refreshEntitlement, serverConfigured: apiConfigured() }
}
