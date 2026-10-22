/**
 * 商业模型单一事实源。
 *
 * 这里定义「卖什么、卖多少钱、每一档能用多少、试用多久、试用结束后怎样」，
 * 其他地方（付费墙、会员页、计量、服务端对账）都从这里取，不再各自写死。
 *
 * 三条设计原则，来自 docs/global-payments-design.md：
 *
 * 1. **到期不锁设备**。翻译耳机断供等于设备变砖，会引发大量退款与差评。
 *    试用或订阅结束一律降级到 Free，功能变窄但不中断，数据不删除。
 * 2. **额度按计量器定义**，不按页面定义。同一个「会议分钟」在多个入口共用一份账。
 * 3. **价格只在这里写美元基准价**，本地化换算交给 payments.ts 的 priceFor()。
 */

import type { PlanId, Region } from "@/lib/payments"
import { priceFor } from "@/lib/payments"

/** 订阅档位。free 不是商品，是降级后的兜底档。 */
export type Tier = "free" | "plus" | "pro"

/** 计费周期，沿用 payments.ts 的 PlanId，避免两套周期概念 */
export type Cycle = PlanId

/** 需要计量的能力。单位固定，UI 与埋点共用同一套名字。 */
export type MeterId = "instant" | "dialogue" | "camera" | "meeting" | "call"

/** 功能开关（不含额度语义，只表达「有没有」） */
export type FeatureKey =
  | "instant"
  | "dialogue"
  | "camera"
  | "meeting"
  | "call"
  | "watch"
  | "offline"
  | "coachAdvanced"
  | "meetingNotes"
  | "speakerDiarization"
  | "crossDeviceSync"
  | "priorityChannel"

/**
 * 一档能力在某档位下的许可额度。
 *
 * - unlimited  不限量
 * - daily      每日额度，次日 0 点重置
 * - monthly    每计费月额度，按自然月重置
 * - session    单次会话上限（分钟），总量仍受月额度约束
 * - blocked    不可用，触发付费墙
 */
export type Allowance =
  | { kind: "unlimited" }
  | { kind: "daily"; amount: number }
  | { kind: "monthly"; amount: number }
  | { kind: "session"; amount: number }
  | { kind: "blocked" }

export type MeterSpec = {
  id: MeterId
  label: string
  /** 计量单位，展示用 */
  unit: "次" | "分钟"
  /** 归属的功能入口，用于付费墙文案与埋点 */
  feature: FeatureKey
}

export const meters: MeterSpec[] = [
  { id: "instant", label: "即时翻译", unit: "次", feature: "instant" },
  { id: "dialogue", label: "面对面同传", unit: "分钟", feature: "dialogue" },
  { id: "camera", label: "相机取词", unit: "次", feature: "camera" },
  { id: "meeting", label: "会议转写", unit: "分钟", feature: "meeting" },
  { id: "call", label: "通话同传", unit: "分钟", feature: "call" },
]

export type TierSpec = {
  id: Tier
  name: string
  /** 一句话定位，付费墙卡片副标题 */
  tagline: string
  /** 美元基准价，单月与整年；free 为 0 */
  priceUsd: Record<Cycle, number>
  allowance: Record<MeterId, Allowance>
  /** 可下载的离线语言包数量；"all" 表示全量 */
  offlinePacks: number | "all"
  features: Record<FeatureKey, boolean>
}

const noneOf = (keys: FeatureKey[]) =>
  Object.fromEntries(keys.map((key) => [key, false])) as Record<FeatureKey, boolean>

export const allFeatures: FeatureKey[] = [
  "instant",
  "dialogue",
  "camera",
  "meeting",
  "call",
  "watch",
  "offline",
  "coachAdvanced",
  "meetingNotes",
  "speakerDiarization",
  "crossDeviceSync",
  "priorityChannel",
]

export const tiers: Record<Tier, TierSpec> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "装好就能用，永久免费，不需要绑卡",
    priceUsd: { monthly: 0, yearly: 0 },
    allowance: {
      instant: { kind: "daily", amount: 20 },
      dialogue: { kind: "daily", amount: 10 },
      camera: { kind: "daily", amount: 5 },
      meeting: { kind: "session", amount: 3 },
      call: { kind: "blocked" },
    },
    offlinePacks: 1,
    features: {
      ...noneOf(allFeatures),
      instant: true,
      dialogue: true,
      camera: true,
      meeting: true,
      offline: true,
    },
  },
  plus: {
    id: "plus",
    name: "Plus",
    tagline: "日常交流够用，会议与通话按量给",
    priceUsd: { monthly: 7.99, yearly: 59.99 },
    allowance: {
      instant: { kind: "unlimited" },
      dialogue: { kind: "unlimited" },
      camera: { kind: "unlimited" },
      meeting: { kind: "monthly", amount: 300 },
      call: { kind: "monthly", amount: 60 },
    },
    offlinePacks: 10,
    features: {
      ...noneOf(allFeatures),
      instant: true,
      dialogue: true,
      camera: true,
      meeting: true,
      call: true,
      offline: true,
      coachAdvanced: true,
      meetingNotes: true,
      crossDeviceSync: true,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "全都打开，含观影同传与多人会议",
    priceUsd: { monthly: 14.99, yearly: 119.99 },
    allowance: {
      instant: { kind: "unlimited" },
      dialogue: { kind: "unlimited" },
      camera: { kind: "unlimited" },
      meeting: { kind: "unlimited" },
      call: { kind: "unlimited" },
    },
    offlinePacks: "all",
    features: {
      instant: true,
      dialogue: true,
      camera: true,
      meeting: true,
      call: true,
      watch: true,
      offline: true,
      coachAdvanced: true,
      meetingNotes: true,
      speakerDiarization: true,
      crossDeviceSync: true,
      priorityChannel: true,
    },
  },
}

export const isTier = (value: unknown): value is Tier =>
  value === "free" || value === "plus" || value === "pro"

/** 可购买档位（不含 free） */
export const paidTiers: Tier[] = ["plus", "pro"]

export const tierName = (tier: Tier) => tiers[tier].name

/** 档位在某地区某周期的实际售价 */
export function tierPrice(tier: Tier, cycle: Cycle, region: Region) {
  return priceFor(tiers[tier].priceUsd[cycle], region)
}

/** 年付相对月付的节省百分比 */
export function tierYearlySaving(tier: Tier) {
  const { monthly, yearly } = tiers[tier].priceUsd
  if (monthly <= 0) return 0
  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100))
}

/**
 * 试用规则。
 *
 * 7 天是北美/欧洲订阅的通行做法，也与 Visa「试用转付费前须提醒」的要求相容：
 * 试用开始即明示结束日期，并在剩余 3 天时再提醒一次。
 */
export const TRIAL = {
  days: 7,
  /** 剩余多少天开始提醒 */
  remindWithinDays: 3,
  /** 试用期间给到的档位——给最高档，让用户完整感知价值 */
  tier: "pro" as Tier,
  /** 试用只对首个账号发放一次 */
  oncePerAccount: true,
} as const

/** 扣款失败后的宽限：全量 7 天 + 降级 7 天，之后才收回权益 */
export const GRACE = {
  fullDays: 7,
  degradedDays: 7,
} as const

/**
 * 一次性加购。实体商品与买断类不走订阅，也绕开了平台分成。
 */
export type AddOnId = "offline_pack" | "meeting_pack" | "lifetime"

export type AddOnSpec = {
  id: AddOnId
  name: string
  desc: string
  priceUsd: number
  /** 购买后追加的资源：离线包解锁数量 / 会议分钟数 / 永久档位 */
  grant:
    | { type: "offlinePack"; count: number }
    | { type: "meetingMinutes"; minutes: number }
    | { type: "lifetime"; tier: Tier }
}

export const addOns: AddOnSpec[] = [
  {
    id: "offline_pack",
    name: "离线语言包 · 单个买断",
    desc: "永久解锁一个语言对，不订阅也能用；适合一年只出境一两次的人",
    priceUsd: 9.99,
    grant: { type: "offlinePack", count: 1 },
  },
  {
    id: "meeting_pack",
    name: "会议转写加时包",
    desc: "一次性追加 300 分钟，本月用不完可结转一次",
    priceUsd: 4.99,
    grant: { type: "meetingMinutes", minutes: 300 },
  },
  {
    id: "lifetime",
    name: "Lifetime · 永久 Pro",
    desc: "一次付清，永久享有 Pro 全部能力；仅限首年硬件用户",
    priceUsd: 249,
    grant: { type: "lifetime", tier: "pro" },
  },
]

export const addOnPrice = (id: AddOnId, region: Region) => {
  const spec = addOns.find((item) => item.id === id)
  return spec ? priceFor(spec.priceUsd, region) : 0
}

/** 订阅生命周期状态。UI 顶部提示条、权益判定都以此为准。 */
export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "grace"
  | "canceled"
  | "paused"
  | "expired"
  | "revoked"

/**
 * 权益快照——只依赖这个类型的字段做判定，避免各页面自己拼条件。
 */
export type EntitlementSnapshot = {
  tier: Tier
  status: SubscriptionStatus
  /** 当前是否还能用付费能力 */
  paid: boolean
  /** 试用剩余天数；非试用期为 null */
  trialDaysLeft: number | null
  /** 离真正失去权益还有多少天 */
  daysLeft: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000

const parse = (value: string | null | undefined): number | null => {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

const daysBetween = (from: number, to: number) =>
  Math.max(0, Math.ceil((to - from) / DAY_MS))

export type PlanLike = {
  source: "device" | "standalone" | "none"
  tier?: Tier | null
  autoRenew?: boolean
  /** ISO 或可被 Date.parse 识别的日期串 */
  trialEndsAt?: string | null
  purchasedAt?: string | null
  expiresAt?: string | null
  renewDate?: string | null
}

/**
 * 把 PlanState 折算成权益快照。
 *
 * 判定顺序很重要：试用优先于订阅（试用期没有订单），
 * 到期后再看 source，最后兜底 free。
 */
export function resolveEntitlement(
  plan: PlanLike,
  now = Date.now(),
): EntitlementSnapshot {
  const trialEnd = parse(plan.trialEndsAt)
  if (trialEnd !== null && trialEnd > now) {
    return {
      tier: TRIAL.tier,
      status: "trialing",
      paid: true,
      trialDaysLeft: daysBetween(now, trialEnd),
      daysLeft: daysBetween(now, trialEnd),
    }
  }

  // 试用刚过期且从未付款：直接落到 free，不保留试用档
  const tier: Tier = isTier(plan.tier) ? plan.tier : "free"
  const expiry = parse(plan.expiresAt) ?? parse(plan.renewDate)
  /** 试用已用完——即使没有订单记录，也应该告诉用户「试用结束了」而不是「从未开通」 */
  const trialExpired = trialEnd !== null && trialEnd <= now

  if (plan.source === "none" || tier === "free") {
    return {
      tier: "free",
      status: trialExpired || (expiry !== null && expiry <= now) ? "expired" : "none",
      paid: false,
      trialDaysLeft: null,
      daysLeft: null,
    }
  }

  if (expiry !== null && expiry <= now) {
    return {
      tier: "free",
      status: "expired",
      paid: false,
      trialDaysLeft: null,
      daysLeft: null,
    }
  }

  // 已关闭自动续费但仍在周期内：权益照旧，只是不再续
  const status: SubscriptionStatus =
    plan.autoRenew === false ? "canceled" : "active"

  return {
    tier,
    status,
    paid: true,
    trialDaysLeft: null,
    daysLeft: expiry === null ? null : daysBetween(now, expiry),
  }
}

/** 当前档位下某个计量器的额度 */
export function allowanceOf(tier: Tier, meter: MeterId): Allowance {
  return tiers[tier].allowance[meter]
}

/** 当前档位下某个功能是否开放 */
export function canUse(tier: Tier, feature: FeatureKey): boolean {
  return tiers[tier].features[feature]
}

/** 当前档位可用的离线包数量；Infinity 表示全量 */
export function offlinePackQuota(tier: Tier): number {
  const value = tiers[tier].offlinePacks
  return value === "all" ? Number.POSITIVE_INFINITY : value
}

/**
 * 试用结束后的去向。付费墙与会员页都要如实说明这两种情况，
 * 这是北美/欧洲自动续费合规的核心披露。
 */
export type TrialExit =
  | { kind: "charge"; tier: Tier; cycle: Cycle }
  | { kind: "downgrade" }

export function trialExit(
  willCharge: boolean,
  tier: Tier,
  cycle: Cycle,
): TrialExit {
  if (willCharge && tier !== "free") return { kind: "charge", tier, cycle }
  return { kind: "downgrade" }
}

/** 降级后仍然保留的东西——写进文案，避免用户以为数据被删 */
export const DOWNGRADE_KEEPS = [
  "每日 20 次即时翻译与 10 分钟同传",
  "已下载的 1 个离线语言包继续可用",
  "历史记录、词汇与会议纪要全部保留，不会被删除",
  "已单独买断的离线包永久有效",
]

/** 降级后失去的东西 */
export const DOWNGRADE_LOSES = [
  "超出 1 个的离线语言包被锁定（续费即恢复，不重新下载）",
  "会议只转写不生成纪要与待办",
  "通话同传与观影同传暂停",
  "跨设备同步暂停，本地数据仍在",
]
