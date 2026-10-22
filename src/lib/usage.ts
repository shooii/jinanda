/**
 * 用量计量：把「这一档还能用多少」算清楚，并记住已经用了多少。
 *
 * 只做两件事：
 *  1. 把 monetization.ts 里的额度口径，结合已用量，折成可直接渲染的进度；
 *  2. 提供唯一的发生额入口 consume()，避免各功能页各自加计数。
 *
 * 台账存在本地。正式环境应改为服务端计量（见 docs/api-contract.md 的
 * /v1/usage），本地只做乐观展示与离线兜底。
 */

import { useCallback, useMemo } from "react"
import { usePersistentState } from "@/lib/core"
import {
  allowanceOf,
  canUse,
  meters,
  TRIAL,
} from "@/lib/monetization"
import type {
  Allowance,
  EntitlementSnapshot,
  FeatureKey,
  MeterId,
  Tier,
} from "@/lib/monetization"
import { subscriptionSnapshot, useEntitlement } from "@/lib/services/entitlements"

export type MeterLedger = {
  /** YYYY-MM-DD，跨日重置日额度 */
  day: string
  /** YYYY-MM，跨月重置月额度 */
  month: string
  daily: Partial<Record<MeterId, number>>
  monthly: Partial<Record<MeterId, number>>
}

export const emptyLedger = (now = new Date()): MeterLedger => ({
  day: dayKey(now),
  month: monthKey(now),
  daily: {},
  monthly: {},
})

export function dayKey(now: Date) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function monthKey(now: Date) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

/**
 * 读取时惰性滚动：跨日清日额度，跨月清月额度。
 * 不在写入时才清，否则用户隔天打开页面会先看到昨天的余量。
 */
export function rollForward(ledger: MeterLedger, now = new Date()): MeterLedger {
  const day = dayKey(now)
  const month = monthKey(now)
  if (ledger.day === day && ledger.month === month) return ledger
  return {
    day,
    month,
    daily: ledger.day === day ? ledger.daily : {},
    monthly: ledger.month === month ? ledger.monthly : {},
  }
}

/** 某个计量器在某档位下的额度视图 */
export type QuotaView = {
  meter: MeterId
  label: string
  unit: string
  kind: Allowance["kind"]
  /** Infinity 表示不限量 */
  limit: number
  used: number
  remaining: number
  /** 0..1，不限量时为 0 */
  ratio: number
  /** 单次会话上限（分钟），无则 null */
  sessionCap: number | null
  nearLimit: boolean
  exhausted: boolean
}

const NEAR_LIMIT_RATIO = 0.8

export function quotaView(
  tier: Tier,
  meter: MeterId,
  ledger: MeterLedger,
  now = new Date(),
): QuotaView {
  const spec = meters.find((item) => item.id === meter)
  const allowance = allowanceOf(tier, meter)
  const rolled = rollForward(ledger, now)

  const label = spec?.label ?? meter
  const unit = spec?.unit ?? "次"

  if (allowance.kind === "blocked") {
    return {
      meter,
      label,
      unit,
      kind: "blocked",
      limit: 0,
      used: 0,
      remaining: 0,
      ratio: 1,
      sessionCap: null,
      nearLimit: true,
      exhausted: true,
    }
  }

  if (allowance.kind === "unlimited") {
    const used = rolled.monthly[meter] ?? 0
    return {
      meter,
      label,
      unit,
      kind: "unlimited",
      limit: Number.POSITIVE_INFINITY,
      used,
      remaining: Number.POSITIVE_INFINITY,
      ratio: 0,
      sessionCap: null,
      nearLimit: false,
      exhausted: false,
    }
  }

  if (allowance.kind === "session") {
    // 单次会话限额：总量不设上限，只限制单场时长
    const used = rolled.monthly[meter] ?? 0
    return {
      meter,
      label,
      unit,
      kind: "session",
      limit: Number.POSITIVE_INFINITY,
      used,
      remaining: Number.POSITIVE_INFINITY,
      ratio: 0,
      sessionCap: allowance.amount,
      nearLimit: false,
      exhausted: false,
    }
  }

  const limit = allowance.amount
  const used =
    allowance.kind === "daily"
      ? rolled.daily[meter] ?? 0
      : rolled.monthly[meter] ?? 0
  const remaining = Math.max(0, limit - used)
  const ratio = limit > 0 ? Math.min(1, used / limit) : 1

  return {
    meter,
    label,
    unit,
    kind: allowance.kind,
    limit,
    used,
    remaining,
    ratio,
    sessionCap: null,
    nearLimit: ratio >= NEAR_LIMIT_RATIO,
    exhausted: remaining <= 0,
  }
}

export type GateReason =
  | "feature_locked"
  | "quota_exceeded"
  | "session_cap"

export type GateResult =
  | { allowed: true }
  | { allowed: false; reason: GateReason; meter?: MeterId; remaining?: number }

/** 功能 → 计量器的映射；没有计量器的功能只做开关判定 */
const featureMeter: Partial<Record<FeatureKey, MeterId>> = {
  instant: "instant",
  dialogue: "dialogue",
  camera: "camera",
  meeting: "meeting",
  call: "call",
}

export function gateFeature(
  tier: Tier,
  feature: FeatureKey,
  ledger: MeterLedger,
  now = new Date(),
): GateResult {
  if (!canUse(tier, feature)) {
    return { allowed: false, reason: "feature_locked" }
  }

  const meter = featureMeter[feature]
  if (!meter) return { allowed: true }

  const view = quotaView(tier, meter, ledger, now)
  if (view.exhausted) {
    return {
      allowed: false,
      reason: "quota_exceeded",
      meter,
      remaining: view.remaining,
    }
  }
  return { allowed: true }
}

/**
 * 记一笔发生额。超出额度时**不写入**并返回 false，
 * 保证 used 永远不会大于 limit，UI 进度条不会溢出。
 */
export function consumeMeter(
  tier: Tier,
  meter: MeterId,
  amount: number,
  ledger: MeterLedger,
  now = new Date(),
): { ok: boolean; ledger: MeterLedger; view: QuotaView } {
  const rolled = rollForward(ledger, now)
  const allowance = allowanceOf(tier, meter)
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0

  if (allowance.kind === "blocked") {
    return {
      ok: false,
      ledger: rolled,
      view: quotaView(tier, meter, rolled, now),
    }
  }

  if (allowance.kind === "unlimited" || allowance.kind === "session") {
    // 不限量也要记账，用于统计与后续调价依据
    const next: MeterLedger = {
      ...rolled,
      monthly: {
        ...rolled.monthly,
        [meter]: (rolled.monthly[meter] ?? 0) + safeAmount,
      },
    }
    return { ok: true, ledger: next, view: quotaView(tier, meter, next, now) }
  }

  const bucket = allowance.kind === "daily" ? "daily" : "monthly"
  const used = rolled[bucket][meter] ?? 0
  if (used + safeAmount > allowance.amount) {
    return {
      ok: false,
      ledger: rolled,
      view: quotaView(tier, meter, rolled, now),
    }
  }

  const next: MeterLedger = {
    ...rolled,
    [bucket]: { ...rolled[bucket], [meter]: used + safeAmount },
  }
  return { ok: true, ledger: next, view: quotaView(tier, meter, next, now) }
}

export const USAGE_KEY = "lingo.usage"

export type UsageApi = {
  entitlement: EntitlementSnapshot
  tier: Tier
  quotas: QuotaView[]
  quotaOf: (meter: MeterId) => QuotaView
  gate: (feature: FeatureKey) => GateResult
  consume: (meter: MeterId, amount?: number) => { ok: boolean; view: QuotaView }
  reset: () => void
}

/**
 * 用量总入口。功能页只需要 gate() 判一次、成功后 consume() 记一笔。
 */
export function useUsage(): UsageApi {
  const { entitlement: verifiedEntitlement, now } = useEntitlement()
  const [rawLedger, setLedger] = usePersistentState<MeterLedger>(
    USAGE_KEY,
    emptyLedger,
  )

  const entitlement = useMemo(() => subscriptionSnapshot(verifiedEntitlement, now), [verifiedEntitlement, now])
  const tier = entitlement.tier
  const ledger = useMemo(() => rollForward(rawLedger), [rawLedger])

  const quotaOf = useCallback(
    (meter: MeterId) => quotaView(tier, meter, ledger),
    [tier, ledger],
  )

  const gate = useCallback(
    (feature: FeatureKey) => gateFeature(tier, feature, ledger),
    [tier, ledger],
  )

  const consume = useCallback(
    (meter: MeterId, amount = 1) => {
      const result = consumeMeter(tier, meter, amount, ledger)
      // 只在账本真的变了才写回，避免每记一笔都触发一次 localStorage 序列化
      if (result.ledger !== ledger) setLedger(result.ledger)
      return { ok: result.ok, view: result.view }
    },
    [tier, ledger, setLedger],
  )

  const reset = useCallback(() => setLedger(emptyLedger()), [setLedger])

  const quotas = useMemo(
    () => meters.map((item) => quotaView(tier, item.id, ledger)),
    [tier, ledger],
  )

  return { entitlement, tier, quotas, quotaOf, gate, consume, reset }
}

/**
 * 试用期间的提示文案。付费墙、会员页、首页顶部条共用同一套判断，
 * 避免三处各写一遍还剩几天。
 */
export type TrialNotice =
  | { kind: "none" }
  | { kind: "active"; daysLeft: number; urgent: boolean }
  | { kind: "ended" }

export function trialNotice(
  entitlement: EntitlementSnapshot,
): TrialNotice {
  if (entitlement.status === "trialing" && entitlement.trialDaysLeft !== null) {
    return {
      kind: "active",
      daysLeft: entitlement.trialDaysLeft,
      urgent: entitlement.trialDaysLeft <= TRIAL.remindWithinDays,
    }
  }
  if (
    entitlement.status === "expired" ||
    (entitlement.status === "none" && entitlement.trialDaysLeft === null)
  ) {
    return { kind: "ended" }
  }
  return { kind: "none" }
}
