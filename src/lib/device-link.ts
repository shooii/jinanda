/**
 * 真实硬件通路（Web Bluetooth）。
 *
 * 用标准 GATT 服务读取真实耳机的电量与设备信息，不依赖厂商 SDK：
 * - Battery Service (0x180F) → 电量，并订阅变化
 * - Device Information Service (0x180A) → 厂商 / 型号 / 固件 / 序列号
 *
 * 说明：只对实现了上述标准服务的 BLE 设备有效；厂商私有的音频路由与固件
 * 升级（DFU）不属于浏览器能力范围，需要原生桥接，见 docs/hardware-bridge.md。
 */

export type LinkErrorReason =
  | "unsupported"
  | "cancelled"
  | "denied"
  | "connect-failed"
  | "failed"

export class LinkError extends Error {
  reason: LinkErrorReason
  constructor(reason: LinkErrorReason, message?: string) {
    super(message ?? reason)
    this.reason = reason
    this.name = "LinkError"
  }
}

export type LinkedDevice = {
  id: string
  name: string
  /** 标准电量百分比，读不到时为 null */
  battery: number | null
  manufacturer: string | null
  model: string | null
  firmware: string | null
  serial: string | null
}

export type LinkSession = {
  device: LinkedDevice
  /** 断开连接（含用户主动断开与设备走远） */
  disconnect: () => void
}

type LinkHandlers = {
  /** 电量变化 */
  onBattery?: (level: number) => void
  /** 连接断开 */
  onDisconnect?: () => void
}

const BATTERY_SERVICE = "battery_service"
const BATTERY_LEVEL = "battery_level"
const DEVICE_INFO_SERVICE = "device_information"
const MANUFACTURER = "manufacturer_name_string"
const MODEL = "model_number_string"
const FIRMWARE = "firmware_revision_string"
const SERIAL = "serial_number_string"

const bluetoothApi = () =>
  typeof navigator === "undefined" ? null : ((navigator as any).bluetooth ?? null)

export const bluetoothSupported = () => !!bluetoothApi()

function mapError(error: unknown): LinkError {
  const name = error instanceof Error ? error.name : ""
  if (name === "NotFoundError") return new LinkError("cancelled")
  if (name === "SecurityError") return new LinkError("denied")
  if (name === "NetworkError") return new LinkError("connect-failed")
  if (name === "NotSupportedError") return new LinkError("unsupported")
  return new LinkError("failed", error instanceof Error ? error.message : String(error))
}

async function readText(
  server: any,
  serviceId: string,
  characteristicId: string,
): Promise<string | null> {
  try {
    const service = await server.getPrimaryService(serviceId)
    const characteristic = await service.getCharacteristic(characteristicId)
    const value: DataView = await characteristic.readValue()
    const text = new TextDecoder().decode(value).replace(/\0+$/, "").trim()
    return text || null
  } catch {
    // 设备不一定实现全部特征，缺失属于正常情况
    return null
  }
}

/**
 * 弹出系统蓝牙选择器并连接设备。
 * 必须由用户手势触发（浏览器要求），因此调用点要放在点击处理函数里。
 */
export async function pairDevice(handlers: LinkHandlers = {}): Promise<LinkSession> {
  const bluetooth = bluetoothApi()
  if (!bluetooth) throw new LinkError("unsupported")

  try {
    const device = await bluetooth.requestDevice({
      // 只列出会广播标准电量服务的 BLE 设备，绝大多数耳机都支持
      filters: [{ services: [BATTERY_SERVICE] }],
      optionalServices: [BATTERY_SERVICE, DEVICE_INFO_SERVICE, "generic_access"],
    })

    const server = await device.gatt?.connect()
    if (!server) throw new LinkError("connect-failed")

    let battery: number | null = null
    try {
      const service = await server.getPrimaryService(BATTERY_SERVICE)
      const characteristic = await service.getCharacteristic(BATTERY_LEVEL)
      const value: DataView = await characteristic.readValue()
      battery = value.getUint8(0)
      // 订阅电量变化：部分设备会在使用时实时推
      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const next = event.target.value.getUint8(0)
        battery = next
        handlers.onBattery?.(next)
      })
      await characteristic.startNotifications()
    } catch {
      battery = null
    }

    const linked: LinkedDevice = {
      id: device.id,
      name: device.name ?? "未知设备",
      battery,
      manufacturer: await readText(server, DEVICE_INFO_SERVICE, MANUFACTURER),
      model: await readText(server, DEVICE_INFO_SERVICE, MODEL),
      firmware: await readText(server, DEVICE_INFO_SERVICE, FIRMWARE),
      serial: await readText(server, DEVICE_INFO_SERVICE, SERIAL),
    }

    const disconnect = () => {
      try {
        device.gatt?.disconnect()
      } catch {
        /* 已经断开 */
      }
    }

    device.addEventListener("gattserverdisconnected", () => handlers.onDisconnect?.())

    return { device: linked, disconnect }
  } catch (error) {
    if (error instanceof LinkError) throw error
    throw mapError(error)
  }
}

/** 把失败原因转成可执行的提示 */
export function describeLinkError(reason: LinkErrorReason): string {
  switch (reason) {
    case "unsupported":
      return "当前浏览器不支持蓝牙直连，请改用桌面版 Chrome 或 Edge"
    case "cancelled":
      return "已取消选择设备"
    case "denied":
      return "蓝牙权限被拒绝，请在浏览器设置中允许后重试"
    case "connect-failed":
      return "连接设备失败，请确认耳机处于配对模式并靠近电脑"
    default:
      return "蓝牙连接失败，请重试"
  }
}
