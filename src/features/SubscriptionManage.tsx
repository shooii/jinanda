import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { useEntitlement } from "@/lib/services/entitlements"

export function SubscriptionManage({ onClose }: { onClose: () => void }) {
  const { entitlement, checking, error, serverConfigured, refresh } = useEntitlement()
  useEscapeKey(onClose)

  const statusLabel = !serverConfigured
    ? "未连接订阅服务 · 状态未验证"
    : checking
      ? "正在查询服务端状态"
      : error
        ? "无法验证订阅状态"
        : entitlement.verified
          ? entitlement.status
          : "服务端尚未验证权益"

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
            <strong>{entitlement.verified ? entitlement.skuId ?? "Lingo+" : "订阅状态未验证"}</strong>
            <small>{entitlement.verified ? entitlement.source : "不会使用本地演示数据作为订阅凭证"}</small>
          </div>
          <b>{entitlement.verified ? entitlement.currency ?? "—" : "—"}</b>
        </section>

        <div className="kv-list">
          <div className="kv-row">
            <small>订阅状态</small>
            <strong>{statusLabel}</strong>
          </div>
          <div className="kv-row">
            <small>自动续费</small>
            <strong>{entitlement.verified ? (entitlement.autoRenew ? "已开启" : "未开启") : "未验证"}</strong>
          </div>
          <div className="kv-row">
            <small>权益截止</small>
            <strong>{entitlement.verified ? entitlement.expiresAt ?? "—" : "—"}</strong>
          </div>
          <div className="kv-row">
            <small>订单号</small>
            <strong>{entitlement.verified ? entitlement.transactionId ?? "—" : "—"}</strong>
          </div>
        </div>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>管理订阅</strong>
            <small>购买渠道未验证</small>
          </div>
          <p className="pay-hint">
            {serverConfigured
              ? "订阅管理接口尚未接入。请通过最初购买时使用的应用商店或支付渠道管理续订。"
              : "当前未连接订阅服务，不会尝试取消或更改自动续费状态。"}
          </p>
        </section>

        <section className="pay-section">
          <div className="pay-section-head">
            <strong>退款与账单</strong>
            <small>需真实交易记录</small>
          </div>
          <p className="pay-hint">
            退款资格、申请入口、付款方式及税务凭证取决于实际购买渠道和所在地规则。当前不会将本地演示订单显示为真实账单，也不能查询或提交退款。
          </p>
          {error ? <p className="pay-hint">状态查询失败：{error}</p> : null}
        </section>

        <AppButton className="pay-ghost" disabled={checking || !serverConfigured} onClick={() => { void refresh() }}>
          {checking ? "正在查询" : "刷新服务端状态（不是恢复购买）"}
        </AppButton>
        <p className="pay-hint">取消续费、法定撤回与退款是不同操作。卸载应用或删除账号不等于取消渠道订阅；请在原购买渠道确认后续扣款已停止。</p>
        <AppButton className="manage-button" onClick={onClose}>
          完成
        </AppButton>
      </div>
    </div>
  )
}

export default SubscriptionManage
