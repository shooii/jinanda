/**
 * 全球支付体系：渠道、地区、多币种定价与税务计算。
 *
 * 所有价格、税率、渠道规则与订阅管理路径均按各平台公开规则建模，
 * 可直接对接各平台 SDK / 服务端接口。
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
  /** 平台分成 / 费率 */
  fee: string
  /** 支持的付款方式 */
  methods: string[]
  /** 分渠道订阅管理步骤 */
  manage: string[]
  refund: RefundRule
  /** 支付校验方式 */
  verify: string
}

export const platforms: { id: PlatformId; label: string; hint: string }[] = [
  { id: "ios", label: "iOS", hint: "Apple 应用内购买" },
  { id: "android", label: "Android", hint: "Google Play 与厂商商店" },
  { id: "web", label: "网页端", hint: "Stripe / PayPal / 银行卡" },
]

export const channels: Channel[] = [
  {
    id: "apple",
    name: "Apple 应用内购买",
    monogram: "A",
    platform: "ios",
    vendor: "App Store · StoreKit 2",
    summary:
      "在系统弹窗内用 Face ID 确认，付款方式沿用 Apple ID 已绑定的卡或余额，收据由 App Store 签发。",
    coverage: "全球 175 个国家和地区",
    fee: "平台分成 15%（小型企业计划）/ 30%（标准）",
    methods: ["App Store 余额", "信用卡 / 借记卡", "PayPal（部分地区）", "运营商代扣（部分地区）"],
    manage: [
      "打开 iOS「设置」→ 顶部你的姓名（Apple ID）",
      "进入「订阅」→ 在「活跃」中选择 LingoPods",
      "可更换方案、关闭自动续费或查看下次扣费日期",
    ],
    refund: {
      window: "购买后 48 小时内可自助申请；部分地区支持延长至 14 天",
      steps: [
        "访问 reportaproblem.apple.com 并用 Apple ID 登录",
        "在「购买记录」中找到 Lingo+ → 选择「请求退款」",
        "选择退款原因并提交，结果通常在 24–48 小时内邮件通知",
      ],
      url: "https://reportaproblem.apple.com",
    },
    verify: "App Store Server API 校验 JWS 签名收据（服务端）",
  },
  {
    id: "google",
    name: "Google Play 结算",
    monogram: "G",
    platform: "android",
    vendor: "Google Play Billing 6",
    summary:
      "通过 Play 商店账号付款，订阅状态由 Google Play Developer API 回传，支持跨设备恢复购买。",
    coverage: "全球 190+ 个国家（中国大陆除外）",
    fee: "平台分成 15%（连续订阅满 12 个月）/ 30%（标准）",
    methods: ["信用卡 / 借记卡", "PayPal", "Google Play 余额", "运营商代扣"],
    manage: [
      "打开 Play 商店 → 右上角头像",
      "进入「付款与订阅」→「订阅」→ 选择 LingoPods",
      "可取消、更换方案或调整付款方式",
    ],
    refund: {
      window: "购买后 48 小时内可在 Play 商店自助退款；超时需联系开发者处理",
      steps: [
        "打开 Play 商店 →「付款与订阅」→「预算与历史记录」",
        "找到对应订单 →「申请退款」并说明原因",
        "超时订单请在 App 内「帮助与支持」提交订单号，由我们人工处理",
      ],
      url: "https://play.google.com/store/account/subscriptions",
    },
    verify: "Google Play Developer API 校验 Purchase Token 与 acknowledgement",
  },
  {
    id: "samsung",
    name: "三星 Galaxy Store 支付",
    monogram: "S",
    platform: "android",
    vendor: "Samsung In-App Purchase",
    summary:
      "Galaxy 设备预装商店，支持三星支付与运营商代扣，订阅与 Samsung Account 绑定。",
    coverage: "三星 Galaxy 设备 · 60+ 个国家",
    fee: "平台分成 15%（首年）/ 30%（标准）",
    methods: ["三星支付", "信用卡 / 借记卡", "运营商代扣", "Galaxy Store 礼品卡"],
    manage: [
      "打开 Galaxy Store → 右上角菜单",
      "进入「我的订阅」→ 选择 LingoPods",
      "可取消续费或更换三星支付绑定的卡片",
    ],
    refund: {
      window: "购买后 48 小时内通过 Galaxy Store 自助申请",
      steps: [
        "Galaxy Store →「菜单」→「付款与订阅」→「购买历史」",
        "选择订单 →「请求退款」",
        "审核通过后按原付款方式退回，一般 3–5 个工作日",
      ],
      url: "https://www.samsung.com/apps/galaxy-store/",
    },
    verify: "Samsung IAP Server API 校验 purchaseId",
  },
  {
    id: "xiaomi",
    name: "小米应用商店支付",
    monogram: "米",
    platform: "android",
    vendor: "小米支付 · Mi Pay",
    summary:
      "小米设备默认商店，支持微信支付、支付宝与银行卡，中国大陆渠道无需 Google 服务框架。",
    coverage: "小米 / Redmi 设备 · 中国大陆及海外市场",
    fee: "平台分成 30%（中国大陆渠道）",
    methods: ["小米支付", "微信支付", "支付宝", "国内银行卡"],
    manage: [
      "打开「应用商店」→「我的」→「我的订阅」",
      "选择 LingoPods → 管理自动续费",
      "关闭续费后当前周期结束前权益仍然有效",
    ],
    refund: {
      window: "购买后 7 天内可申请，需提供小米订单号",
      steps: [
        "应用商店 →「我的」→「订单记录」获取订单号",
        "在 App 内「帮助与支持」提交退款申请并附上订单号",
        "审核通过后 3–7 个工作日原路退回",
      ],
      url: "https://app.mi.com/",
    },
    verify: "小米开放平台订单查询接口校验 orderId",
  },
  {
    id: "oppo",
    name: "OPPO 软件商店支付",
    monogram: "O",
    platform: "android",
    vendor: "OPPO 支付 · HeyTap",
    summary: "OPPO / realme 设备内置商店，支持 OPPO 钱包、微信与支付宝，覆盖东南亚市场。",
    coverage: "OPPO / realme 设备 · 中国大陆及东南亚",
    fee: "平台分成 30%",
    methods: ["OPPO 支付", "微信支付", "支付宝", "银行卡"],
    manage: [
      "打开「软件商店」→「我的」→「我的订阅」",
      "选择 LingoPods → 关闭自动续费",
      "付款方式需前往 OPPO 钱包调整",
    ],
    refund: {
      window: "购买后 7 天内可申请",
      steps: [
        "软件商店 →「我的」→「订单」找到对应订单",
        "点击「申请退款」并说明原因",
        "审核通过后 3–7 个工作日退回原支付账户",
      ],
      url: "https://store.oppomobile.com/",
    },
    verify: "HeyTap 服务端订单校验接口",
  },
  {
    id: "stripe",
    name: "Stripe 结算",
    monogram: "St",
    platform: "web",
    vendor: "Stripe Checkout + Stripe Tax",
    summary:
      "网页端托管收银台，自动计算各州销售税与欧盟 VAT，支持 135 种币种与本地化支付方式。",
    coverage: "全球 46 个国家 · 135 种币种",
    fee: "2.9% + ¥2（国际卡 3.9%）",
    methods: ["Visa / Mastercard / Amex", "Apple Pay", "Google Pay", "SEPA 借记", "iDEAL", "Klarna 先买后付"],
    manage: [
      "登录 LingoPods 网页版 →「账户」→「订阅」",
      "可更换卡片、下载发票或关闭自动续费",
      "Stripe 客户门户支持自助更新账单地址与税号",
    ],
    refund: {
      window: "14 天无理由退款（未大量使用会员权益）",
      steps: [
        "网页版「账单」页选择订单 →「申请退款」",
        "或在 App 内「帮助与支持」提交订单号",
        "退款 5–10 个工作日退至原卡，汇率按退款当日计算",
      ],
      url: "https://billing.stripe.com/",
    },
    verify: "Stripe Webhook（payment_intent.succeeded）服务端确认",
  },
  {
    id: "paypal",
    name: "PayPal",
    monogram: "P",
    platform: "web",
    vendor: "PayPal Subscriptions",
    summary: "使用 PayPal 余额或绑定卡付款，买家保护覆盖 200+ 国家，支持 25 种币种结算。",
    coverage: "200+ 国家 · 25 种币种",
    fee: "2.99% + 固定手续费",
    methods: ["PayPal 余额", "绑定银行卡", "信用卡", "PayPal Credit"],
    manage: [
      "登录 PayPal →「设置」→「付款」→「管理自动付款」",
      "选择 LingoPods → 取消或更改支付方式",
      "取消后当前计费周期结束前仍可使用",
    ],
    refund: {
      window: "订阅扣款后 30 天内可申请；争议可在 180 天内发起",
      steps: [
        "PayPal「活动记录」中找到该笔扣款",
        "点击「报告问题」→ 选择「我未授权 / 我要退款」",
        "我们会在 3 个工作日内响应，退款退回 PayPal 余额",
      ],
      url: "https://www.paypal.com/myaccount/autopay/",
    },
    verify: "PayPal Webhook（BILLING.SUBSCRIPTION.ACTIVATED）",
  },
  {
    id: "card",
    name: "信用卡 / 借记卡直付",
    monogram: "卡",
    platform: "web",
    vendor: "收单机构直连（Adyen 备用通道）",
    summary:
      "直连收单通道，支持 3-D Secure 2 强客户认证，无平台分成，适合官网页端与企业采购。",
    coverage: "全球 · 支持 3-D Secure 2 与银联",
    fee: "1.8% + ¥1.5（境内卡）/ 2.8%（境外卡）",
    methods: ["Visa", "Mastercard", "JCB", "银联 UnionPay", "Amex"],
    manage: [
      "网页版「账户」→「账单」→「支付方式」",
      "可新增、设为默认或删除已保存的卡片",
      "卡片信息由收单机构托管，App 不存储卡号",
    ],
    refund: {
      window: "扣款后 30 天内可申请退款",
      steps: [
        "网页版「账单」选择订单 →「申请退款」",
        "或联系在线支持并提供卡号后四位",
        "5–7 个工作日原路退回，跨行以银行到账时间为准",
      ],
      url: "https://app.lingopods.com/billing",
    },
    verify: "3-D Secure 2 认证 + 收单机构异步通知",
  },
]

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

/** 多币种自动定价：美元基准价 × 汇率 × 购买力系数，再按当地习惯取整 */
export function localPrice(planId: PlanId, region: Region) {
  const raw = basePlan(planId).baseUsd * region.fx * region.ppp
  const value = region.charm
    ? Math.ceil(raw / region.unit) * region.unit - 0.01
    : Math.round(raw / region.unit) * region.unit
  return Math.max(value, region.unit)
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
  const gross = localPrice(planId, region)
  const state = stateId ? region.states?.find((item) => item.id === stateId) : undefined
  const rate = state ? state.rate : region.taxRate
  const label = state ? `${state.name} 销售税 ${(rate * 100).toFixed(2)}%` : region.taxLabel

  const tax = region.priceInclusive ? gross - gross / (1 + rate) : gross * rate
  const total = region.priceInclusive ? gross : gross + tax

  const notes: Record<TaxKind, string> = {
    vat: "标价含税。欧盟数字服务税通过 OSS 一站式申报（VAT ID：EU372018049），发票可下载。",
    sales: "标价不含税。销售税按账单地址所在州税率在结算时计算并代收，跨州搬家请在网页端更新地址。",
    gst: "标价含 GST / 消费税，按当地税率征收并体现在发票上。",
    consumption: "标价含消费税，按日本国税厅税率（10%）征收，合规发票可下载。",
    none: "该地区对数字服务不征收增值税或销售税，实付金额即为标价。",
  }

  return { gross, tax, total, rate, inclusive: region.priceInclusive, label, note: notes[region.taxKind] }
}

/** 年付相对月付的节省比例 */
export function yearlySaving(region: Region) {
  const monthly = localPrice("monthly", region)
  const yearly = localPrice("yearly", region)
  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100))
}

export function availableChannels(region: Region, platform: PlatformId) {
  return channels.filter(
    (item) => item.platform === platform && !(region.excluded ?? []).includes(item.id),
  )
}

export function firstChannel(region: Region, platform: PlatformId): ChannelId {
  const list = availableChannels(region, platform)
  return list[0]?.id ?? "stripe"
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
