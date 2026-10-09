import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { MiniBattery } from "@/components/BatteryPair"
import { useDevices } from "@/lib/store"
import type { DeviceStatus, PairedDevice } from "@/lib/store"
import { useT } from "@/lib/i18n"


type AddStep = "idle" | "searching" | "found" | "connecting" | "done"

export function DeviceManager({ onClose }: { onClose: () => void }) {
  const t = useT()
  const {
    devices,
    active,
    connect,
    disconnect,
    setCurrent,
    removeDevice,
    addDevice,
  } = useDevices()
  const [adding, setAdding] = useState<AddStep>("idle")

  useEffect(() => {
    if (adding !== "searching") return
    const timer = window.setTimeout(() => setAdding("found"), 1600)
    return () => window.clearTimeout(timer)
  }, [adding])

  // 配对成功后短暂展示「已连接」，随后自动回到设备列表
  useEffect(() => {
    if (adding !== "done") return
    const timer = window.setTimeout(() => {
      addDevice()
      setAdding("idle")
      toast(t("devices.addedToast"))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [adding, addDevice, t])

  const statusLabel = (status: DeviceStatus) =>
    status === "connected"
      ? t("devices.statusConnected")
      : status === "connecting"
        ? t("devices.statusConnecting")
        : t("devices.statusDisconnected")

  const statusClass = (status: DeviceStatus) =>
    status === "connected"
      ? "is-connected"
      : status === "connecting"
        ? "is-connecting"
        : "is-disconnected"

  const pairDevice = () => {
    setAdding("connecting")
    window.setTimeout(() => setAdding("done"), 1400)
  }

  const handleConnect = (device: PairedDevice) => {
    connect(device.id)
    toast(`${device.name} · ${t("devices.statusConnecting")}`)
    window.setTimeout(
      () => toast(t("devices.connectedToast").replace("{name}", device.name)),
      1500,
    )
  }

  const handleDisconnect = (device: PairedDevice) => {
    disconnect(device.id)
    toast(t("devices.disconnectedToast").replace("{name}", device.name))
  }

  const handleCurrent = (device: PairedDevice) => {
    setCurrent(device.id)
    toast(t("devices.currentToast").replace("{name}", device.name))
  }

  const handleRemove = (device: PairedDevice) => {
    removeDevice(device.id)
    toast(t("devices.removedToast"))
  }

  return (
    <div className="device-manager">
      <header className="dm-header">
        <AppButton
          ariaLabel={t("devices.title")}
          className="dm-close"
          onClick={onClose}
        >
          <Icon name="close" />
        </AppButton>
        <div>
          <span className="eyebrow">{t("devices.eyebrow")}</span>
          <h2>{t("devices.title")}</h2>
        </div>
      </header>

      <p className="prototype-note">交互演示 · 当前没有真实蓝牙连接或电量读取</p>

      {adding === "idle" ? (
        <div className="dm-body">
          {active.id && <section className={`dm-active ${statusClass(active.status)}`}>
            <div className="dm-active-head">
              <span className="eyebrow">{t("devices.current")}</span>
              <span className={`dm-badge ${statusClass(active.status)}`}>
                {statusLabel(active.status)}
              </span>
            </div>
            <div className="dm-active-main">
              <span className="dm-device-icon">
                <Icon name="headphones" size={26} />
              </span>
              <div>
                <strong>{active.name}</strong>
                <small>{active.model}</small>
              </div>
            </div>
            <div className="dm-battery">
              <MiniBattery level={active.leftBattery} label="L" />
              <MiniBattery level={active.rightBattery} label="R" />
              <MiniBattery level={active.caseBattery} label={t("devices.caseTag")} />
            </div>
          </section>}

          <div className="section-heading">
            <h3>{t("devices.paired")}</h3>
            <small>{devices.length}</small>
          </div>

          {devices.length === 0 ? (
            <p className="dm-empty">{t("devices.empty")}</p>
          ) : (
            <ul className="dm-list">
              {devices.map((device) => (
                <li
                  key={device.id}
                  className={`dm-row ${statusClass(device.status)} ${
                    device.current ? "is-current" : ""
                  }`}
                >
                  <span className="dm-row-icon">
                    <Icon name="headphones" size={20} />
                  </span>
                  <div className="dm-row-info">
                    <strong>
                      {device.name}
                      {device.current && (
                        <em className="dm-current-tag">
                          {t("devices.currentBadge")}
                        </em>
                      )}
                    </strong>
                    <small>
                      {device.status === "disconnected"
                        ? `${device.model} · ${t("devices.lastConnected")} ${device.lastConnected}`
                        : `${device.model} · ${statusLabel(device.status)}`}
                    </small>
                  </div>
                  <div className="dm-row-status">
                    <span className={`dm-dot ${statusClass(device.status)}`} />
                  </div>
                  <div className="dm-row-actions">
                    {device.status === "connecting" ? (
                      <i className="connect-spinner" />
                    ) : device.status === "connected" ? (
                      <>
                        {!device.current && (
                          <AppButton
                            className="dm-action"
                            onClick={() => handleCurrent(device)}
                          >
                            {t("devices.setCurrent")}
                          </AppButton>
                        )}
                        <AppButton
                          className="dm-action ghost"
                          onClick={() => handleDisconnect(device)}
                        >
                          {t("devices.disconnect")}
                        </AppButton>
                      </>
                    ) : (
                      <>
                        <AppButton
                          className="dm-action"
                          onClick={() => handleConnect(device)}
                        >
                          {t("devices.connect")}
                        </AppButton>
                        {!device.current && (
                          <AppButton
                            ariaLabel={`${t("devices.remove")} ${device.name}`}
                            className="dm-action remove"
                            onClick={() => handleRemove(device)}
                          >
                            <Icon name="close" size={15} />
                          </AppButton>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <AppButton className="dm-add" onClick={() => setAdding("searching")}>
            <Icon name="plus" size={18} />
            <span>体验设备连接演示</span>
          </AppButton>
          <p className="dm-add-hint">不会搜索或连接真实蓝牙耳机。</p>
        </div>
      ) : (
        <div className="dm-scan">
          <div className={`radar ${adding}`}>
            <i className="radar-ring ring-one" />
            <i className="radar-ring ring-two" />
            <i className="radar-ring ring-three" />
            <span className="bluetooth-core">
              <Icon
                name={adding === "done" ? "check" : "bluetooth"}
                size={34}
              />
            </span>
          </div>
          <h2>
            {adding === "searching"
              ? "演示：搜索设备"
              : adding === "found"
                ? "演示：找到设备"
                : adding === "connecting"
                  ? "演示：连接中"
                  : "演示完成"}
          </h2>
          {adding === "found" && (
            <div className="dm-found">
              <span className="device-avatar">
                <Icon name="headphones" size={24} />
              </span>
              <div>
                <strong>LingoPods</strong>
                <small>{t("devices.addHint")}</small>
              </div>
              <AppButton className="mini-connect" onClick={pairDevice}>
                {t("devices.pair")}
              </AppButton>
            </div>
          )}
          {adding === "connecting" && <i className="connect-spinner big" />}
          {adding !== "done" && adding !== "found" && (
            <AppButton className="text-button" onClick={() => setAdding("idle")}>
              {t("vocab.cancel")}
            </AppButton>
          )}
        </div>
      )}
    </div>
  )
}

export default DeviceManager
