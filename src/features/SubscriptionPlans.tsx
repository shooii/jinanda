import { useMemo, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import {
  basePlan,
  detectRegionId,
  formatMoney,
  localPrice,
  regionById,
  yearlySaving,
} from "@/lib/payments"
import type { PlanId } from "@/lib/payments"
import { usePlan } from "@/lib/store"
import { PaymentCheckout } from "@/features/PaymentCheckout"
import { SubscriptionManage } from "@/features/SubscriptionManage"
import { allLanguages } from "@/lib/translate"



export function SubscriptionPlans({ onClose }: { onClose: () => void }) {
  const [plan] = usePlan()
  const [selected, setSelected] = useState<PlanId>("yearly")
  const [checkout, setCheckout] = useState(false)
  const [managing, setManaging] = useState(false)

  useEscapeKey(onClose)

  const region = useMemo(() => regionById(detectRegionId()), [])
  const saving = yearlySaving(region)

  const priceOf = (id: PlanId) => formatMoney(localPrice(id, region), region)

  const plans = [
    {
      id: "monthly" as PlanId,
      name: basePlan("monthly").name,
      price: priceOf("monthly"),
      unit: "/ 月",
      detail: "随时取消 · 赠送期结束后生效",
      tag: "",
    },
    {
      id: "yearly" as PlanId,
      name: basePlan("yearly").name,
      price: priceOf("yearly"),
      unit: "/ 年",
      detail: `折合 ${formatMoney(localPrice("yearly", region) / 12, region)}/月 · 比月付省 ${saving}%`,
      tag: "最划算",
    },
  ]

  const current = plans.find((item) => item.id === selected) ?? plans[1]

  if (plan.source === "standalone") {
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
          aria-label="订阅完成"
        >
          <div className="sheet-handle" />
          <header>
            <div>
              <span className="eyebrow">订阅完成</span>
              <h2>Lingo+ 已激活</h2>
            </div>
            <AppButton ariaLabel="关闭订阅" onClick={onClose}>
              <Icon name="close" />
            </AppButton>
          </header>
          <div className="subscribe-done">
            <span className="subscribe-done-icon">
              <Icon name="check" size={30} />
            </span>
            <p>
              你的 {plan.name} 已生效，下一次扣费日期为 <b>{plan.renewDate}</b>。
            </p>
          </div>
          <div className="kv-list">
            <div className="kv-row">
              <small>当前方案</small>
              <strong>{plan.name}</strong>
            </div>
            <div className="kv-row">
              <small>价格</small>
              <strong>
                {plan.price}
                {plan.period === "yearly" ? " / 年" : " / 月"}
              </strong>
            </div>
            <div className="kv-row">
              <small>计费地区</small>
              <strong>
                {regionById(plan.regionId).name} · {plan.currency}
              </strong>
            </div>
            <div className="kv-row">
              <small>自动续费</small>
              <strong>{plan.autoRenew ? "已开启" : "已关闭"}</strong>
            </div>
          </div>
          <AppButton className="manage-button" onClick={() => setManaging(true)}>
            管理订阅与退款
          </AppButton>
          <AppButton className="pay-ghost" onClick={onClose}>
            开始使用
          </AppButton>
        </div>
        {managing && <SubscriptionManage onClose={() => setManaging(false)} />}
      </div>
    )
  }

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
          没有 LingoPods 也能使用翻译与会议功能，权益与设备赠送版一致。当前按
          <b> {region.name}</b> 定价（{region.currency}），结算页可切换地区与支付方式。
        </p>

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
              <strong>不限时实时翻译</strong>
              <small>支持 {allLanguages.length} 种语言与自然语音播报</small>
            </span>
          </div>
          <div>
            <Icon name="calendar" />
            <span>
              <strong>会议纪要与待办</strong>
              <small>会后自动生成可搜索摘要</small>
            </span>
          </div>
        </div>

        <AppButton className="manage-button" onClick={() => setCheckout(true)}>
          以 {current.price}
          {current.unit} 继续
        </AppButton>

        <small className="renewal-note">
          支持 Apple IAP / Google Play / 厂商商店 / 网页端支付 · 可随时取消续费
        </small>
      </div>

      {checkout && (
        <PaymentCheckout planId={selected} onClose={() => setCheckout(false)} />
      )}
    </div>
  )
}

export default SubscriptionPlans
