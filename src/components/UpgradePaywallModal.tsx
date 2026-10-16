import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { PaymentBrandLogo } from "@/components/BrandLogos"
import { useEscapeKey } from "@/lib/core"
import {
  basePlan,
  detectRegionId,
  formatMoney,
  localPrice,
  regionById,
  renewDateLabel,
  yearlySaving,
} from "@/lib/payments"
import type { PlanId } from "@/lib/payments"
import { usePlan, useTranslationQuota } from "@/lib/store"
import { PaymentCheckout } from "@/features/PaymentCheckout"
import { LegalDocument } from "@/features/LegalDocument"
import type { LegalDocId } from "@/features/LegalDocument"
import { playEarcon } from "@/lib/earcon"

export type PaywallReason =
  | "quota_exceeded"
  | "meeting_limit"
  | "call_exclusive"
  | "watch_exclusive"
  | "offline_limit"
  | "coach_advanced"
  | "manual"

export function UpgradePaywallModal({
  reason = "manual",
  onClose,
  onSuccess,
}: {
  reason?: PaywallReason
  onClose: () => void
  onSuccess?: () => void
}) {
  const [plan, setPlan] = usePlan()
  const { resetQuotaForDev } = useTranslationQuota()
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly")
  const [selectedMethod, setSelectedMethod] = useState<"apple" | "google" | "card" | "paypal" | "sepa">("apple")
  const [checkoutFull, setCheckoutFull] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  useEscapeKey(onClose)

  const region = regionById(detectRegionId())
  const saving = yearlySaving(region)
  const yearlyCost = localPrice("yearly", region)
  const monthlyCost = localPrice("monthly", region)
  const yearlyMonthlyBreakdown = formatMoney(yearlyCost / 12, region)

  const reasonTitle: Record<PaywallReason, string> = {
    quota_exceeded: "今日免费翻译额度已用尽",
    meeting_limit: "长程双语会议与 AI 纪要为 Pro 专享",
    call_exclusive: "实时音视频通话同传为 Pro 专享",
    watch_exclusive: "影视/演讲无限制同传为 Pro 专享",
    offline_limit: "多国离线语言包极速下载为 Pro 专享",
    coach_advanced: "AI 深度口语测评诊断为 Pro 专享",
    manual: "升级 Lingo+ Pro · 解锁无限翻译特权",
  }

  const reasonDesc: Record<PaywallReason, string> = {
    quota_exceeded: "免费版每日赠送 20 次即时翻译。升级 Pro 即可享受无限制实时双向同传、长程会议纪要与全球离线包。",
    meeting_limit: "免费版单次试用 3 分钟。升级 Pro 即可享受不限时录音转写、智能提炼行动待办并自动归档知识库。",
    call_exclusive: "跨国实时微信/音视频电话双向双工同传，需专有神经通道加速保障，为 Lingo+ Pro 专属能力。",
    watch_exclusive: "连续海外公开课、直播与影视杜比原声同传，为 Lingo+ Pro 专属高阶音频流水线能力。",
    offline_limit: "免费版包含 1 个基础语言包。升级 Pro 可无限次批量下载全球 20+ 语种离线神经模型，跨国漫游无断网焦虑。",
    coach_advanced: "高阶 AI 逐词发音诊断、连读修正与实战语料跟读，专为语言进阶学习者打造。",
    manual: "符合欧美主流极简订阅标准，支持 7 天免费试用，涵盖 Apple Pay、Google Pay、Stripe 国际卡与 PayPal。",
  }

  const handleQuickSubscribe = () => {
    playEarcon("ready")
    setSubscribing(true)

    window.setTimeout(() => {
      setPlan({
        ...plan,
        source: "standalone",
        name: `Lingo+ ${basePlan(selectedPlan).name}`,
        autoRenew: true,
        renewDate: renewDateLabel(selectedPlan),
        price: formatMoney(localPrice(selectedPlan, region), region),
        channel: selectedMethod === "apple" ? "apple" : selectedMethod === "google" ? "google" : selectedMethod === "paypal" ? "paypal" : "stripe",
        regionId: region.id,
        currency: region.currency,
        period: selectedPlan,
        orderId: `LP-${Date.now().toString().slice(-8)}`,
        purchasedAt: new Date().toLocaleDateString(),
      })
      resetQuotaForDev()
      playEarcon("success")
      toast("Lingo+ Pro 尊享特权已激活！")
      setSubscribing(false)
      onSuccess?.()
      onClose()
    }, 900)
  }

  const handleActivateDeviceGift = () => {
    playEarcon("ready")
    setPlan({
      ...plan,
      source: "device",
      name: "LingoPods Pro 设备赠送版",
      autoRenew: false,
      renewDate: "2026 年 10 月 18 日",
      price: "¥0",
      channel: null,
      regionId: region.id,
      currency: region.currency,
      period: "yearly",
      orderId: `DEV-GIFT-${Date.now().toString().slice(-6)}`,
      purchasedAt: new Date().toLocaleDateString(),
    })
    resetQuotaForDev()
    playEarcon("success")
    toast("已激活随机赠送的 1 年 Lingo+ Pro 会员权益！")
    onSuccess?.()
    onClose()
  }

  return (
    <div className="profile-panel-backdrop paywall-backdrop" onClick={onClose} role="presentation">
      <div
        className="profile-panel paywall-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Lingo+ Pro 会员订阅"
      >
        <div className="sheet-handle" />
        <header className="paywall-header">
          <div className="paywall-title-box">
            <span className="paywall-eyebrow">
              <Icon name="sparkles" size={14} />
              <span>LINGO+ UNLIMITED</span>
            </span>
            <h2>{reasonTitle[reason]}</h2>
          </div>
          <AppButton ariaLabel="关闭订阅弹窗" className="paywall-close" onClick={onClose}>
            <Icon name="close" size={18} />
          </AppButton>
        </header>

        <p className="paywall-desc">{reasonDesc[reason]}</p>

        {/* 核心权益对比清单 (Free vs Pro) */}
        <section className="paywall-benefits">
          <div className="benefit-row">
            <span className="benefit-icon">
              <Icon name="globe" size={17} />
            </span>
            <div className="benefit-copy">
              <strong>不限时实时对话同传</strong>
              <small>支持 20+ 语种端侧神经同传，0 延迟双耳自然播报</small>
            </div>
            <em className="benefit-pro-tag">Pro 无限次</em>
          </div>

          <div className="benefit-row">
            <span className="benefit-icon">
              <Icon name="calendar" size={17} />
            </span>
            <div className="benefit-copy">
              <strong>双语会议纪要与智能待办</strong>
              <small>长程持续收音、多发言人自动标注与行动待办提取</small>
            </div>
            <em className="benefit-pro-tag">Pro 专属</em>
          </div>

          <div className="benefit-row">
            <span className="benefit-icon">
              <Icon name="plane" size={17} />
            </span>
            <div className="benefit-copy">
              <strong>全量多国离线语言包</strong>
              <small>出境无网环境下，手机与耳机直接离线极速识别翻译</small>
            </div>
            <em className="benefit-pro-tag">无限下载</em>
          </div>

          <div className="benefit-row">
            <span className="benefit-icon">
              <Icon name="phone" size={17} />
            </span>
            <div className="benefit-copy">
              <strong>跨国通话与观影双向转译</strong>
              <small>国际电话、公开课与直播双向全双工同传通道</small>
            </div>
            <em className="benefit-pro-tag">Pro 独家</em>
          </div>
        </section>

        {/* 方案选择：年付（带7天试用）vs 月付 */}
        <section className="paywall-plans">
          <AppButton
            className={`paywall-plan-card ${selectedPlan === "yearly" ? "active" : ""}`}
            onClick={() => setSelectedPlan("yearly")}
          >
            <div className="plan-badge">最划算 · 7 天免费试用</div>
            <div className="plan-header">
              <div className="plan-radio">{selectedPlan === "yearly" ? <i /> : null}</div>
              <div className="plan-name-box">
                <strong>年付方案 (Annual Plan)</strong>
                <small>折合 {yearlyMonthlyBreakdown}/月 · 比月付省 {saving}%</small>
              </div>
            </div>
            <div className="plan-cost">
              <b>{formatMoney(yearlyCost, region)}</b>
              <small>/ 年</small>
            </div>
          </AppButton>

          <AppButton
            className={`paywall-plan-card ${selectedPlan === "monthly" ? "active" : ""}`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <div className="plan-header">
              <div className="plan-radio">{selectedPlan === "monthly" ? <i /> : null}</div>
              <div className="plan-name-box">
                <strong>月付方案 (Monthly Plan)</strong>
                <small>无合约约束 · 随时可取消自动续费</small>
              </div>
            </div>
            <div className="plan-cost">
              <b>{formatMoney(monthlyCost, region)}</b>
              <small>/ 月</small>
            </div>
          </AppButton>
        </section>

        {/* 欧美主流极速支付方式选择 */}
        <section className="paywall-methods">
          <span className="paywall-methods-title">支持的欧美与全球主流支付方式：</span>
          <div className="method-chips">
            <AppButton
              className={`method-chip ${selectedMethod === "apple" ? "active" : ""}`}
              onClick={() => setSelectedMethod("apple")}
              title="Apple Pay (Face ID 确认)"
            >
              <PaymentBrandLogo brand="apple" size={18} />
              <span>Apple Pay</span>
            </AppButton>

            <AppButton
              className={`method-chip ${selectedMethod === "google" ? "active" : ""}`}
              onClick={() => setSelectedMethod("google")}
              title="Google Pay 极速付款"
            >
              <PaymentBrandLogo brand="google" size={18} />
              <span>Google Pay</span>
            </AppButton>

            <AppButton
              className={`method-chip ${selectedMethod === "card" ? "active" : ""}`}
              onClick={() => setSelectedMethod("card")}
              title="Visa / Mastercard / Amex (Stripe 3-D Secure)"
            >
              <PaymentBrandLogo brand="card" size={18} />
              <span>信用卡 / 借记卡</span>
            </AppButton>

            <AppButton
              className={`method-chip ${selectedMethod === "paypal" ? "active" : ""}`}
              onClick={() => setSelectedMethod("paypal")}
              title="PayPal (全球买家保护)"
            >
              <PaymentBrandLogo brand="paypal" size={18} />
              <span>PayPal</span>
            </AppButton>

            <AppButton
              className={`method-chip ${selectedMethod === "sepa" ? "active" : ""}`}
              onClick={() => setSelectedMethod("sepa")}
              title="SEPA 欧洲统一借记"
            >
              <PaymentBrandLogo brand="sepa" size={18} />
              <span>SEPA 借记</span>
            </AppButton>
          </div>
        </section>

        {/* 结算主 CTA */}
        <div className="paywall-cta-group">
          <AppButton
            className="manage-button paywall-cta-btn"
            disabled={subscribing}
            onClick={handleQuickSubscribe}
          >
            {subscribing ? (
              <span>正在开通...</span>
            ) : selectedPlan === "yearly" ? (
              <span>开始 7 天免费试用（之后 {formatMoney(yearlyCost, region)}/年）</span>
            ) : (
              <span>以 {formatMoney(monthlyCost, region)}/月 立即开通</span>
            )}
          </AppButton>

          {/* 绑定耳机一键激活赠送权益 */}
          <AppButton
            className="paywall-gift-btn"
            onClick={handleActivateDeviceGift}
          >
            <Icon name="headphones" size={16} />
            <span>拥有 LingoPods 耳机？一键激活附赠的 1 年 Pro 会员</span>
          </AppButton>

          {/* 详细计费、汇率与账单州税费定制 */}
          <AppButton
            className="text-button paywall-full-link"
            onClick={() => setCheckoutFull(true)}
          >
            <Icon name="settings" size={14} />
            <span>查看完整税务细则、发票与多地区定价</span>
          </AppButton>
        </div>

        {/* 欧美合规声明与法律条款 */}
        <footer className="paywall-legal">
          <small className="compliance-note">
            试用期内可随时在应用商店或设置中一键取消，不收取任何费用。到期前 7 天将发送续费邮件或系统推送提醒。
          </small>
          <div className="paywall-legal-links">
            <AppButton onClick={() => setLegalDoc("terms")}>服务条款 (Terms)</AppButton>
            <i>·</i>
            <AppButton onClick={() => setLegalDoc("privacy")}>隐私政策 (Privacy)</AppButton>
            <i>·</i>
            <AppButton onClick={() => {
              toast("已检查购买记录：暂无未同步的历史订单")
            }}>
              恢复购买 (Restore)
            </AppButton>
          </div>
        </footer>
      </div>

      {checkoutFull && (
        <PaymentCheckout planId={selectedPlan} onClose={() => setCheckoutFull(false)} />
      )}

      {legalDoc && (
        <LegalDocument doc={legalDoc} onClose={() => setLegalDoc(null)} />
      )}
    </div>
  )
}
