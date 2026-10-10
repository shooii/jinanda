import { useMemo, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { bluetoothSupported } from "@/lib/device-link"
import { useT } from "@/lib/i18n"
import { offlineSupport } from "@/lib/offline-packs"
import { apiConfigured } from "@/lib/services/api"
import { speechSupport } from "@/lib/speech"
import { nowLabel } from "@/lib/store"

/**
 * 服务状态。
 *
 * 只呈现「能验证的东西」：本机能力检测（识别 / 合成 / 麦克风 / 端侧模型 /
 * 蓝牙）与账户服务是否已配置。
 * 过去这一页写的是「延迟 0.8 秒」「队列 0 等待」「最近 30 天无故障」——
 * 这些数字没有数据源，属于编造，已经删掉。
 */
type ServiceRow = { name: string; status: string; detail: string; ok: boolean }

function capabilityRows(t: (key: string) => string): ServiceRow[] {
  const speech = speechSupport()
  const offline = offlineSupport()
  const connected = apiConfigured()

  return [
    {
      name: t("service.voiceRecognition"),
      status: speech.recognition ? t("service.ok") : t("service.unsupported"),
      detail: offline.recognition
        ? t("service.recogOnDevice")
        : t("service.recogBrowser"),
      ok: speech.recognition,
    },
    {
      name: t("service.translation"),
      status:
        speech.translation || offline.translation
          ? t("service.ok")
          : t("service.limited"),
      detail: offline.translation
        ? t("service.mtOnDevice")
        : t("service.mtDictionary"),
      ok: speech.translation || offline.translation,
    },
    {
      name: t("service.synthesis"),
      status: speech.synthesis ? t("service.ok") : t("service.unsupported"),
      detail: t("service.synthDetail"),
      ok: speech.synthesis,
    },
    {
      name: t("service.mic"),
      status: speech.mic ? t("service.ok") : t("service.unsupported"),
      detail: t("service.micDetail"),
      ok: speech.mic,
    },
    {
      name: t("service.offlinePacks"),
      status:
        offline.recognition || offline.translation
          ? t("service.ok")
          : t("service.unsupported"),
      detail:
        offline.recognition && offline.translation
          ? t("service.packsBoth")
          : offline.translation
            ? t("service.packsTranslationOnly")
            : t("service.packsNone"),
      ok: offline.recognition || offline.translation,
    },
    {
      name: t("service.bluetooth"),
      status: bluetoothSupported() ? t("service.ok") : t("service.unsupported"),
      detail: t("service.btDetail"),
      ok: bluetoothSupported(),
    },
    {
      name: t("service.account"),
      status: connected ? t("service.connected") : t("service.localMode"),
      detail: connected ? t("service.accountServer") : t("service.accountLocal"),
      ok: connected,
    },
  ]
}

export function ServiceStatus({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [updatedAt, setUpdatedAt] = useState(() => nowLabel())
  const [subscribed, setSubscribed] = useState(false)
  const services = useMemo(() => capabilityRows(t), [t, updatedAt])
  const allOk = services.every((item) => item.ok)

  return (
    <InfoSheet
      eyebrow={t("profile.serviceStatus")}
      icon={allOk ? "check" : "shield"}
      onClose={onClose}
      title={allOk ? t("service.titleOk") : t("service.titlePartial")}
    >
      <p className="sheet-intro">
        {t("service.intro").replace("{time}", updatedAt)}
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
        <p>{t("service.noIncident")}</p>
      </div>
      <div className="stack-actions">
        <AppButton
          className={subscribed ? "pay-outline" : "manage-button"}
          onClick={() => {
            const next = !subscribed
            setSubscribed(next)
            toast(
              next ? t("service.notifyOn") : t("service.notifyOff"),
            )
          }}
        >
          {subscribed ? t("service.notifySubscribed") : t("service.notifySubscribe")}
        </AppButton>
        <AppButton
          className="text-button"
          onClick={() => {
            const value = nowLabel()
            setUpdatedAt(value)
            toast(`${t("service.refreshed")} · ${value}`)
          }}
        >
          {t("service.refreshed")}
        </AppButton>
      </div>
    </InfoSheet>
  )
}

export default ServiceStatus
