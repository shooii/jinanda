import { useMemo, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { detectRegionId, formatMoney, regionById } from "@/lib/payments"
import type { PlanId } from "@/lib/payments"
import { paidTiers, tiers, tierPrice, tierYearlySaving } from "@/lib/monetization"
import type { Tier } from "@/lib/monetization"
import { PaymentCheckout } from "@/features/PaymentCheckout"
import { allLanguages } from "@/lib/translate"



export function SubscriptionPlans({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<PlanId>("yearly")
  const [tier, setTier] = useState<Tier>("plus")
  const [checkout, setCheckout] = useState(false)

  useEscapeKey(onClose)

  const region = useMemo(() => regionById(detectRegionId()), [])
  const saving = tierYearlySaving(tier)

  const priceOf = (id: PlanId) => formatMoney(tierPrice(tier, id, region), region)

  const plans = [
    {
      id: "monthly" as PlanId,
      name: "月付方案",
      price: priceOf("monthly"),
      unit: "/ 月",
      detail: "规划周期 · 尚未提供购买与续费服务",
      tag: "",
    },
    {
      id: "yearly" as PlanId,
      name: "年付方案",
      price: priceOf("yearly"),
      unit: "/ 年",
      detail: `折合 ${formatMoney(tierPrice(tier, "yearly", region) / 12, region)}/月 · 比月付省 ${saving}%`,
      tag: "最划算",
    },
  ]

  const current = plans.find((item) => item.id === selected) ?? plans[1]

  return (
    <div
      className="profile-panel-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="单独订阅 Lingo+"
      >
        <div className="sheet-handle" />
        <header>
          <div>
            <span className="eyebrow">使用其他品牌耳机</span>
            <h2>单独订阅 Lingo+</h2>
          </div>
          <AppButton ariaLabel="关闭订阅方案" onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>

        <p className="sheet-intro">
          订阅尚未开放购买。以下为 <b>{region.name}</b>（{region.currency}）的演示方案与估算价格，不会扣款或开通付费权益。
        </p>

        <div className="chip-row">
          {paidTiers.map((id) => (
            <AppButton
              className={tier === id ? "active" : ""}
              key={id}
              onClick={() => setTier(id)}
            >
              Lingo+ {tiers[id].name}
            </AppButton>
          ))}
        </div>
        <small className="renewal-note">{tiers[tier].tagline}</small>

        <div className="plan-options">
          {plans.map((item) => (
            <AppButton
              className={selected === item.id ? "plan-option active" : "plan-option"}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <span className="plan-radio">
                {selected === item.id ? <i /> : null}
              </span>
              <span className="plan-copy">
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="plan-price">
                <b>{item.price}</b>
                <small>{item.unit}</small>
              </span>
              {item.tag ? <em className="plan-tag">{item.tag}</em> : null}
            </AppButton>
          ))}
        </div>

        <div className="benefit-list">
          <div>
            <Icon name="globe" />
            <span>
              <strong>规划权益：实时翻译</strong>
              <small>支持 {allLanguages.length} 种语言与自然语音播报</small>
            </span>
          </div>
          <div>
            <Icon name="calendar" />
            <span>
              <strong>会议纪要与待办</strong>
              <small>规划能力，需完成真实场景验收后开放收费</small>
            </span>
          </div>
        </div>

        <AppButton className="manage-button" onClick={() => setCheckout(true)}>
          预览 {current.price}{current.unit} 方案
        </AppButton>

        <small className="renewal-note">
          支付渠道尚未接入；正式价格、续费与取消条件将在开放前确认
        </small>
      </div>

      {checkout && (
        <PaymentCheckout planId={selected} tier={tier} onClose={() => setCheckout(false)} />
      )}
    </div>
  )
}

export default SubscriptionPlans
