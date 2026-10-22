/**
 * 支付与地区演示数据。
 *
 * 渠道、价格、税率、退款规则与流程均未完成生产核验，不能用于实际结账、
 * 税务申报或向用户承诺可用支付能力。
 */

export type PlatformId = "ios" | "android" | "web"

export type ChannelId =
  | "apple"
  | "google"
  | "samsung"
  | "xiaomi"
  | "oppo"
  | "stripe"
  | "paypal"
  | "card"

export type PlanId = "monthly" | "yearly"

export type RefundRule = {
  /** 退款时限说明 */
  window: string
  /** 分步骤退款指引 */
  steps: string[]
  /** 自助退款入口 */
  url: string
}

export type Channel = {
  id: ChannelId
  name: string
  /** 渠道角标文字 */
  monogram: string
  platform: PlatformId
  vendor: string
  summary: string
  coverage: string
  /** 待商户报价与协议核实 */
  fee: string
  /** 演示数据，待地区可用性核实 */
  methods: string[]
  /** 演示指引，待商店版本与地区核实 */
  manage: string[]
  refund: RefundRule
  /** 目标服务端校验方式，尚未接入 */
  verify: string
}

export const platforms: { id: PlatformId; label: string; hint: string }[] = [
  { id: "ios", label: "iOS", hint: "Apple 应用内购买" },
  { id: "android", label: "Android", hint: "Google Play 与厂商商店" },
  { id: "web", label: "网页端", hint: "Stripe / PayPal / 银行卡" },
]

// 仅保留渠道标识供架构预览；商户配置与生产能力均未接入。
export const channels: Channel[] = [
  { id: "apple", name: "Apple 应用内购买", platform: "ios" },
  { id: "google", name: "Google Play 结算", platform: "android" },
  { id: "samsung", name: "三星 Galaxy Store 支付", platform: "android" },
  { id: "xiaomi", name: "小米应用商店支付", platform: "android" },
  { id: "oppo", name: "OPPO 软件商店支付", platform: "android" },
  { id: "stripe", name: "Stripe 结算", platform: "web" },
  { id: "paypal", name: "PayPal", platform: "web" },
  { id: "card", name: "银行卡收单", platform: "web" },
].map((item) => ({
  id: item.id as ChannelId,
  name: item.name,
  platform: item.platform as PlatformId,
  monogram: item.name.slice(0, 1),
  vendor: item.name,
  summary: "候选渠道，尚未接入真实支付。",
  coverage: "待商户资质、分发商店与地区政策核实",
  fee: "待商户合同与平台规则核实",
  methods: [],
  manage: ["通过实际购买渠道管理订阅；当前未接入管理接口。"],
  refund: {
    window: "待购买渠道与当地消费者规则核实",
    steps: ["向实际购买渠道查询退款资格与申请入口。"],
    url: "",
  },
  verify: "待实现服务端交易校验与通知对账",
}))



export type TaxKind = "vat" | "sales" | "gst" | "consumption" | "none"

export type TaxState = { id: string; name: string; rate: number }

export type Region = {
  id: string
  name: string
  locale: string
  currency: string
  fx: number
  /** 购买力平价调整系数 */
  ppp: number
  /** 价格取整单位 */
  unit: number
  /** 是否使用 .99 尾数定价 */
  charm: boolean
  /** 标价是否含税 */
  priceInclusive: boolean
  taxKind: TaxKind
  taxRate: number
  taxLabel: string
  /** 美国各州销售税 */
  states?: TaxState[]
  /** 该地区不可用的渠道 */
  excluded?: ChannelId[]
}

export const regions: Region[] = [
  {
    id: "CN",
    name: "中国大陆",
    locale: "zh-CN",
    currency: "CNY",
    fx: 7.24,
    ppp: 0.876,
    unit: 1,
    charm: false,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.06,
    taxLabel: "增值税 6%",
    excluded: ["google", "samsung"],
  },
  {
    id: "HK",
    name: "中国香港",
    locale: "zh-HK",
    currency: "HKD",
    fx: 7.81,
    ppp: 0.85,
    unit: 1,
    charm: false,
    priceInclusive: true,
    taxKind: "none",
    taxRate: 0,
    taxLabel: "不征收数字服务税",
  },
  {
    id: "US",
    name: "美国",
    locale: "en-US",
    currency: "USD",
    fx: 1,
    ppp: 1,
    unit: 1,
    charm: true,
    priceInclusive: false,
    taxKind: "sales",
    taxRate: 0.0885,
    taxLabel: "州销售税",
    states: [
      { id: "CA", name: "加利福尼亚州", rate: 0.0885 },
      { id: "NY", name: "纽约州", rate: 0.08875 },
      { id: "TX", name: "德克萨斯州", rate: 0.0625 },
      { id: "WA", name: "华盛顿州", rate: 0.065 },
      { id: "FL", name: "佛罗里达州", rate: 0.06 },
      { id: "IL", name: "伊利诺伊州", rate: 0.0875 },
      { id: "OR", name: "俄勒冈州", rate: 0 },
    ],
  },
  {
    id: "DE",
    name: "德国",
    locale: "de-DE",
    currency: "EUR",
    fx: 0.92,
    ppp: 1,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.19,
    taxLabel: "VAT 19%",
  },
  {
    id: "FR",
    name: "法国",
    locale: "fr-FR",
    currency: "EUR",
    fx: 0.92,
    ppp: 1,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.2,
    taxLabel: "VAT 20%",
  },
  {
    id: "IE",
    name: "爱尔兰",
    locale: "en-IE",
    currency: "EUR",
    fx: 0.92,
    ppp: 1,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.23,
    taxLabel: "VAT 23%",
  },
  {
    id: "ES",
    name: "西班牙",
    locale: "es-ES",
    currency: "EUR",
    fx: 0.92,
    ppp: 1,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.21,
    taxLabel: "VAT 21%",
  },
  {
    id: "GB",
    name: "英国",
    locale: "en-GB",
    currency: "GBP",
    fx: 0.79,
    ppp: 1,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.2,
    taxLabel: "VAT 20%",
  },
  {
    id: "JP",
    name: "日本",
    locale: "ja-JP",
    currency: "JPY",
    fx: 151.2,
    ppp: 0.75,
    unit: 10,
    charm: false,
    priceInclusive: true,
    taxKind: "consumption",
    taxRate: 0.1,
    taxLabel: "消费税 10%",
  },
  {
    id: "KR",
    name: "韩国",
    locale: "ko-KR",
    currency: "KRW",
    fx: 1338,
    ppp: 0.7,
    unit: 100,
    charm: false,
    priceInclusive: true,
    taxKind: "vat",
    taxRate: 0.1,
    taxLabel: "VAT 10%",
  },
  {
    id: "SG",
    name: "新加坡",
    locale: "en-SG",
    currency: "SGD",
    fx: 1.35,
    ppp: 0.8,
    unit: 0.5,
    charm: false,
    priceInclusive: true,
    taxKind: "gst",
    taxRate: 0.09,
    taxLabel: "GST 9%",
  },
  {
    id: "AU",
    name: "澳大利亚",
    locale: "en-AU",
    currency: "AUD",
    fx: 1.52,
    ppp: 0.85,
    unit: 0.5,
    charm: true,
    priceInclusive: true,
    taxKind: "gst",
    taxRate: 0.1,
    taxLabel: "GST 10%",
  },
  {
    id: "IN",
    name: "印度",
    locale: "en-IN",
    currency: "INR",
    fx: 83.4,
    ppp: 0.45,
    unit: 10,
    charm: false,
    priceInclusive: true,
    taxKind: "gst",
    taxRate: 0.18,
    taxLabel: "GST 18%",
  },
  {
    id: "BR",
    name: "巴西",
    locale: "pt-BR",
    currency: "BRL",
    fx: 5.05,
    ppp: 0.6,
    unit: 0.5,
    charm: false,
    priceInclusive: true,
    taxKind: "none",
    taxRate: 0,
    taxLabel: "税费由收单方代缴",
  },
]

/** 以美元为基准的方案定价 */
export const basePlans: { id: PlanId; name: string; baseUsd: number; period: string }[] = [
  { id: "monthly", name: "月付", baseUsd: 5.99, period: "月" },
  { id: "yearly", name: "年付", baseUsd: 45.99, period: "年" },
]

export const platformLabel = (platform: PlatformId) =>
  platforms.find((item) => item.id === platform)?.label ?? platform

export const channelById = (id: ChannelId | null): Channel | null =>
  id ? channels.find((item) => item.id === id) ?? null : null

export function regionById(id: string | null): Region {
  return regions.find((item) => item.id === id) ?? regions[0]
}

export const basePlan = (id: PlanId) =>
  basePlans.find((item) => item.id === id) ?? basePlans[1]

/**
 * 多币种自动定价：美元基准价 × 汇率 × 购买力系数，再按当地习惯取整。
 * 商业模型的档位价格统一经由 priceFor 换算，保证取整规则只有一处。
 */
export function priceFor(baseUsd: number, region: Region) {
  const raw = baseUsd * region.fx * region.ppp
  const value = region.charm
    ? Math.ceil(raw / region.unit) * region.unit - 0.01
    : Math.round(raw / region.unit) * region.unit
  return Math.max(value, region.unit)
}

export function localPrice(planId: PlanId, region: Region) {
  return priceFor(basePlan(planId).baseUsd, region)
}

export function formatMoney(value: number, region: Region) {
  const digits = Number.isInteger(value) ? 0 : 2
  try {
    return new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: region.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  } catch {
    return `${region.currency} ${value.toFixed(digits)}`
  }
}

export type Quote = {
  gross: number
  tax: number
  total: number
  rate: number
  inclusive: boolean
  label: string
  note: string
}

/** 税务计算：含税地区反推税额，美国按账单州销售税在结算时加计 */
export function priceQuote(planId: PlanId, region: Region, stateId?: string): Quote {
  return priceQuoteOf(localPrice(planId, region), region, stateId)
}

/**
 * 按已定好的税前标价算税。
 * 商业模型的档位价（monetization.tierPrice）换算完直接进这里，
 * 保证含税地区反推与州销售税加计的逻辑只有一份。
 */
export function priceQuoteOf(gross: number, region: Region, stateId?: string): Quote {
  const state = stateId ? region.states?.find((item) => item.id === stateId) : undefined
  const rate = state ? state.rate : region.taxRate
  const label = state ? `${state.name} 销售税 ${(rate * 100).toFixed(2)}%` : region.taxLabel

  const tax = region.priceInclusive ? gross - gross / (1 + rate) : gross * rate
  const total = region.priceInclusive ? gross : gross + tax

  const note = "仅按静态演示参数估算，不代表实际应税性、税率或含税总价。正式价格与税务凭证须由商店或服务端确认。"

  return { gross, tax, total, rate, inclusive: region.priceInclusive, label: `演示参数 · ${label}`, note }
}

/** 年付相对月付的节省比例 */
export function yearlySaving(region: Region) {
  const monthly = localPrice("monthly", region)
  const yearly = localPrice("yearly", region)
  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100))
}

/** 仅供设计预览：不能由操作系统推断实际分发商店。 */
export function candidateChannels(region: Region, platform: PlatformId) {
  return channels.filter(
    (item) => item.platform === platform && !(region.excluded ?? []).includes(item.id),
  )
}

/** 未完成任何生产渠道接入，默认失败关闭。 */
export function availableChannels(region: Region, platform: PlatformId): Channel[] {
  void region
  void platform
  return []
}

export function firstChannel(region: Region, platform: PlatformId): ChannelId | null {
  return availableChannels(region, platform)[0]?.id ?? null
}

export function detectPlatform(): PlatformId {
  if (typeof navigator === "undefined") return "web"
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua) && /Mobile/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "web"
}

const localeRegion: Record<string, string> = {
  "zh-CN": "CN",
  "zh-SG": "SG",
  "zh-HK": "HK",
  "zh-MO": "HK",
  "zh-TW": "CN",
  "en-US": "US",
  "de-DE": "DE",
  "fr-FR": "FR",
  "es-ES": "ES",
  "en-IE": "IE",
  "en-GB": "GB",
  "ja-JP": "JP",
  "ko-KR": "KR",
  "en-SG": "SG",
  "en-AU": "AU",
  "en-IN": "IN",
  "pt-BR": "BR",
}

const languageRegion: Record<string, string> = {
  zh: "CN",
  en: "US",
  de: "DE",
  fr: "FR",
  es: "ES",
  ja: "JP",
  ko: "KR",
  pt: "BR",
}

/** 依据浏览器语言推断计费地区（正式环境应由 IP + 商店账号国家决定） */
export function detectRegionId(): string {
  if (typeof navigator === "undefined") return "CN"
  const language = navigator.language
  if (localeRegion[language]) return localeRegion[language]
  const prefix = language.split("-")[0]
  return languageRegion[prefix] ?? "CN"
}

/** 支付流程步骤（按平台区分） */
export function paySteps(platform: PlatformId): string[] {
  if (platform === "ios") return ["创建 App Store 订单", "系统弹窗授权", "服务端校验收据", "开通 Lingo+ 权益"]
  if (platform === "android") return ["创建商店订单", "唤起商店收银台", "校验购买凭证", "开通 Lingo+ 权益"]
  return ["创建支付意向", "3-D Secure 验证", "收单机构确认", "开通 Lingo+ 权益"]
}

const monthNames = [
  "1 月", "2 月", "3 月", "4 月", "5 月", "6 月",
  "7 月", "8 月", "9 月", "10 月", "11 月", "12 月",
]

/** 根据订阅周期计算下次扣费日期 */
export function renewDateLabel(planId: PlanId, from = new Date()) {
  const next = new Date(from.getTime())
  if (planId === "yearly") next.setFullYear(next.getFullYear() + 1)
  else next.setMonth(next.getMonth() + 1)
  return `${next.getFullYear()} 年 ${monthNames[next.getMonth()]} ${next.getDate()} 日`
}

export default channels
