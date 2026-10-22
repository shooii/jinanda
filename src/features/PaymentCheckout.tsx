import { useMemo, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { basePlan, detectRegionId, formatMoney, priceQuoteOf, regionById, regions } from "@/lib/payments"
import type { PlanId } from "@/lib/payments"
import { tierPrice, tiers, tierYearlySaving } from "@/lib/monetization"
import type { Tier } from "@/lib/monetization"

export function PaymentCheckout({
  planId: initialPlan = "yearly",
  tier = "plus",
  onClose,
}: {
  planId?: PlanId
  tier?: Tier
  onClose: () => void
}) {
  const [regionId, setRegionId] = useState(detectRegionId)
  const [stateId, setStateId] = useState("CA")
  const [planId, setPlanId] = useState<PlanId>(initialPlan)
  useEscapeKey(onClose)

  const region = useMemo(() => regionById(regionId), [regionId])
  const quote = useMemo(
    () => priceQuoteOf(tierPrice(tier, planId, region), region, stateId),
    [tier, planId, region, stateId],
  )
  const saving = tierYearlySaving(tier)

  return (
    <div className="profile-panel-backdrop" onClick={onClose} role="presentation">
      <div
        className="profile-panel pay-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="订阅方案预览"
      >
        <div className="sheet-handle" />
        <header>
          <div>
            <span className="eyebrow">方案预览</span>
            <h2>选择 Lingo+ 方案</h2>
          </div>
          <AppButton ariaLabel="关闭订阅页" onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>

        <p className="sheet-intro">
          订阅尚未开放购买。以下价格为本地演示估算，不是正式报价；不会扣款或更改账户权益。
        </p>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>地区预览</strong>
            <small>正式计费地区将由结账服务确认</small>
          </div>
          <div className="chip-row pay-region-row">
            {regions.map((item) => (
              <AppButton
                className={item.id === regionId ? "active" : ""}
                key={item.id}
                onClick={() => {
                  setRegionId(item.id)
                  if (item.states && !item.states.some((state) => state.id === stateId)) {
                    setStateId(item.states[0].id)
                  }
                }}
              >
                {item.name} · {item.currency}
              </AppButton>
            ))}
          </div>
          {region.states ? (
            <label className="pay-state-row">
              <small>州税预览</small>
              <select value={stateId} onChange={(event) => setStateId(event.target.value)}>
                {region.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>Lingo+ {tiers[tier].name}</strong>
            <small>演示价格</small>
          </div>
          <div className="plan-options">
            {(["monthly", "yearly"] as PlanId[]).map((id) => {
              const item = basePlan(id)
              const price = tierPrice(tier, id, region)
              return (
                <AppButton
                  className={planId === id ? "plan-option active" : "plan-option"}
                  key={id}
                  onClick={() => setPlanId(id)}
                >
                  <span className="plan-radio">{planId === id ? <i /> : null}</span>
                  <span className="plan-copy">
                    <strong>{item.name}</strong>
                    <small>
                      {id === "yearly"
                        ? `折合 ${formatMoney(price / 12, region)}/月 · 预计节省 ${saving}%`
                        : "按月计费"}
                    </small>
                  </span>
                  <span className="plan-price">
                    <b>{formatMoney(price, region)}</b>
                    <small>/ {item.period}</small>
                  </span>
                </AppButton>
              )
            })}
          </div>
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>金额估算</strong>
            <small>{quote.inclusive ? "演示标价含税" : "演示标价未含税"}</small>
          </div>
          <div className="kv-list">
            <div className="kv-row">
              <small>演示金额</small>
              <strong>{formatMoney(quote.gross, region)}</strong>
            </div>
            <div className="kv-row">
              <small>{quote.label}</small>
              <strong>{formatMoney(quote.tax, region)}</strong>
            </div>
            <div className="kv-row pay-total-row">
              <small>估算合计</small>
              <strong>{formatMoney(quote.total, region)}</strong>
            </div>
          </div>
          <p className="pay-tax-note">
            <Icon name="shield" size={14} />
            {quote.note}
          </p>
        </section>

        <AppButton className="manage-button" disabled aria-disabled="true">
          支付渠道尚未接入
        </AppButton>
        <small className="renewal-note">
          正式开放前将确认商店/支付渠道、含税总价、自动续费条件及取消方式。
        </small>
      </div>
    </div>
  )
}

export default PaymentCheckout
