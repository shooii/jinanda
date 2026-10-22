# 北美 / 欧洲支付打通：产品深化设计

> 面向 LingoPods（AI 翻译耳机 + App）。现状基线：`src/lib/payments.ts`（8 渠道 / 13 地区 / 税费 / PPP 定价）、`src/lib/services/entitlements.ts`（收据服务端校验契约）、`src/features/PaymentCheckout.tsx`（下单流程）。
> 本文回答一个问题：**渠道打通之后，产品本身该往哪儿深化。**
> 政策与费率数据截至 2026-10。

---

## 一、三个判断

**1. 这不是"加 Stripe"，是换商业骨架。**
现在的模型是「1 档订阅 × 13 个地区汇率换算」。北美/欧洲要的是「**4 类商品 × 按平台与地区动态编排渠道 × 服务端价格目录 × 完整权益状态机**」。前者是定价页，后者是商务系统。

**2. 2026 年是一个有法律风险的窗口，架构必须能回退。**
美国区 App 内可以合法引导用户去网页付款，Apple 目前收 **0%** 佣金——但这个数字正在最高法院打。把佣金率做成配置，不要烧进业务逻辑。

**3. 翻译耳机断供比软件断供危险得多。**
订阅到期直接锁功能 = 设备变砖 → 北美/欧洲大量 1 星差评 + 退款 + chargeback。付费墙设计的第一原则是「**到期降级到仍可用的免费层，而不是停止工作**」。

---

## 二、商品结构：从 1 档订阅扩到 4 类 SKU

这是最实的一刀。现在 `PlanState.period` 只有 `monthly | yearly`，撑不住欧美市场。

| SKU 类型 | 例子 | 计费形态 | 允许的渠道 | 产品意义 |
| --- | --- | --- | --- | --- |
| **订阅** | Free / Plus / Pro | 循环 | IAP、Play、Stripe、PayPal | 现金流主体 |
| **买断** | Lifetime $249、单个离线语言包 $9.99 | 一次性 | IAP、Play、Stripe | 打「订阅疲劳」，提高首单转化 |
| **消耗型** | 额外会议转写 300 分钟 $4.99 | 一次性 + 余额 | IAP、Play、Stripe | 覆盖重度用户，抬 ARPU |
| **实体商品** | 耳机、单只补配、充电仓、耳塞套 | 一次性 + 物流 | **只能 Stripe / 卡，禁止 IAP** | 复购金矿，且几乎零平台分成 |

**为什么实体商品这一行是重点**：Apple 3.1.3 明确规定实体商品与服务**必须**使用 IAP 之外的支付方式。这意味着 App 里卖配件是合规自由度最高的地方——单只耳机补配（$79 级别）在欧洲是高频需求，毛利远高于订阅，而且完全绕开 15–30% 分成。现在的 `channels` 里没有「配件商城」这个概念，需要新增。

**建议档位（待 A/B，不要一次全上）**

- Free：每日 10 分钟对话翻译、2 个语言对、仅在线
- Plus $7.99/月 或 $59.99/年：无限对话、离线包、会议转写 300 分钟
- Pro $14.99/月 或 $119.99/年：相机翻译无限、会议无限、多设备、EU 本地处理
- Lifetime $249：限首年硬件用户
- 硬件激活赠 12 个月 Plus（`source: "device"` 已有建模，需补防串号）

当前 $5.99/$45.99 对北美偏低、对欧洲含税后毛利被吃穿（见第六节）。

---

## 三、渠道编排：平台 × 地区 × SKU 决策矩阵

**2026 年各渠道的真实佣金（按订阅计）**

| 渠道 | 美国 | 欧盟 / 英国 | 关键约束 |
| --- | --- | --- | --- |
| Apple IAP | 15%（小企业计划）/ 30% | 同左 | iOS 内数字商品默认路径 |
| Apple 外链（美国店） | **0%**（诉讼未决） | — | 仅美国店面；App 内可合法告知网页更便宜 |
| Apple 外链（欧盟 DMA） | — | 需单独授权 + CTC 佣金 | 费率随 Apple 条款版本变动，须按最新条款核对 |
| Google Play | **10% + 5%** 服务费 | **10% + 5%** | 2026-06-30 起美/欧/英订阅已降费 |
| Google 外链 / 替代计费 | 10%（2026-10-01 起需申报） | 需申请 | 必须上报交易并缴服务费 |
| Stripe（美国主体） | 2.9% + $0.30 | 卡 2.9%+$0.30 → 欧洲卡 +1.5% → 换汇 +1% | 实际可到 5.4% |
| Stripe（欧洲主体） | 卡 1.5% + €0.25（EEA 标准卡） | 同左 | 欧洲主体做欧洲生意费率最优 |
| SEPA 直接借记 | — | €0.25–0.30 | 德国/荷兰必接，远低于卡 |
| iDEAL / Wero | — | €0.25 | 荷兰线上支付占比过半 |
| Klarna | 5.99% + $0.30 | 分地区 | 只适合高客单（Lifetime / 硬件），订阅别用 |
| PayPal | 2.99% + 固定费 | 同左 | 争议期 180 天，风控成本高 |

**必接清单**

- 北美：Card（Visa/MC/Amex）、Apple Pay、Google Pay、PayPal、ACH（年付大额）
- 欧洲：Card、**SEPA 直接借记**、iDEAL、Bancontact（比）、Cartes Bancaires（法）、Klarna（仅硬件/买断）、PayPal
- 欧洲缺本地支付方式，转化率掉得很明显——这不是优化项，是入场券

**现在代码要改的**：

1. `channels` 需增加 **capability 字段**（`supportsRecurring / supportsOneTime / supportsPhysical / supportsTrial`），不能再用 `channel.platform` 单一维度筛选。
2. `availableChannels(region, platform)` 要扩成 `resolveChannels(region, platform, skuType)`。
3. `paySteps(platform)` 的三段式假流程要换成真实跳转语义：`redirect | webview | native-sheet | external-link`。

---

## 四、收单主体：现在的费率是错的

`payments.ts` 里写的是「2.9% + ¥2（国际卡 3.9%）」——这是**中国大陆 Stripe 账户**的口径，服务北美/欧洲用户不成立。

| 方案 | 费率 | 税务负担 | 适合 |
| --- | --- | --- | --- |
| 中国主体直收 | 高（跨境卡 + 换汇 + 提现） | 需自行处理 US/EU 税 | 不建议做 B2C |
| 香港 / 新加坡主体 | 中等 | 同上 | 过渡期 |
| 美国主体 + Stripe | 2.9% + $0.30 | 需自建 US nexus / EU OSS | 长期最优，但合规成本前置 |
| **MoR（Paddle / Lemon Squeezy）** | 5% + $0.50 量级 | **卖方承担** | **MVP 阶段强烈推荐** |

**建议**：北美/欧洲首发阶段用 MoR 承接税与退款责任，等 ARR 和合规团队到位再迁 Stripe 直连。这意味着 `payments.ts` 的 `fee` 字段要变成「**运行时从服务端下发的费率配置**」，而不是硬编码常量——因为主体换了费率就全变。

---

## 五、价格目录：把 `localPrice()` 从换算改成下发

**现状问题**（`payments.ts:530`）：

```ts
const raw = basePlan(planId).baseUsd * region.fx * region.ppp
```

四个毛病：

1. **价格天天变**。汇率波动直接改标价，用户看到 €4.61 今天 €4.67 明天——欧美用户会截图投诉。
2. **含税地区毛利被吃穿**。德国 VAT 19%，$5.99 换算成含税价后，扣掉 VAT 再扣 30% 分成，到手不足 $2.4。
3. **`ppp` 是拍脑袋系数**，北美/欧洲本来 PPP ≈ 1，这个字段对目标市场没有意义。
4. **无法做 A/B 和促销**，因为价格是算出来的不是配置的。

**改成**：

- 服务端下发 **price book**：`{ region, currency, skuId, amount, taxInclusive, trialDays, promoLabel, version }`
- 客户端只负责展示与锁定报价（`quoteId` 有 TTL，比如 15 分钟）
- 欧洲用**含税标价**，且按 gross-up 反推净价（法律要求展示含税总价）
- 心理定价用当地习惯：$7.99 / €7.99 / £6.99，**不要** €7.42
- 换区（region change）时以**账单地址**为准，不以 IP 或系统语言为准

这直接决定了 `localPrice()` / `priceQuote()` 的签名要改成接收 `PriceBook` 而不是 `Region`。

---

## 六、权益状态机：当前最大的缺口

`entitlements.ts` 现在只有 `source / planId / expiresAt / verified` 四个字段，`entitlementActive()` 只判断「已校验 + 未过期」。这撑不住真实订阅——它没有「**宽限期**」「**催款中**」「**已取消但未到期**」这三种最常见的状态。

而这三种状态恰恰是欧美用户最常遇到的：卡过期、3DS 失败、主动取消后还剩 12 天。

**必须补的状态**

| 状态 | 含义 | 用户可见行为 | 权益 |
| --- | --- | --- | --- |
| `trialing` | 试用中 | 顶部显示剩余天数 | 全量 |
| `active` | 正常订阅 | — | 全量 |
| `past_due` | 扣款失败 | 顶部黄色条 + 更新卡入口 | 全量（宽限期内） |
| `grace` | 宽限最后阶段 | 强提示 + 一键更新 | 降级到 Plus |
| `canceled` | 已取消未到期 | 显示到期日 + 挽回入口 | 全量至 `expiresAt` |
| `paused` | 暂停 1–3 月 | 显示恢复日 | 降级到 Free |
| `expired` | 到期 | 降级到 Free，**不锁设备** | Free |
| `refunded` / `revoked` | 退款 / 拒付 | 立即降级 | Free |

**幂等与重放**：`POST /v1/entitlements/verify` 现在只按 `id` 去重。要加 `transactionId` 唯一约束 + 时间窗，否则同一张收据重放能刷出多份权益。

**跨平台打通**：用户在网页买了年付，打开 iOS App 必须能直接用。这需要账号级权益（`userId` 维度），而不是设备级。当前 `api-contract.md` 的 `GET /v1/entitlements` 是账号级的，OK，但 `PurchaseReceipt` 里没有 `userId`，绑定环节缺一环。

---

## 七、催款（Dunning）：欧美订阅 20–40% 的流失发生在这里

不是流失到竞品，是**卡被拒**。

- **重试节奏**：第 1/3/5/7 天，避开周末；第 2 次失败后发邮件
- **卡更新**：接 Stripe 的 card account updater / 网络令牌，自动跟进换卡
- **3DS 拦截**：自适应 3DS，低风险交易免验证，减少摩擦流失
- **宽限期**：7 天全量 + 7 天降级，不要第 1 天就断
- **账单描述符**：卡账单上必须显示 `LINGOPODS`，否则「未识别扣款」→ 拒付率飙升，每笔拒付成本 $15–25

产品上要有：**「更新付款方式」必须能在两屏内到达**，且从推送/邮件可以直达。

---

## 八、合规清单：合规即产品体验

北美/欧洲的自动续费监管，比多数团队以为的严格。**每一条都对应一个界面元素。**

### 美国

| 规则 | 现状（2026-10） | 产品动作 |
| --- | --- | --- |
| FTC Click-to-Cancel | **已被第八巡回法院于 2025-07-08 整体撤销**，FTC 于 2026-03 重启立法，尚无新规 | 但不要因此放松——见下三行 |
| ROSCA（成文法，未被触及） | 有效 | 收账前披露全部实质条款 + 明示同意 + 简单的停止扣费机制 |
| 加州 ARL（AB 2863，2025-07-01 生效） | 有效 | 取消渠道必须与注册同一媒介；保留同意记录 3 年；取消入口常驻可见 |
| 纽约州 GBL 527（2025-11-05 生效） | 有效 | 涨价需 5–30 天通知，涨价后 14 天内可按比例退款取消 |
| 纽约市（2026-10-01 生效） | **已生效** | 条款紧邻独立同意框；取消不比注册难 |
| Visa 订阅规则（2020-04-18 起） | 有效 | 试用转付费前 **7 天**提醒、明确收据、在线易取消 |
| Mastercard（2022-09-22 起） | 有效 | 数字商品试用转付费前 **3–7 天**提醒 |
| 州销售税 | 各州不同 | 按**账单地址**计征，不按 IP；年付跨州要能改地址 |

### 欧洲

| 规则 | 产品动作 |
| --- | --- |
| 欧盟 VAT OSS | 按消费者所在国税率计征，19–23% 不等；一张申报表覆盖全欧 |
| 消费者法：含税标价 | 展示给消费者的必须是**含 VAT 总价**，不能"€4.99 起 + tax" |
| 14 天撤回权 | 首次订阅 14 天无理由退款（数字内容需明示同意放弃，但对订阅服务通常不可完全放弃）；硬件 30 天 |
| PSD2 / SCA | 欧洲卡付款必须支持 3DS2；订阅续费有豁免额度，要正确声明 |
| GDPR | 支付数据最小化；不存卡号（走 PSP 托管，PCI SAQ-A）；营销邮件必须 opt-in，**不能默认勾选** |
| 语言与货币 | 至少 en/de/fr/es 四语界面 + 本地货币标价；发票必须可下载且含 VAT ID、双方地址 |

**关键设计原则**：取消流程不能比注册更难。这在加州、纽约、欧盟都是硬要求，而且——它是留存的正解。用「一键暂停 2 个月」代替「隐藏取消按钮」，比暗黑模式有效得多，且不违法。

---

## 九、付费墙与试点：北美 vs 欧洲的差异

| 维度 | 北美 | 欧洲 |
| --- | --- | --- |
| 订阅接受度 | 高，但对"订阅一切"疲劳 | 中等，更偏好买断与低月费 |
| 首选方案 | 年付（月付折价展示） | 月付 + 买断选项 |
| 试用 | 7 天免费试用是标配 | **缩短到 3–7 天**，且必须在转付费前明确提醒 |
| 价格敏感点 | 单次金额 | 含税总价透明度 |
| 决策关键词 | 「无限」「省 X%」 | 「不用订阅也能用」「数据在欧盟处理」 |
| 免费层 | 必须有，且真能用 | 必须有，且明确不降级设备 |

**付费墙位置建议**（按转化效率排序）：

1. 首次成功翻译后（价值已证明）—— 而不是首次打开
2. 触发限额时（自然的 gate，不是拦截）
3. 离线包下载前（刚需，一次性买断转化极高）
4. 会议转写结束的「导出/沉淀」节点
5. 硬件激活后第 10 天（赠送期过半，展示 Plus 价值）

**挽回流程**（合规版本）：取消时提供三选一 —— 「暂停 2 个月」/「降级到 Free」/「继续取消」。**不要**给折扣弹窗做遮挡，那是加州和 FTC 重点打击对象。

---

## 十、服务端契约增量

在 `docs/api-contract.md` 基础上追加：

```
GET  /v1/catalog?region=DE&platform=ios
     → { priceBookId, version, skus: [{ skuId, kind, amount, currency,
         taxInclusive, trialDays, channels: [...] }] }

POST /v1/quote
     → { quoteId, skuId, gross, tax, total, taxLabel, expiresAt }

POST /v1/checkout/session
     → { url } | { clientSecret } | { storeKitProductId }

GET  /v1/subscription          → 完整状态机对象
POST /v1/subscription/pause    { months }
POST /v1/subscription/resume
POST /v1/subscription/cancel   { reason, immediate: false }
POST /v1/billing/portal        → { url }

POST /v1/webhooks/{stripe|apple|google|paypal}
     → 幂等键 = 渠道事件 id；落库后异步驱动状态机

GET  /v1/usage                 → { meetingMinutes, cameraTranslations, ... }
POST /v1/consent               → 自动续费明示同意留痕（合规必需）
```

`POST /v1/consent` 是新增的重点：加州要求保留 3 年同意记录，这条不能省。

---

## 十一、指标

必须埋的事件（服务端为准，客户端只做补点）：

```
paywall_view{placement, sku, region, platform}
plan_select{sku, cycle}
trial_start / trial_reminder_sent / trial_convert / trial_cancel
checkout_start / checkout_fail{code, channel} / checkout_success
subscription_past_due / dunning_recovered / dunning_lost
cancel_start{reason} / cancel_saved{variant} / cancel_confirmed
refund_request / chargeback
region_switch{from, to}
```

核心看板：付费墙 → 试用 → 转付费 → 续费 的漏斗；**dunning 恢复率**；**退款率**（>3% 说明付费墙或价值传达有问题）；按 region × channel 的 ARPU。

---

## 十二、落地节奏

**P0 — 先修事实性错误（1 周）**

- `payments.ts` 的费率改为服务端下发，删掉 CN 口径硬编码
- `channel` 增加 capability 字段，`availableChannels` 改为按 SKU 类型解析
- `entitlements.ts` 扩展状态机字段，`entitlementActive()` 支持 `grace` / `canceled`
- `verifyPurchase` 增加 `transactionId` 幂等

**P1 — 让北美元/欧洲元真的能收到钱（3–4 周）**

- 接入 MoR 或 Stripe Checkout，走真实托管收银台（替换 `PaymentCheckout` 的模拟 720ms 步骤）
- 服务端 price book + quote
- 欧洲本地支付方式：SEPA、iDEAL、Bancontact
- 试用 + 转换提醒（Visa 7 天 / MC 3–7 天）
- 账单门户 + 发票下载

**P2 — 把支付变成增长杠杆（6–8 周）**

- 实体配件商城（单只补配、充电仓）走 Stripe
- 离线包买断 / 转写分钟消耗包
- Lifetime 档位
- Dunning 全链路 + 卡更新
- 暂停订阅 + 合规挽回流程
- 跨平台权益打通（网页购买 → iOS 可用）

---

## 十三、平台维度：设备 ≠ 分发

**结论：要区分，但现在区分的维度是错的。**

`PlatformId = "ios" | "android" | "web"` 是单维三分类，把两个正交概念压成了一个：

| 维度 | 决定什么 | 例子 |
| --- | --- | --- |
| **设备形态** | UI、安全区、可用 API | iPhone / Android / 桌面 |
| **分发渠道** | 支付规则、佣金、审核约束 | App Store 包 / Play 包 / 浏览器直开 |

支付规则由**分发**决定，能力由**设备**决定。同一台 iPhone，从 App Store 装的包和在 Safari 里打开的网页，是**两套完全不同的法律规则**——而现在这三格里根本表达不出来。

### 2×2：真正决定支付路径的矩阵

| | 商店包（经审核） | 浏览器直接打开（不经审核） |
| --- | --- | --- |
| **iPhone / iPad** | IAP 15% / 30%，受 3.1.1 约束 | **Stripe 直连合法**，不受 App Store 审核约束 |
| **Android** | Play 10% + 5%（美/欧/英） | **Stripe 直连合法**，或用 TWA 上架 |

### 本项目的现实

这是一个 **PWA**（`public/manifest.webmanifest` + `src/lib/pwa.ts`），不是原生包。由此：

1. `channels` 里的 **apple / google / samsung / xiaomi / oppo 五个渠道当前全部无法真实接通**——PWA 里没有 StoreKit，也没有 Play Billing。它们现在是演示态。产品上必须诚实，不要让用户看到"Apple 应用内购买"却只得到一段模拟进度条。
2. 当前唯一可真实落地的收单路径是 **Stripe / MoR**。
3. 一旦要上架 App Store 或 Play，就多了一整个分发维度的规则，不能靠一个 `platform` 字段扛。

### 更硬的一条：iPhone 上蓝牙连不上

`src/lib/device-link.ts` 走的是 `navigator.bluetooth`（Web Bluetooth）。该 API 在 **iOS / iPadOS Safari 中任何版本都不支持**，且 iOS 上所有浏览器都是 WebKit 内核（Chrome on iOS 同样不支持），Apple 至今没有实现路线图。

`bluetoothSupported()` 目前只是返回 `false`，但产品没有为此设计任何降级路径。一个 AI 翻译耳机的 App 在 iPhone 上连不上耳机，这是产品级问题，优先级高于支付。

三条出路：

1. **Capacitor / 原生壳 + BLE 插件**：顺带就能接 IAP，一次解决两个问题
2. **走系统蓝牙设置配对**：App 只做音频路由与云端配置。iOS 可行，但拿不到电量 / 固件 / 手势这些 GATT 数据
3. **iOS 定位为"已配对设备的配套控制台"**：功能降级，明确告知

### 必须分支的能力清单

| 能力 | iOS Safari / PWA | Android Chrome |
| --- | --- | --- |
| Web Bluetooth | 不支持 | 支持 |
| 安装方式 | 手动「分享 → 添加到主屏幕」 | `beforeinstallprompt` 可自动 |
| Web Push | 仅已安装到主屏的 PWA（16.4+） | 标签页内即可 |
| `navigator.storage.persist()` | **未实现**（no-op） | 支持，已安装通常自动授予 |
| 存储清理 | 未安装 → 7 天 ITP 清空；已安装 → 豁免 | 已安装优先保留 |
| Vibration API | 不支持 | 支持 |
| Background Sync | 不支持 | 支持 |
| 返回导航 | 无浏览器返回键，须自建 | 系统返回键 |

其中两行对本产品是致命的：

- **`storage.persist()` 在 iOS 上是空操作**——离线语言包（`offline-packs.ts`）在 iPhone 上，只要用户没"添加到主屏幕"，7 天后缓存会被 ITP 清空。安装引导不是增长手段，是功能前提。
- **Vibration 不支持**——`earcon.ts` 的触觉通道在 iPhone 上完全失效（`navigator.vibrate` 不存在，被静默跳过）。而"不看屏幕"正是耳机体验的核心，iOS 上只剩声音一条通道，需要单独的听觉区分设计。

### 判断方式：能力探测，不是 UA

```ts
const caps = {
  ble: "bluetooth" in navigator,
  vibrate: typeof navigator.vibrate === "function",
  persist: typeof navigator.storage?.persist === "function",
  standalone: matchMedia("(display-mode: standalone)").matches,
  push: "PushManager" in window,
}
```

UA 判断只保留一处：**决定支付渠道**（那是政策问题，不是能力问题），并且优先用 `navigator.userAgentData`。

### 现有 `detectPlatform()` 的 bug

```ts
if (/iPhone|iPad|iPod|Macintosh/i.test(ua) && /Mobile/i.test(ua)) return "ios"
```

iPadOS 13+ 的默认 UA 是 `Macintosh; Intel Mac OS X`，**不含 `Mobile`**。实测：

| UA | 实际设备 | 返回值 |
| --- | --- | --- |
| iPhone Safari | iPhone | `ios` ✅ |
| `iPad; ... Mobile/15E148` | iPad | `ios` ✅ |
| `Macintosh; ... 无 Mobile` | **iPad（桌面模式）** | `web` ❌ |
| `Macintosh; ... 无 Mobile` | Mac | `web` ✅（纯属巧合） |

iPad 的桌面模式 UA 与 Mac Safari **完全一致**，只能靠 `navigator.maxTouchPoints > 1` 区分。修法：

```ts
export function detectDevice(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return "android"
  const apple = /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  return apple ? "ios" : "desktop"
}
```
