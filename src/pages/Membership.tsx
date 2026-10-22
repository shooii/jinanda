import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { UpgradePaywallModal } from "@/components/UpgradePaywallModal"
import { useEscapeKey } from "@/lib/core"
import { formatDate, useSavedRecords, useVocabulary } from "@/lib/store"
import { MEMBERSHIP_NAME } from "@/lib/app-meta"
import { subscriptionSnapshot, useEntitlement } from "@/lib/services/entitlements"
import type { EntitlementStatus } from "@/lib/services/entitlements"
import { LegalDocument } from "@/features/LegalDocument"
import type { LegalDocId } from "@/features/LegalDocument"
import { SubscriptionManage } from "@/features/SubscriptionManage"

const statusLabels: Record<EntitlementStatus, string> = {
  none: "未订阅",
  trialing: "试用中",
  active: "有效",
  canceled_at_period_end: "已安排到期取消",
  past_due: "待处理付款",
  grace: "宽限期",
  account_hold: "账号保留 · 权益暂停",
  paused: "已暂停",
  expired: "已到期",
  refunded: "已退款",
  revoked: "已撤销",
  chargeback: "付款争议",
}

export function Membership({ onClose }: { onClose: () => void }) {
  const [managing, setManaging] = useState(false)
  const [paywall, setPaywall] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null)
  const [records] = useSavedRecords()
  const { entries: vocabulary } = useVocabulary()
  const { entitlement, checking, error, serverConfigured, now } = useEntitlement()
  const verified = serverConfigured && !error && entitlement.verified
  const active = verified && subscriptionSnapshot(entitlement, now).paid
  const deadline = entitlement.status === "grace" ? entitlement.graceEndsAt
    : entitlement.status === "trialing" ? entitlement.trialEndsAt : entitlement.expiresAt
  const childOpen = managing || paywall || restoring || legalDoc !== null

  useEscapeKey(() => {
    if (!childOpen) onClose()
  })

  const statusLabel = !serverConfigured
    ? "未接入订阅服务 · 权益未验证"
    : error
      ? "权益查询失败 · 无法验证"
      : verified
        ? `${statusLabels[entitlement.status]}${checking ? " · 正在刷新" : ""}`
        : checking
          ? "正在查询服务器权益"
          : "服务器尚未验证权益"

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}>
        <div
          className="membership-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={`${MEMBERSHIP_NAME} 会员`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sheet-handle" />
          <AppButton ariaLabel="关闭会员权益" className="sheet-close" onClick={onClose}>
            <Icon name="close" size={18} />
          </AppButton>
          <span className="plan-icon"><Icon name="sparkles" size={27} /></span>
          <span className="eyebrow">{MEMBERSHIP_NAME} 会员</span>
          <h2>{active ? "服务器已验证当前权益" : verified ? "当前无有效会员权益" : "会员权益尚未验证"}</h2>
          <p className="sheet-intro">
            会员状态仅以服务器校验结果为依据，本地方案选择、演示订单或历史缓存不代表已付费。
            当前购买与试用入口尚未接入，不能在此开通会员或扣款。
          </p>

          <section className="quota-block" aria-live="polite">
            <strong className="quota-title">服务器权益状态</strong>
            <div className="kv-list">
              <div className="kv-row">
                <small>校验状态</small>
                <strong>{statusLabel}</strong>
              </div>
              <div className="kv-row">
                <small>服务器方案标识</small>
                <strong>{verified ? entitlement.skuId ?? "未提供" : "未验证"}</strong>
              </div>
              <div className="kv-row">
                <small>权益截止</small>
                <strong>{verified ? formatDate(deadline) || "未提供" : "未验证"}</strong>
              </div>
            </div>
            {error ? <p className="support-note">查询失败：{error}</p> : null}
          </section>

          <section className="member-value" aria-label="本机记录统计">
            <span>
              <strong>{records.filter((item) => item.type === "对话" || item.type === "通话").length}</strong>
              <small>对话与通话记录</small>
            </span>
            <span>
              <strong>{records.filter((item) => item.type === "会议").length}</strong>
              <small>会议记录</small>
            </span>
            <span><strong>{vocabulary.length}</strong><small>个人词汇</small></span>
          </section>
          <small className="renewal-note">以上为本机已保存记录，不代表服务器计费额度或会员权益。</small>

          <AppButton className="manage-button" onClick={() => setPaywall(true)}>
            查看方案预览
          </AppButton>
          <AppButton className="pay-ghost" onClick={() => setManaging(true)}>
            订阅管理与账单说明
          </AppButton>
          <div className="legal-links">
            <AppButton onClick={() => setRestoring(true)}>恢复购买说明</AppButton>
            <i />
            <AppButton onClick={() => setLegalDoc("terms")}>服务条款</AppButton>
            <i />
            <AppButton onClick={() => setLegalDoc("privacy")}>隐私政策</AppButton>
          </div>
        </div>
      </div>

      {paywall ? <UpgradePaywallModal reason="manual" onClose={() => setPaywall(false)} /> : null}
      {managing ? <SubscriptionManage onClose={() => setManaging(false)} /> : null}
      {legalDoc ? <LegalDocument doc={legalDoc} onClose={() => setLegalDoc(null)} /> : null}
      {restoring ? (
        <InfoSheet eyebrow="恢复购买" icon="wallet" onClose={() => setRestoring(false)} title="渠道恢复尚未接入">
          <p className="sheet-intro">
            当前尚未集成应用商店或支付渠道的购买恢复，未执行恢复操作，也不会在本地授予权益。
            查询服务器权益仅用于展示当前状态，不等于恢复购买；请通过原购买渠道核实订单或联系其支持。
          </p>
          <AppButton className="manage-button" onClick={() => setRestoring(false)}>知道了</AppButton>
        </InfoSheet>
      ) : null}
    </>
  )
}

export default Membership
