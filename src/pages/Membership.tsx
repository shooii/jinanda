import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export function Membership({ onClose }: { onClose: () => void }) {
  const [managing, setManaging] = useState(false)
  useEscapeKey(onClose)

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
                <b>Lingo+ Unlimited</b>
                <small>设备赠送 · 使用中</small>
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
                  将以 ¥38/月自动续费，系统会在续费前 7
                  天提醒。你可以随时取消，不影响赠送期权益。
                </p>
              </div>
            </section>
            <div className="subscription-actions">
              <AppButton onClick={() => setManaging(false)}>
                返回会员权益
              </AppButton>
              <AppButton>关闭自动续费</AppButton>
            </div>
            <div className="legal-links">
              <AppButton>恢复购买</AppButton>
              <i /> <AppButton>服务条款</AppButton>
              <i /> <AppButton>隐私政策</AppButton>
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
                  <small>支持 42 种语言与自然语音播报</small>
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
            <AppButton className="third-party-plan">
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
    </div>
  )
}

export default Membership
