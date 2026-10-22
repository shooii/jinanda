import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { useEscapeKey } from "@/lib/core"
import { detectRegionId, formatMoney, regionById } from "@/lib/payments"
import { meters, tierPrice, tiers } from "@/lib/monetization"
import type { Cycle, Tier } from "@/lib/monetization"
import { LegalDocument } from "@/features/LegalDocument"
import type { LegalDocId } from "@/features/LegalDocument"

export type PaywallReason =
  | "quota_exceeded"
  | "meeting_limit"
  | "call_exclusive"
  | "watch_exclusive"
  | "offline_limit"
  | "coach_advanced"
  | "trial_ending"
  | "manual"

const reasonDesc: Record<PaywallReason, string> = {
  quota_exceeded: "你从额度提示进入此页。此处只展示方案规划，不代表服务器已确认额度，也不会通过本地升级重置用量。",
  meeting_limit: "会议相关能力与额度仍需服务接入和验收，以下是规划对比，不代表购买后即可使用。",
  call_exclusive: "通话同传仍需服务接入和验收，以下方案不代表已提供可用的实时通话能力。",
  watch_exclusive: "观影与直播同传属于规划能力，尚待服务接入与验收。",
  offline_limit: "离线语言包数量为方案规划，不代表已有可下载资源或可购买的永久授权。",
  coach_advanced: "高级发音评分与纠正属于规划能力，尚待服务接入与验收。",
  trial_ending: "此入口不用于确认试用状态。试用尚未接入，当前不会开启试用、发送到期提醒或转为自动扣款。",
  manual: "以下为 Plus 与 Pro 的方案规划和价格估算，仅供预览，不是可购买商品或权益承诺。",
}

export function UpgradePaywallModal({
  reason = "manual",
  onClose,
}: {
  reason?: PaywallReason
  onClose: () => void
}) {
  const [tier, setTier] = useState<Tier>(reason === "watch_exclusive" ? "pro" : "plus")
  const [cycle, setCycle] = useState<Cycle>("yearly")
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null)
  const [restoring, setRestoring] = useState(false)
  const region = regionById(detectRegionId())

  useEscapeKey(() => {
    if (!legalDoc && !restoring) onClose()
  })

  const paidCards: Tier[] = ["plus", "pro"]

  return (
    <>
      <div className="profile-panel-backdrop paywall-backdrop" onClick={onClose} role="presentation">
        <div
          className="profile-panel paywall-sheet"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="会员方案预览"
        >
          <div className="sheet-handle" />
          <header className="paywall-header">
            <div className="paywall-title-box">
              <span className="paywall-eyebrow">
                <Icon name="sparkles" size={14} />
                <span>LINGO+ 方案规划</span>
              </span>
              <h2>会员方案预览</h2>
            </div>
            <AppButton ariaLabel="关闭方案预览" className="paywall-close" onClick={onClose}>
              <Icon name="close" size={18} />
            </AppButton>
          </header>

          <p className="paywall-desc">{reasonDesc[reason]}</p>
          <section className="paywall-trial">
            <div className="trial-head">
              <Icon name="wallet" size={16} />
              <strong>购买与试用尚未接入，当前不可扣款</strong>
            </div>
            <p className="trial-note">
              选择档位或周期仅切换预览，不会下单、开通试用或变更权益。支付渠道、订阅管理、
              到期通知与自动扣款均未形成可用购买流程。
            </p>
          </section>

          <section className="paywall-cycle" aria-label="估算价格周期">
            <AppButton
              className={`cycle-chip ${cycle === "yearly" ? "active" : ""}`}
              ariaPressed={cycle === "yearly"}
              onClick={() => setCycle("yearly")}
            >
              年度估算
            </AppButton>
            <AppButton
              className={`cycle-chip ${cycle === "monthly" ? "active" : ""}`}
              ariaPressed={cycle === "monthly"}
              onClick={() => setCycle("monthly")}
            >
              月度估算
            </AppButton>
          </section>

          <section className="paywall-plans" aria-label="规划档位">
            {paidCards.map((id) => {
              const spec = tiers[id]
              const amount = tierPrice(id, cycle, region)
              return (
                <AppButton
                  className={`paywall-plan-card ${tier === id ? "active" : ""}`}
                  ariaPressed={tier === id}
                  key={id}
                  onClick={() => setTier(id)}
                >
                  <div className="plan-header">
                    <div className="plan-radio">{tier === id ? <i /> : null}</div>
                    <div className="plan-name-box">
                      <strong>Lingo+ {spec.name}</strong>
                      <small>规划方案 · 待验收</small>
                    </div>
                  </div>
                  <div className="plan-cost">
                    <b>{formatMoney(amount, region)}</b>
                    <small>{cycle === "yearly" ? "/ 年（估算）" : "/ 月（估算）"}</small>
                  </div>
                  <small className="plan-sub">非成交价，不可下单</small>
                </AppButton>
              )
            })}
          </section>
          <p className="compliance-note">
            当前按 {region.name}（{region.currency}）展示本地换算估算，未经商户或应用商店报价确认；
            税费、币种、最终价格及适用地区均待真实渠道接入后确认。
          </p>

          <section className="paywall-allowance">
            <strong className="allowance-title">Lingo+ {tiers[tier].name} 规划能力 · 待验收</strong>
            <div className="allowance-grid">
              {meters.map((meter) => {
                const allowance = tiers[tier].allowance[meter.id]
                const label = allowance.kind === "unlimited"
                  ? "规划不限量"
                  : allowance.kind === "blocked"
                    ? "规划不包含"
                    : `${allowance.amount} ${meter.unit}${allowance.kind === "monthly" ? " / 月" : allowance.kind === "daily" ? " / 日" : " / 场"}（规划）`
                return (
                  <div key={meter.id}>
                    <small>{meter.label}</small>
                    <b>{label}</b>
                  </div>
                )
              })}
              <div>
                <small>离线语言包</small>
                <b>{tiers[tier].offlinePacks === "all" ? "规划全量" : `${tiers[tier].offlinePacks} 个（规划）`}</b>
              </div>
            </div>
            <p className="trial-note">以上均为商业规划，不代表能力已上线、服务已验收或服务器已授予对应额度。</p>
          </section>

          <div className="paywall-cta-group">
            <AppButton className="manage-button paywall-cta-btn" disabled>
              购买尚未接入 · 不可开通
            </AppButton>
            <AppButton className="text-button paywall-full-link" onClick={onClose}>
              返回继续使用当前功能
            </AppButton>
          </div>

          <footer className="paywall-legal">
            <small className="compliance-note">
              本页不支持试用、恢复购买或取消订阅，也不承诺到期提醒及自动续费。
              如已有真实订阅，请通过原购买渠道核实与管理。
            </small>
            <div className="paywall-legal-links">
              <AppButton onClick={() => setLegalDoc("terms")}>服务条款</AppButton>
              <i>·</i>
              <AppButton onClick={() => setLegalDoc("privacy")}>隐私政策</AppButton>
              <i>·</i>
              <AppButton onClick={() => setRestoring(true)}>恢复购买说明</AppButton>
            </div>
          </footer>
        </div>
      </div>

      {legalDoc ? <LegalDocument doc={legalDoc} onClose={() => setLegalDoc(null)} /> : null}
      {restoring ? (
        <InfoSheet eyebrow="恢复购买" icon="wallet" onClose={() => setRestoring(false)} title="渠道恢复尚未接入">
          <p className="sheet-intro">
            尚未集成应用商店或支付渠道的购买恢复，本页没有执行恢复或核对历史订单。
            查询服务器权益不等于恢复购买，不会在本地创建订单或授予会员。
          </p>
          <AppButton className="manage-button" onClick={() => setRestoring(false)}>知道了</AppButton>
        </InfoSheet>
      ) : null}
    </>
  )
}

export default UpgradePaywallModal
