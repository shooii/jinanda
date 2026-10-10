import { useEffect, useRef, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { MiniBattery } from "@/components/BatteryPair"
import { useDevices } from "@/lib/store"
import type { DeviceStatus, PairedDevice } from "@/lib/store"
import { useT } from "@/lib/i18n"
import {
  LinkError,
  bluetoothSupported,
  describeLinkError,
  pairDevice as pairBluetoothDevice,
  type LinkSession,
} from "@/lib/device-link"


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
    applyReading,
  } = useDevices()
  const [adding, setAdding] = useState<AddStep>("idle")
  /** 真实蓝牙直连会话；与本地设备列表是两件事，前者来自 GATT 读数 */
  const [link, setLink] = useState<LinkSession | null>(null)
  const [linking, setLinking] = useState(false)
  const linkedId = useRef<string | null>(null)

  /**
   * 连接真实耳机：走系统蓝牙选择器 + 标准 GATT 服务，
   * 拿到的设备名、型号与电量都是硬件真实读数。
   */
  const connectHardware = () => {
    if (linking) return
    setLinking(true)
    void (async () => {
      try {
        const session = await pairBluetoothDevice({
          onBattery: (level) => {
            if (linkedId.current) applyReading(linkedId.current, { battery: level })
          },
          onDisconnect: () => {
            if (linkedId.current) applyReading(linkedId.current, { status: "disconnected" })
            setLink(null)
            linkedId.current = null
          },
        })
        const created = addDevice({
          name: session.device.name,
          model: session.device.model ?? session.device.id.slice(0, 8),
        })
        linkedId.current = created.id
        applyReading(created.id, {
          status: "connected",
          ...(session.device.battery === null ? {} : { battery: session.device.battery }),
          ...(session.device.firmware ? { firmware: session.device.firmware } : {}),
          ...(session.device.serial ? { serial: session.device.serial } : {}),
        })
        setLink(session)
        toast(`${session.device.name} 已通过蓝牙连接`)
      } catch (error) {
        const reason = error instanceof LinkError ? error.reason : "failed"
        toast(describeLinkError(reason))
      } finally {
        setLinking(false)
      }
    })()
  }

  const disconnectHardware = () => {
    link?.disconnect()
    if (linkedId.current) applyReading(linkedId.current, { status: "disconnected" })
    linkedId.current = null
    setLink(null)
  }

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

      {adding === "idle" ? (
        <div className="dm-body">
          {active.id && <section className={`dm-active ${statusClass(active.status)}`}>
            <div className="dm-active-head">
              {/* 断开时不能再说「当前设备」——它只是上次使用过的那台 */}
              <span className="eyebrow">
                {active.status === "connected" ? t("devices.current") : t("devices.lastConnected")}
              </span>
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
            {active.status === "connected" ? (
              <div className="dm-battery">
                <MiniBattery level={active.leftBattery} label="L" />
                <MiniBattery level={active.rightBattery} label="R" />
                <MiniBattery level={active.caseBattery} label={t("devices.caseTag")} />
              </div>
            ) : (
              <p className="device-battery-hint">{t("battery.connectHint")}</p>
            )}
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

          <section className="dm-hw">
            <div className="dm-hw-head">
              <span className="eyebrow">硬件直连</span>
              <small>{bluetoothSupported() ? "读取标准 GATT 服务" : "当前浏览器不支持"}</small>
            </div>
            {link ? (
              <div className="dm-hw-body">
                <strong>{link.device.name}</strong>
                <div className="dm-hw-rows">
                  <span>
                    电量 <b>{link.device.battery === null ? "—" : `${link.device.battery}%`}</b>
                  </span>
                  <span>
                    型号 <b>{link.device.model ?? "—"}</b>
                  </span>
                  <span>
                    固件 <b>{link.device.firmware ?? "—"}</b>
                  </span>
                  <span>
                    厂商 <b>{link.device.manufacturer ?? "—"}</b>
                  </span>
                </div>
                <AppButton className="dm-hw-action" onClick={disconnectHardware}>
                  断开直连
                </AppButton>
              </div>
            ) : (
              <AppButton
                className="dm-hw-action primary"
                disabled={!bluetoothSupported() || linking}
                onClick={connectHardware}
              >
                <Icon name="bluetooth" size={18} />
                <span>{linking ? "正在连接…" : "通过蓝牙连接真实耳机"}</span>
              </AppButton>
            )}
          </section>

          <AppButton className="dm-add" onClick={() => setAdding("searching")}>
            <Icon name="plus" size={18} />
            <span>添加并连接设备</span>
          </AppButton>
          <p className="dm-add-hint">请让耳机靠近手机并保持开盖，确认充电盒指示灯闪烁。</p>
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
              ? "正在搜索设备"
              : adding === "found"
                ? "发现附近的耳机"
                : adding === "connecting"
                  ? "正在连接"
                  : "连接完成"}
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
