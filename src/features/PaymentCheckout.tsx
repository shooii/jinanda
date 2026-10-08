import { useEffect, useMemo, useRef, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { useEscapeKey } from "@/lib/core"
import {
  availableChannels,
  basePlan,
  channelById,
  channels,
  detectPlatform,
  detectRegionId,
  firstChannel,
  formatMoney,
  localPrice,
  paySteps,
  platformLabel,
  platforms,
  priceQuote,
  regionById,
  regions,
  renewDateLabel,
  yearlySaving,
} from "@/lib/payments"
import type { ChannelId, PlatformId, PlanId } from "@/lib/payments"
import {
  makeOrderId,
  nowLabel,
  useOrders,
  usePlan,
} from "@/lib/store"
import type { Order } from "@/lib/store"
import { SubscriptionManage } from "@/features/SubscriptionManage"



const detected = detectPlatform()

export function PaymentCheckout({
  planId: initialPlan = "yearly",
  onClose,
}: {
  planId?: PlanId
  onClose: () => void
}) {
  const [plan, setPlan] = usePlan()
  const [, setOrders] = useOrders()

  const [regionId, setRegionId] = useState(detectRegionId)
  const [stateId, setStateId] = useState("CA")
  const [planId, setPlanId] = useState<PlanId>(initialPlan)
  const [tab, setTab] = useState<PlatformId>(detected)
  const [channelId, setChannelId] = useState<ChannelId>(() =>
    firstChannel(regionById(detectRegionId()), detected),
  )
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form")
  const [step, setStep] = useState(0)
  const [order, setOrder] = useState<Order | null>(null)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [managing, setManaging] = useState(false)
  const finished = useRef(false)

  useEscapeKey(() => {
    if (phase === "processing") return
    onClose()
  })

  const region = useMemo(() => regionById(regionId), [regionId])
  const channel = useMemo(() => channelById(channelId) ?? channels[0], [channelId])
  const quote = useMemo(() => priceQuote(planId, region, stateId), [planId, region, stateId])
  const steps = useMemo(() => paySteps(channel.platform), [channel.platform])
  const list = useMemo(() => availableChannels(region, tab), [region, tab])

  const pickRegion = (id: string) => {
    const next = regionById(id)
    setRegionId(id)
    if (!availableChannels(next, tab).some((item) => item.id === channelId)) {
      setChannelId(firstChannel(next, tab))
    }
    if (next.states && !next.states.some((item) => item.id === stateId)) {
      setStateId(next.states[0].id)
    }
  }

  const pickTab = (id: PlatformId) => {
    setTab(id)
    const next = availableChannels(region, id)
    if (!next.some((item) => item.id === channelId) && next.length > 0) {
      setChannelId(next[0].id)
    }
  }

  const completePurchase = () => {
    const id = makeOrderId()
    const time = nowLabel()
    const entry: Order = {
      id,
      planName: `Lingo+ ${basePlan(planId).name}`,
      channelId: channel.id,
      channelName: channel.name,
      regionId: region.id,
      regionName: region.name,
      currency: region.currency,
      gross: formatMoney(quote.gross, region),
      tax: formatMoney(quote.tax, region),
      total: formatMoney(quote.total, region),
      taxLabel: quote.label,
      time,
      status: "已付款",
    }
    setOrders((items) => [entry, ...items])
    setPlan({
      ...plan,
      source: "standalone",
      name: `Lingo+ ${basePlan(planId).name}`,
      autoRenew: true,
      renewDate: renewDateLabel(planId),
      price: formatMoney(quote.total, region),
      channel: channel.id,
      regionId: region.id,
      currency: region.currency,
      period: planId,
      orderId: id,
      purchasedAt: time,
    })
    setOrder(entry)
    setPhase("done")
  }

  useEffect(() => {
    if (phase !== "processing") return
    if (finished.current) return
    if (step < steps.length) {
      const timer = window.setTimeout(() => setStep((value) => value + 1), 720)
      return () => window.clearTimeout(timer)
    }
    finished.current = true
    completePurchase()
  }, [phase, step, steps.length])

  const startPayment = () => {
    finished.current = false
    setStep(0)
    setPhase("processing")
  }

  if (phase === "done" && order) {
    return (
      <div className="profile-panel-backdrop" onClick={onClose} role="presentation">
        <div
          className="profile-panel"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="支付完成"
        >
          <div className="sheet-handle" />
          <header>
            <div>
              <span className="eyebrow">支付完成</span>
              <h2>Lingo+ 已开通</h2>
            </div>
            <AppButton ariaLabel="关闭支付结果" onClick={onClose}>
              <Icon name="close" />
            </AppButton>
          </header>

          <div className="subscribe-done">
            <span className="subscribe-done-icon">
              <Icon name="check" size={30} />
            </span>
            <p>
              已通过 <b>{order.channelName}</b> 完成支付，权益立即生效；下次扣费日期为{" "}
              <b>{plan.renewDate}</b>。
            </p>
          </div>

          <div className="kv-list">
            <div className="kv-row">
              <small>订单号</small>
              <strong>{order.id}</strong>
            </div>
            <div className="kv-row">
              <small>方案</small>
              <strong>{order.planName}</strong>
            </div>
            <div className="kv-row">
              <small>实付金额</small>
              <strong>{order.total}</strong>
            </div>
            <div className="kv-row">
              <small>计费地区</small>
              <strong>
                {order.regionName} · {order.currency}
              </strong>
            </div>
            <div className="kv-row">
              <small>{order.taxLabel}</small>
              <strong>{order.tax}</strong>
            </div>
            <div className="kv-row">
              <small>支付渠道</small>
              <strong>{order.channelName}</strong>
            </div>
          </div>

          <p className="support-note">
            <Icon name="shield" size={14} />
            收据已由 {channel.vendor} 签发并完成服务端校验，可在“支付与账单”中下载发票。
          </p>

          <AppButton className="manage-button" onClick={() => setManaging(true)}>
            管理订阅与退款
          </AppButton>
          <AppButton className="pay-ghost" onClick={onClose}>
            开始使用 Lingo+
          </AppButton>
        </div>

        {managing && (
          <SubscriptionManage onClose={() => setManaging(false)} />
        )}
      </div>
    )
  }

  if (phase === "processing") {
    return (
      <div className="profile-panel-backdrop" role="presentation">
        <div
          className="profile-panel"
          role="dialog"
          aria-modal="true"
          aria-label="正在处理支付"
        >
          <div className="sheet-handle" />
          <header>
            <div>
              <span className="eyebrow">正在处理</span>
              <h2>{channel.name}</h2>
            </div>
          </header>
          <div className="pay-processing">
            <span className="pay-processing-icon">
              <Icon name="wallet" size={28} />
            </span>
            <div className="pay-steps">
              {steps.map((label, index) => (
                <div
                  className={
                    index < step ? "pay-step done" : index === step ? "pay-step active" : "pay-step"
                  }
                  key={label}
                >
                  <i>
                    {index < step ? <Icon name="check" size={12} /> : index + 1}
                  </i>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="pay-processing-note">
              正在等待 {channel.vendor} 返回结果，请勿关闭页面。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const saving = yearlySaving(region)

  return (
    <div className="profile-panel-backdrop" onClick={onClose} role="presentation">
      <div
        className="profile-panel pay-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="选择支付方式"
      >
        <div className="sheet-handle" />
        <header>
          <div>
            <span className="eyebrow">全球支付</span>
            <h2>选择支付方式</h2>
          </div>
          <AppButton ariaLabel="关闭支付页" onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>

        <p className="sheet-intro">
          我们按你所在地区自动换算币种与税费，订阅由对应平台代扣，可随时取消。
        </p>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>计费地区与币种</strong>
            <AppButton className="pay-link" onClick={() => setPricingOpen(true)}>
              查看全部地区定价
            </AppButton>
          </div>
          <div className="chip-row pay-region-row">
            {regions.map((item) => (
              <AppButton
                className={item.id === regionId ? "active" : ""}
                key={item.id}
                onClick={() => pickRegion(item.id)}
              >
                {item.name} · {item.currency}
              </AppButton>
            ))}
          </div>
          {region.states ? (
            <div className="pay-state-row">
              <small>账单州（决定销售税）</small>
              <div className="chip-row">
                {region.states.map((item) => (
                  <AppButton
                    className={item.id === stateId ? "active" : ""}
                    key={item.id}
                    onClick={() => setStateId(item.id)}
                  >
                    {item.name} {(item.rate * 100).toFixed(2)}%
                  </AppButton>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>订阅方案</strong>
            <small>{region.priceInclusive ? "标价含税" : "标价不含税"}</small>
          </div>
          <div className="plan-options">
            {(["monthly", "yearly"] as PlanId[]).map((id) => {
              const item = basePlan(id)
              const price = formatMoney(localPrice(id, region), region)
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
                        ? `折合 ${formatMoney(localPrice("yearly", region) / 12, region)}/月 · 比月付省 ${saving}%`
                        : "随时取消 · 赠送期结束后生效"}
                    </small>
                  </span>
                  <span className="plan-price">
                    <b>{price}</b>
                    <small>/ {item.period}</small>
                  </span>
                </AppButton>
              )
            })}
          </div>
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>支付渠道</strong>
            <small>检测到当前设备：{platformLabel(detected)}</small>
          </div>
          <div className="pay-tabs">
            {platforms.map((item) => (
              <AppButton
                className={tab === item.id ? "pay-tab active" : "pay-tab"}
                key={item.id}
                onClick={() => pickTab(item.id)}
              >
                <b>{item.label}</b>
                <small>{item.hint}</small>
              </AppButton>
            ))}
          </div>

          {list.length === 0 ? (
            <p className="empty-tip">
              {region.name}暂不支持该平台渠道，请选择其他支付方式。
            </p>
          ) : (
            <div className="pay-channel-list">
              {list.map((item) => (
                <AppButton
                  className={channelId === item.id ? "pay-channel active" : "pay-channel"}
                  key={item.id}
                  onClick={() => setChannelId(item.id)}
                >
                  <span className="pay-monogram" data-brand={item.id}>
                    {item.monogram}
                  </span>
                  <span className="pay-channel-copy">
                    <strong>{item.name}</strong>
                    <small>
                      {item.vendor} · {item.coverage}
                    </small>
                  </span>
                  <span className="plan-radio">{channelId === item.id ? <i /> : null}</span>
                </AppButton>
              ))}
            </div>
          )}

          {list.length > 0 ? (
            <div className="pay-methods">
              {channel.methods.map((item) => (
                <em key={item}>{item}</em>
              ))}
            </div>
          ) : null}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>费用明细</strong>
            <small>{channel.fee}</small>
          </div>
          <div className="kv-list">
            <div className="kv-row">
              <small>方案</small>
              <strong>
                {basePlan(planId).name} · 每{basePlan(planId).period}
              </strong>
            </div>
            <div className="kv-row">
              <small>小计</small>
              <strong>{formatMoney(quote.gross, region)}</strong>
            </div>
            <div className="kv-row">
              <small>{quote.label}</small>
              <strong>
                {quote.inclusive
                  ? `已含 ${formatMoney(quote.tax, region)}`
                  : formatMoney(quote.tax, region)}
              </strong>
            </div>
            <div className="kv-row pay-total-row">
              <small>实付</small>
              <strong>{formatMoney(quote.total, region)}</strong>
            </div>
          </div>
          <p className="pay-tax-note">
            <Icon name="shield" size={14} />
            {quote.note}
          </p>
          <p className="pay-tax-note">
            <Icon name="check" size={14} />
            {channel.verify}
          </p>
        </section>

        <AppButton className="manage-button" onClick={startPayment}>
          以 {formatMoney(quote.total, region)} 订阅
        </AppButton>
        <small className="renewal-note">
          订阅由 {channel.name} 代扣 · 到期前 7 天提醒 · 可随时取消
        </small>
      </div>

      {pricingOpen && (
        <InfoSheet
          eyebrow="多币种定价"
          icon="globe"
          onClose={() => setPricingOpen(false)}
          title="全球定价对照"
        >
          <p className="sheet-intro">
            以美元基准价按汇率与当地购买力自动换算，并按当地习惯取整。
          </p>
          <div className="kv-list">
            {regions.map((item) => (
              <div className="kv-row" key={item.id}>
                <small>
                  {item.name} · {item.currency}
                </small>
                <strong>
                  {formatMoney(localPrice("monthly", item), item)} / 月 ·{" "}
                  {formatMoney(localPrice("yearly", item), item)} / 年
                </strong>
              </div>
            ))}
          </div>
          <AppButton
            className="manage-button"
            onClick={() => setPricingOpen(false)}
          >
            知道了
          </AppButton>
        </InfoSheet>
      )}
    </div>
  )
}

export default PaymentCheckout
