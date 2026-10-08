import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { nowLabel } from "@/lib/store"



const services = [
  { name: "实时翻译", status: "正常", latency: "延迟 0.8 秒" },
  { name: "会议转写与纪要", status: "正常", latency: "队列 0 等待" },
  { name: "离线语言包下载", status: "正常", latency: "平均 12 MB/s" },
  { name: "查找耳机", status: "正常", latency: "蓝牙信号良好" },
  { name: "账号与订阅", status: "正常", latency: "同步延迟 < 1 秒" },
]

export function ServiceStatus({ onClose }: { onClose: () => void }) {
  const [updatedAt, setUpdatedAt] = useState(() => nowLabel())
  const [subscribed, setSubscribed] = useState(false)

  return (
    <InfoSheet
      eyebrow="服务状态"
      icon="check"
      onClose={onClose}
      title="所有服务运行正常"
    >
      <p className="sheet-intro">
        最近 30 天无故障记录，以下为各服务的实时运行状态（更新于 {updatedAt}）。
      </p>
      <div className="status-list">
        {services.map((item) => (
          <div className="status-row" key={item.name}>
            <i className="status-dot" />
            <span>
              <strong>{item.name}</strong>
              <small>{item.latency}</small>
            </span>
            <b>{item.status}</b>
          </div>
        ))}
      </div>
      <div className="status-incident">
        <Icon name="sparkles" size={16} />
        <p>没有进行中的维护或已知问题。</p>
      </div>
      <div className="stack-actions">
        <AppButton
          className={subscribed ? "pay-outline" : "manage-button"}
          onClick={() => {
            const next = !subscribed
            setSubscribed(next)
            toast(
              next
                ? "已开启故障提醒，异常时会第一时间通知你"
                : "已关闭故障提醒",
            )
          }}
        >
          {subscribed ? "已订阅故障通知" : "订阅故障通知"}
        </AppButton>
        <AppButton
          className="text-button"
          onClick={() => {
            const value = nowLabel()
            setUpdatedAt(value)
            toast(`状态页已刷新 · ${value}`)
          }}
        >
          刷新状态
        </AppButton>
      </div>
    </InfoSheet>
  )
}

export default ServiceStatus
