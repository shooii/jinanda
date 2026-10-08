import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { useEscapeKey } from "@/lib/core"
import { usePlan } from "@/lib/store"
import { LegalDocument } from "@/features/LegalDocument"
import type { LegalDocId } from "@/features/LegalDocument"
import { SubscriptionPlans } from "@/features/SubscriptionPlans"
import { SubscriptionManage } from "@/features/SubscriptionManage"
import { channelById, regionById } from "@/lib/payments"
import { allLanguages } from "@/lib/translate"



export function Membership({ onClose }: { onClose: () => void }) {
  const [managing, setManaging] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [billing, setBilling] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null)
  const [plan, setPlan] = usePlan()
  useEscapeKey(onClose)

  const channel = channelById(plan.channel)
  const region = regionById(plan.regionId)

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="membership-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="LINGO+ 会员"
      >
        <div className="sheet-handle" />
        <AppButton
          ariaLabel="关闭会员权益"
          className="sheet-close"
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </AppButton>
        {managing ? (
          <>
            <span className="plan-icon">
              <Icon name="settings" size={27} />
            </span>
            <span className="eyebrow">订阅管理</span>
            <h2>你的 Lingo+ 方案</h2>
            <p className="sheet-intro">
              当前会员由 LingoPods Pro 设备权益提供，赠送期内不会扣费。
            </p>
            <section className="subscription-card">
              <div>
                <span>
                  <i /> 当前方案
                </span>
                <b>{plan.name}</b>
                <small>
                  {channel
                    ? `${channel.name} · ${region.name}`
                    : "设备赠送 · 使用中"}
                </small>
              </div>
              <strong>
                ¥0<small>/ 赠送期</small>
              </strong>
            </section>
            <div className="billing-timeline">
              <div className="complete">
                <i>
                  <Icon name="check" size={13} />
                </i>
                <span>
                  <strong>2025 年 10 月 18 日</strong>
                  <small>激活设备赠送会员</small>
                </span>
              </div>
              <div>
                <i />
                <span>
                  <strong>2026 年 10 月 18 日</strong>
                  <small>赠送期结束</small>
                </span>
              </div>
            </div>
            <section className="renewal-disclosure">
              <Icon name="calendar" size={19} />
              <div>
                <strong>到期后的续费方式</strong>
                <p>
                  将以 {plan.source === "standalone" ? plan.price : "¥38"}
                  {plan.period === "yearly" ? "/年" : "/月"} 通过{" "}
                  {channel ? channel.name : "默认渠道"} 自动续费，系统会在续费前 7
                  天提醒。你可以随时取消，不影响当前周期权益。
                </p>
              </div>
            </section>

            <AppButton
              className="billing-row"
              onClick={() => setBilling(true)}
            >
              <span className="billing-row-icon">
                <Icon name="card" size={18} />
              </span>
              <span className="billing-row-copy">
                <strong>支付与账单</strong>
                <small>
                  {channel ? channel.vendor : "未绑定渠道"} · {region.name} ·{" "}
                  {region.currency}
                </small>
              </span>
              <Icon name="chevron" size={17} />
            </AppButton>
            {cancelConfirm ? (
              <div
                className="confirm-box"
                role="alertdialog"
                aria-label="确认关闭自动续费"
              >
                <strong>关闭自动续费？</strong>
                <small>
                  赠送期内权益不受影响；{plan.renewDate} 后不再扣费。
                </small>
                <div className="confirm-actions">
                  <AppButton onClick={() => setCancelConfirm(false)}>
                    保留续费
                  </AppButton>
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
              <div className="subscription-actions">
                <AppButton onClick={() => setManaging(false)}>
                  返回会员权益
                </AppButton>
                <AppButton
                  onClick={() => {
                    if (!plan.autoRenew) {
                      toast("自动续费已是关闭状态")
                      return
                    }
                    setCancelConfirm(true)
                  }}
                >
                  {plan.autoRenew ? "关闭自动续费" : "已关闭自动续费"}
                </AppButton>
              </div>
            )}
            <div className="legal-links">
              <AppButton onClick={() => setRestoring(true)}>恢复购买</AppButton>
              <i />
              <AppButton onClick={() => setLegalDoc("terms")}>
                服务条款
              </AppButton>
              <i />
              <AppButton onClick={() => setLegalDoc("privacy")}>
                隐私政策
              </AppButton>
            </div>
          </>
        ) : (
          <>
            <span className="plan-icon">
              <Icon name="sparkles" size={28} />
            </span>
            <span className="eyebrow">LINGO+ 会员</span>
            <h2>让翻译陪你去往每个地方。</h2>
            <p className="sheet-intro">
              购买 LingoPods Pro 已获赠会员，有效期至 2026 年 10 月 18 日。
            </p>
            <div className="benefit-list">
              <div>
                <Icon name="globe" />
                <span>
                  <strong>不限时实时翻译</strong>
                  <small>支持 {allLanguages.length} 种语言与自然语音播报</small>
                </span>
              </div>
              <div>
                <Icon name="plane" />
                <span>
                  <strong>离线旅行语言包</strong>
                  <small>没有漫游网络或 Wi-Fi 也能交流</small>
                </span>
              </div>
              <div>
                <Icon name="sparkles" />
                <span>
                  <strong>AI 纪要与待办事项</strong>
                  <small>会后自动生成可搜索的对话摘要</small>
                </span>
              </div>
            </div>
            <section className="member-value">
              <span>
                <strong>347</strong>
                <small>翻译分钟</small>
              </span>
              <span>
                <strong>18</strong>
                <small>真实对话</small>
              </span>
              <span>
                <strong>6</strong>
                <small>会议纪要</small>
              </span>
              <span>
                <strong>4h</strong>
                <small>节省时间</small>
              </span>
            </section>
            <AppButton
              className="third-party-plan"
              onClick={() => setPlansOpen(true)}
            >
              <span>
                <Icon name="headphones" size={18} />
              </span>
              <div>
                <strong>使用其他品牌耳机？</strong>
                <small>可单独订阅 Lingo+，继续使用翻译与会议功能</small>
              </div>
              <Icon name="chevron" size={17} />
            </AppButton>
            <AppButton
              className="manage-button"
              onClick={() => setManaging(true)}
            >
              管理会员
            </AppButton>
            <small className="renewal-note">
              设备专属权益 · 可随时取消续费
            </small>
          </>
        )}
      </div>

      {plansOpen && (
        <SubscriptionPlans onClose={() => setPlansOpen(false)} />
      )}
      {billing && (
        <SubscriptionManage onClose={() => setBilling(false)} />
      )}
      {legalDoc && (
        <LegalDocument
          doc={legalDoc}
          onClose={() => setLegalDoc(null)}
        />
      )}
      {restoring && (
        <InfoSheet
          eyebrow="恢复购买"
          icon="check"
          onClose={() => setRestoring(false)}
          title="已恢复你的购买"
        >
          <p className="sheet-intro">
            我们核对了账号下的购买记录，未发现未生效的订单。
          </p>
          <div className="kv-list">
            <div className="kv-row">
              <small>当前方案</small>
              <strong>{plan.name}</strong>
            </div>
            <div className="kv-row">
              <small>生效方式</small>
              <strong>
                {plan.source === "device" ? "设备赠送权益" : "单独订阅"}
              </strong>
            </div>
            <div className="kv-row">
              <small>支付渠道</small>
              <strong>
                {channel ? channel.name : "设备激活（无需付款）"}
              </strong>
            </div>
            <div className="kv-row">
              <small>下次扣费</small>
              <strong>
                {plan.autoRenew ? plan.renewDate : "已关闭自动续费"}
              </strong>
            </div>
          </div>
          <p className="support-note">
            <Icon name="check" size={14} />
            如果仍有疑问，可在“帮助与支持”中联系在线支持。
          </p>
          <AppButton
            className="manage-button"
            onClick={() => setRestoring(false)}
          >
            好的
          </AppButton>
        </InfoSheet>
      )}
    </div>
  )
}

export default Membership
