import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { channelById, detectRegionId, regionById } from "@/lib/payments"
import {
  copyText,
  downloadText,
  invoiceToText,
  useOrders,
  usePlan,
} from "@/lib/store"
import { PaymentCheckout } from "@/features/PaymentCheckout"



export function SubscriptionManage({ onClose }: { onClose: () => void }) {
  const [plan, setPlan] = usePlan()
  const [orders] = useOrders()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  useEscapeKey(onClose)

  const channel = channelById(plan.channel)
  const region = regionById(plan.regionId || detectRegionId())
  const isWeb = channel?.platform === "web"

  const copyLink = async (url: string) => {
    const ok = await copyText(url)
    setCopied(ok)
    toast(ok ? "退款入口链接已复制" : "复制失败，请手动记录链接")
  }

  return (
    <div className="profile-panel-backdrop" onClick={onClose} role="presentation">
      <div
        className="profile-panel pay-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="支付与账单"
      >
        <div className="sheet-handle" />
        <header>
          <div>
            <span className="eyebrow">支付与账单</span>
            <h2>订阅管理与退款</h2>
          </div>
          <AppButton ariaLabel="关闭支付与账单" onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>

        <section className="pay-current">
          <span className="pay-current-icon">
            <Icon name="wallet" size={24} />
          </span>
          <div>
            <strong>{plan.name}</strong>
            <small>
              {channel ? channel.name : "设备赠送权益"} · {region.name} · {region.currency}
            </small>
          </div>
          <b>
            {plan.price}
            <small>/ {plan.period === "yearly" ? "年" : "月"}</small>
          </b>
        </section>

        <div className="kv-list">
          <div className="kv-row">
            <small>订阅状态</small>
            <strong>{plan.source === "device" ? "设备赠送 · 使用中" : "已订阅 · 使用中"}</strong>
          </div>
          <div className="kv-row">
            <small>支付渠道</small>
            <strong>{channel ? channel.vendor : "未通过应用商店订阅"}</strong>
          </div>
          <div className="kv-row">
            <small>下次扣费</small>
            <strong>
              {plan.autoRenew ? plan.renewDate : "已关闭自动续费"}
            </strong>
          </div>
          <div className="kv-row">
            <small>最近订单号</small>
            <strong>{plan.orderId ?? "—"}</strong>
          </div>
        </div>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>管理订阅</strong>
            <small>{channel ? channel.vendor : "通用路径"}</small>
          </div>
          <div className="manage-steps">
            {(channel?.manage ?? [
              "在 App 内「我的 → Lingo+ 会员」进入订阅管理",
              "选择要调整的方案或关闭自动续费",
              "设备赠送权益无需扣费，到期后可按当时价格续订",
            ]).map((text, index) => (
              <div className="manage-step" key={text}>
                <i>{index + 1}</i>
                <span>{text}</span>
              </div>
            ))}
          </div>
          {channel ? (
            <div className="pay-actions">
              <AppButton
                onClick={() => {
                  copyLink(channel.refund.url)
                }}
              >
                <Icon name="receipt" size={16} />
                <span>复制管理入口链接</span>
              </AppButton>
            </div>
          ) : null}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>更换支付方式</strong>
            <small>{isWeb ? "支持网页端自助更换" : "需通过应用商店调整"}</small>
          </div>
          {isWeb ? (
            <>
              <p className="pay-hint">
                网页端订阅可随时更换卡片、PayPal 账户或账单地址，变更后从下一个计费周期生效。
              </p>
              <AppButton className="pay-outline" onClick={() => setCheckoutOpen(true)}>
                <Icon name="card" size={16} />
                <span>重新选择支付方式</span>
              </AppButton>
            </>
          ) : (
            <p className="pay-hint">
              {channel
                ? `${channel.name} 的付款方式由 ${channel.vendor} 统一管理，App 内无法直接更换卡片；请按上方「管理订阅」步骤在商店中调整，或取消后改用网页端订阅。`
                : "当前未通过应用商店订阅，可在订阅页选择任意渠道完成支付。"}
            </p>
          )}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>退款指引</strong>
            <small>{channel ? channel.refund.window : "赠送权益不涉及扣费"}</small>
          </div>
          {channel ? (
            <>
              <div className="manage-steps">
                {channel.refund.steps.map((text, index) => (
                  <div className="manage-step" key={text}>
                    <i>{index + 1}</i>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="pay-actions">
                <AppButton onClick={() => copyLink(channel.refund.url)}>
                  <Icon name="check" size={16} />
                  <span>{copied ? "链接已复制" : "复制退款入口"}</span>
                </AppButton>
                <AppButton
                  onClick={() => {
                    const fallback = `请前往 ${channel.vendor}：${channel.refund.url}`
                    try {
                      window.open(channel.refund.url, "_blank", "noopener")
                      toast(`已打开 ${channel.vendor} 退款页面`)
                    } catch {
                      void copyLink(channel.refund.url)
                      toast(fallback)
                    }
                  }}
                >
                  <Icon name="globe" size={16} />
                  <span>打开退款页面</span>
                </AppButton>
              </div>
              <p className="pay-tax-note">
                <Icon name="shield" size={14} />
                所有渠道的退款均退回原支付方式；跨币种退款按退款当日汇率折算，手续费以银行或平台规则为准。
              </p>
            </>
          ) : (
            <p className="pay-hint">
              当前为设备赠送权益，未产生扣费；如赠送期结束后自动续费产生扣款，可在扣款后 48
              小时内通过对应商店申请退款。
            </p>
          )}
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>账单与发票</strong>
            <small>共 {orders.length} 条</small>
          </div>
          {orders.length === 0 ? (
            <p className="empty-tip">暂无账单记录，完成订阅后可在此下载发票。</p>
          ) : (
            <div className="invoice-list">
              {orders.map((item) => (
                <div className="invoice-row" key={item.id}>
                  <span>
                    <strong>{item.planName}</strong>
                    <small>
                      {item.id} · {item.channelName} · {item.time}
                    </small>
                  </span>
                  <b>{item.total}</b>
                  <AppButton
                    onClick={() =>
                      downloadText(`${item.id}_发票.txt`, invoiceToText(item))
                    }
                  >
                    <Icon name="receipt" size={15} />
                    <span>发票</span>
                  </AppButton>
                </div>
              ))}
            </div>
          )}
          {orders.length > 0 ? (
            <p className="pay-tax-note">
              <Icon name="check" size={14} />
              发票含税号与税额拆分，可用于报销；增值税专用发票请联系在线支持开具。
            </p>
          ) : null}
        </section>

        {cancelConfirm ? (
          <div className="confirm-box" role="alertdialog" aria-label="确认关闭自动续费">
            <strong>关闭自动续费？</strong>
            <small>
              {channel
                ? `将通过 ${channel.name} 关闭续订，当前周期结束前权益不受影响。`
                : "赠送期内权益不受影响，到期后不再扣费。"}
            </small>
            <div className="confirm-actions">
              <AppButton onClick={() => setCancelConfirm(false)}>保留续费</AppButton>
              <AppButton
                className="confirm-primary"
                onClick={() => {
                  setPlan({ ...plan, autoRenew: false })
                  setCancelConfirm(false)
                  toast("已关闭自动续费")
                }}
              >
                确认关闭
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="pay-actions">
            <AppButton onClick={() => setCancelConfirm(true)}>
              {plan.autoRenew ? "关闭自动续费" : "已关闭自动续费"}
            </AppButton>
          </div>
        )}

        <AppButton className="manage-button" onClick={onClose}>
          完成
        </AppButton>
      </div>

      {checkoutOpen && (
        <PaymentCheckout planId={plan.period} onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  )
}

export default SubscriptionManage
