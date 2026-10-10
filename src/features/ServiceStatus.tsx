import { useMemo, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { bluetoothSupported } from "@/lib/device-link"
import { offlineSupport } from "@/lib/offline-packs"
import { apiConfigured } from "@/lib/services/api"
import { speechSupport } from "@/lib/speech"
import { nowLabel } from "@/lib/store"

/**
 * 服务状态。
 *
 * 这里只呈现「能验证的东西」：本机能力检测（识别 / 合成 / 麦克风 / 端侧模型 /
 * 蓝牙）与账户服务是否已配置。
 * 过去这一页写的是「延迟 0.8 秒」「队列 0 等待」「最近 30 天无故障」——
 * 这些数字没有数据源，属于编造，已经删掉。
 */
type ServiceRow = { name: string; status: string; detail: string; ok: boolean }

function capabilityRows(): ServiceRow[] {
  const speech = speechSupport()
  const offline = offlineSupport()
  const connected = apiConfigured()

  const rows: ServiceRow[] = [
    {
      name: "语音识别",
      status: speech.recognition ? "可用" : "不支持",
      detail: offline.recognition ? "端侧语言包可用" : "由浏览器语音服务提供",
      ok: speech.recognition,
    },
    {
      name: "机器翻译",
      status: speech.translation || offline.translation ? "可用" : "受限",
      detail: offline.translation
        ? "端侧翻译模型可用"
        : "仅本地词典，联网后可获得完整译文",
      ok: speech.translation || offline.translation,
    },
    {
      name: "语音播报",
      status: speech.synthesis ? "可用" : "不支持",
      detail: "由系统语音合成提供",
      ok: speech.synthesis,
    },
    {
      name: "麦克风采集",
      status: speech.mic ? "可用" : "不支持",
      detail: "首次使用会请求麦克风权限",
      ok: speech.mic,
    },
    {
      name: "离线语言包",
      status: offline.recognition || offline.translation ? "可用" : "不支持",
      detail:
        offline.recognition && offline.translation
          ? "在旅行模式下载后断网可用"
          : offline.translation
            ? "该浏览器不支持端侧识别"
            : "需要 Chrome / Edge 的端侧模型",
      ok: offline.recognition || offline.translation,
    },
    {
      name: "耳机直连",
      status: bluetoothSupported() ? "可用" : "不支持",
      detail: "读取标准 GATT 服务的电量与设备信息",
      ok: bluetoothSupported(),
    },
    {
      name: "账户与订阅",
      status: connected ? "已连接" : "本地模式",
      detail: connected
        ? "权益与账单来自服务端"
        : "未配置服务端地址，权益校验与同步不可用",
      ok: connected,
    },
  ]
  return rows
}

export function ServiceStatus({ onClose }: { onClose: () => void }) {
  const [updatedAt, setUpdatedAt] = useState(() => nowLabel())
  const [subscribed, setSubscribed] = useState(false)
  const services = useMemo(capabilityRows, [updatedAt])
  const allOk = services.every((item) => item.ok)

  return (
    <InfoSheet
      eyebrow="服务状态"
      icon={allOk ? "check" : "shield"}
      onClose={onClose}
      title={allOk ? "本机能力均可用" : "部分能力不可用"}
    >
      <p className="sheet-intro">
        以下为本机实时检测结果（更新于 {updatedAt}）；当前为本地模式，未接入服务端，
        因此不显示任何云端延迟或可用率数据。
      </p>
      <div className="status-list">
        {services.map((item) => (
          <div className="status-row" key={item.name}>
            <i className={`status-dot ${item.ok ? "" : "is-off"}`} />
            <span>
              <strong>{item.name}</strong>
              <small>{item.detail}</small>
            </span>
            <b>{item.status}</b>
          </div>
        ))}
      </div>
      <div className="status-incident">
        <Icon name="sparkles" size={16} />
        <p>没有可自行修复的异常；不可用项由浏览器能力决定，可换用 Chrome / Edge 重试。</p>
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
