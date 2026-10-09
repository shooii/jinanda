import { useCallback, useSyncExternalStore } from "react"
import { usePersistentState } from "@/lib/core"
import type { ChannelId } from "@/lib/payments"



export type RecordType = "对话" | "会议" | "拍照" | "文本" | "通话" | "观影"

/** 通话类记录额外携带的信息，用于列表图标与详情页播报 */
export type CallRecordMeta = {
  kind: "video" | "voice"
  /** 通话时长（秒） */
  seconds: number
  /** 通话对象显示名，如 Emma Wilson */
  peer: string
  /** 通话软件，如 微信 */
  channel: string
}

export type TranscriptLine = {
  speaker: string
  original: string
  translated: string
}

export type SavedRecord = {
  id: string
  title: string
  meta: string
  time: string
  summary: string
  type: RecordType
  lines: TranscriptLine[]
  /** 仅通话记录携带 */
  call?: CallRecordMeta
}

export const sampleRecords: SavedRecord[] = [
  {
    id: "sample-dialogue",
    title: "咖啡馆对话",
    meta: "西班牙语 · 8 分钟",
    time: "今天 09:24",
    summary: "确认了无麸质早餐选项，并预订了靠窗座位。",
    type: "对话",
    lines: [
      {
        speaker: "A",
        original: "Could we get a table by the window?",
        translated: "我们可以要一张靠窗的桌子吗？",
      },
      {
        speaker: "B",
        original: "当然，可以。请跟我来。",
        translated: "Of course. Please follow me.",
      },
    ],
  },
  {
    id: "sample-meeting",
    title: "产品周会",
    meta: "英语 · 42 分钟",
    time: "今天 16:30",
    summary: "3 个待办事项 · 下周二前确认测试范围。",
    type: "会议",
    lines: [
      {
        speaker: "A",
        original: "Let's confirm the launch timeline before Friday.",
        translated: "我们在周五前确认一下发布时间表。",
      },
      {
        speaker: "M",
        original: "I'll share the updated testing plan.",
        translated: "我会分享更新后的测试计划。",
      },
    ],
  },
  {
    id: "sample-camera",
    title: "车站指示牌",
    meta: "日语 · 1 张图片",
    time: "10 月 6 日",
    summary: "中央线快速列车，请前往 4 号站台。",
    type: "拍照",
    lines: [
      {
        speaker: "原文",
        original: "中央線快速 4番線",
        translated: "中央线快速列车 · 4 号站台",
      },
    ],
  },
]

export function nowLabel() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `今天 ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/** 用户保存的翻译记录（拍照、文本翻译等都会写入） */
export function useSavedRecords() {
  const [records, setRecords] = usePersistentState<SavedRecord[]>(
    "lingo.records",
    [],
  )

  const addRecord = useCallback(
    (record: Omit<SavedRecord, "id" | "time"> & { time?: string }) => {
      const entry: SavedRecord = {
        id: `r-${Date.now()}`,
        time: record.time ?? nowLabel(),
        ...record,
      }
      setRecords((items) => [entry, ...items])
      return entry
    },
    [setRecords],
  )

  const removeRecord = useCallback(
    (id: string) => {
      setRecords((items) => items.filter((item) => item.id !== id))
    },
    [setRecords],
  )

  return [records, addRecord, removeRecord] as const
}

/**
 * 已删除的内置示例记录 id。
 * 示例记录来自 `sampleRecords` 常量，每次渲染都会重新拼进列表，
 * 删除后必须单独记下来，否则刷新就会「复活」。
 */
export function useHiddenRecords() {
  return usePersistentState<string[]>("lingo.records-hidden", [])
}

/** 生成一组随机的初始 id，用于常用语/收藏条目的键 */
function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`
}

export const defaultPhrases = [
  "请问最近的地铁站在哪里？",
  "我对坚果过敏。",
  "可以帮我叫一辆出租车吗？",
]

/**
 * 常用语手册：用户可增删改的常用表达清单（统一以中文存储，展示时按目标语言翻译）。
 * 首次读取时把历史文本数组迁移为带 id 的条目。
 */
export type PhraseEntry = {
  id: string
  /** 常用语原文 */
  text: string
}

export function usePhrases() {
  const [items, setItems] = usePersistentState<Array<PhraseEntry | string>>(
    "lingo.phrases",
    () => defaultPhrases.map((text) => ({ id: makeId("p"), text })),
  )

  // 兼容历史数据：旧版本存的是 string[]，直接拿来渲染会取不到 id
  const phrases: PhraseEntry[] = items.map((item, index) =>
    typeof item === "string" ? { id: `legacy-${index}`, text: item } : item,
  )

  const addPhrase = useCallback(
    (text: string) => {
      const value = text.trim()
      if (!value) return false
      setItems((list) => [{ id: makeId("p"), text: value }, ...list])
      return true
    },
    [setItems],
  )

  const removePhrase = useCallback(
    (id: string) => {
      setItems((list) => {
        // 先补齐历史 string[] 数据的 id，再按 id 删除，避免旧条目删不掉
        const normalized = list.map((item, index) =>
          typeof item === "string"
            ? { id: `legacy-${index}`, text: item }
            : item,
        )
        return normalized.filter((item) => item.id !== id)
      })
    },
    [setItems],
  )

  return { phrases, addPhrase, removePhrase } as const
}

/** 收藏夹条目：一条原文 + 一条译文 */
export type FavoriteEntry = {
  id: string
  original: string
  translated: string
  /** 源语言短名，如「中文」 */
  from: string
  /** 目标语言短名，如「英语」 */
  to: string
  time: string
}

/** 收藏夹：跨页面共享（记录详情、文本翻译、手册页都可收藏/取消） */
export function useFavorites() {
  const [items, setItems] = usePersistentState<FavoriteEntry[]>(
    "lingo.favorites",
    [],
  )

  const hasFavorite = useCallback(
    (original: string, translated: string) =>
      items.some(
        (item) => item.original === original && item.translated === translated,
      ),
    [items],
  )

  /** 收藏 / 取消收藏，返回操作后是否处于「已收藏」状态 */
  const toggleFavorite = useCallback(
    (input: Omit<FavoriteEntry, "id" | "time">) => {
      const exists = items.some(
        (item) =>
          item.original === input.original &&
          item.translated === input.translated,
      )
      if (exists) {
        setItems((list) =>
          list.filter(
            (item) =>
              !(
                item.original === input.original &&
                item.translated === input.translated
              ),
          ),
        )
        return false
      }
      setItems((list) => [
        { id: makeId("f"), time: nowLabel(), ...input },
        ...list,
      ])
      return true
    },
    [items, setItems],
  )

  const removeFavorite = useCallback(
    (id: string) => {
      setItems((list) => list.filter((item) => item.id !== id))
    },
    [setItems],
  )

  return { favorites: items, hasFavorite, toggleFavorite, removeFavorite } as const
}

export type VocabularyEntry = {
  id: string
  /** 词汇本身，如 LingoPods、Shibuya */
  term: string
  /** 分类，如 产品名称 / 地点 / 联系人姓名 */
  category: string
  /** 发音提示，参与识别时的权重说明 */
  note: string
}

export const vocabularyCategories = [
  "产品名称",
  "地点",
  "联系人姓名",
  "专业术语",
  "其他",
] as const

export const defaultVocabulary: VocabularyEntry[] = [
  {
    id: "v-lingopods",
    term: "LingoPods",
    category: "产品名称",
    note: "按英文发音，重音在第一个音节",
  },
  {
    id: "v-shibuya",
    term: "Shibuya",
    category: "地点",
    note: "涩谷 · 东京地名",
  },
  {
    id: "v-alex",
    term: "Alex Chen",
    category: "联系人姓名",
    note: "常用联系人",
  },
]

/**
 * 个人词汇表：用于提升语音识别与翻译准确率。
 * 数据持久化在本地，与「我的 → 个人词汇」面板双向同步。
 */
export function useVocabulary() {
  const [entries, setEntries] = usePersistentState<VocabularyEntry[]>(
    "lingo.vocabulary",
    defaultVocabulary,
  )

  const addEntry = useCallback(
    (entry: Omit<VocabularyEntry, "id">) => {
      const created: VocabularyEntry = {
        id: `v-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        ...entry,
      }
      setEntries((items) => [created, ...items])
      return created
    },
    [setEntries],
  )

  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<VocabularyEntry, "id">>) => {
      setEntries((items) =>
        items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      )
    },
    [setEntries],
  )

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((items) => items.filter((item) => item.id !== id))
    },
    [setEntries],
  )

  return { entries, addEntry, updateEntry, removeEntry } as const
}

/**
 * 多设备接入：记录当前与历史连接过的耳机，
 * 并维护每台设备的连接状态（已连接 / 连接中 / 已断开）。
 * 使用模块级共享 store，保证各页面（首页、我的、设备管理）实时同步。
 */

export type DeviceStatus = "connected" | "connecting" | "disconnected"

export type PairedDevice = {
  id: string
  /** 设备展示名，如 LingoPods Pro */
  name: string
  /** 设备型号 / 编号，如 LP-8821 */
  model: string
  status: DeviceStatus
  leftBattery: number
  rightBattery: number
  caseBattery: number
  /** 是否为当前用于翻译的活跃设备（同时只能有一台） */
  current: boolean
  /** 最近一次连接的可读时间，如「今天 09:24」「10 月 2 日」 */
  lastConnected: string
  /** 最近一次连接的毫秒时间戳，用于排序 */
  lastConnectedAt: number
}

const DAY = 24 * 60 * 60 * 1000

export const demoDevices: PairedDevice[] = [
  {
    id: "d-pro",
    name: "LingoPods Pro",
    model: "LP-8821",
    status: "connected" as DeviceStatus,
    leftBattery: 88,
    rightBattery: 84,
    caseBattery: 62,
    current: true,
    lastConnected: "今天 09:24",
    lastConnectedAt: Date.now(),
  },
  {
    id: "d-air",
    name: "LingoPods Air",
    model: "LP-5510",
    status: "disconnected" as DeviceStatus,
    leftBattery: 52,
    rightBattery: 50,
    caseBattery: 40,
    current: false,
    lastConnected: "10 月 2 日",
    lastConnectedAt: Date.now() - 6 * DAY,
  },
  {
    id: "d-mini",
    name: "LingoPods Mini",
    model: "LP-3300",
    status: "disconnected" as DeviceStatus,
    leftBattery: 20,
    rightBattery: 22,
    caseBattery: 15,
    current: false,
    lastConnected: "9 月 20 日",
    lastConnectedAt: Date.now() - 18 * DAY,
  },
]

// A fresh install has no paired hardware. The cards above are only fixtures for
// the opt-in interaction demo, never a real connection or a battery reading.
export const defaultDevices: PairedDevice[] = []

const DEVICES_KEY = "lingo.devices"

let devicesState: PairedDevice[] = (() => {
  try {
    const raw = window.localStorage.getItem(DEVICES_KEY)
    if (raw) return (JSON.parse(raw) as PairedDevice[]).map((device) => ({
      ...device,
      status: "disconnected" as DeviceStatus,
      leftBattery: 0,
      rightBattery: 0,
      caseBattery: 0,
    }))
  } catch {
    /* 解析失败时回退默认值 */
  }
  return defaultDevices
})()

const deviceListeners = new Set<() => void>()

function persistDevices() {
  try {
    window.localStorage.setItem(DEVICES_KEY, JSON.stringify(devicesState))
  } catch {
    /* 存储不可用时静默降级 */
  }
}

function setDevicesState(
  next: PairedDevice[] | ((prev: PairedDevice[]) => PairedDevice[]),
) {
  devicesState =
    typeof next === "function" ? (next as (prev: PairedDevice[]) => PairedDevice[])(devicesState) : next
  persistDevices()
  deviceListeners.forEach((listener) => listener())
}

/** 生成新设备编号，避免与已有冲突 */
function newDeviceId() {
  return `d-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`
}

const candidateModels = [
  { name: "LingoPods Neo", model: "LP-9000" },
  { name: "LingoPods Air 2", model: "LP-5520" },
  { name: "LingoPods Lite", model: "LP-2200" },
  { name: "LingoPods Studio", model: "LP-7700" },
]

export type UseDevicesResult = {
  devices: PairedDevice[]
  /** 当前活跃设备（current 优先，其次最近连接过的） */
  active: PairedDevice
  connect: (id: string) => void
  disconnect: (id: string) => void
  setCurrent: (id: string) => void
  removeDevice: (id: string) => void
  addDevice: (input?: { name?: string; model?: string }) => PairedDevice
}

export function useDevices(): UseDevicesResult {
  const subscribe = useCallback((listener: () => void) => {
    deviceListeners.add(listener)
    return () => {
      deviceListeners.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => devicesState, [])

  const devices = useSyncExternalStore(subscribe, getSnapshot)

  const connect = useCallback((id: string) => {
    setDevicesState((items) =>
      items.map((device) =>
        device.id === id ? { ...device, status: "connecting" as DeviceStatus } : device,
      ),
    )
    window.setTimeout(() => {
      setDevicesState((items) =>
        items.map((device) =>
          device.id === id
            ? {
                ...device,
                status: "connected" as DeviceStatus,
                lastConnected: nowLabel(),
                lastConnectedAt: Date.now(),
              }
            : device,
        ),
      )
    }, 1400)
  }, [])

  const disconnect = useCallback((id: string) => {
    setDevicesState((items) => {
      const target = items.find((device) => device.id === id)
      if (!target) return items
      const next = items.map((device) =>
        device.id === id ? { ...device, status: "disconnected" as DeviceStatus } : device,
      )
      if (target.current) {
        const fallback =
          next.find((device) => device.status === "connected") ?? next[0]
        if (fallback) {
          return next.map((device) =>
            device.id === fallback.id ? { ...device, current: true } : device,
          )
        }
      }
      return next
    })
  }, [])

  const setCurrent = useCallback((id: string) => {
    setDevicesState((items) => {
      const target = items.find((device) => device.id === id)
      if (!target) return items
      const next = items.map((device) => ({
        ...device,
        current: device.id === id,
        status:
          device.id === id && device.status === "disconnected"
            ? ("connecting" as DeviceStatus)
            : device.status,
      }))
      if (target.status === "disconnected") {
        window.setTimeout(() => {
          setDevicesState((list) =>
            list.map((device) =>
              device.id === id
                ? {
                    ...device,
                    status: "connected" as DeviceStatus,
                    lastConnected: nowLabel(),
                    lastConnectedAt: Date.now(),
                  }
                : device,
            ),
          )
        }, 1400)
      }
      return next
    })
  }, [])

  const removeDevice = useCallback((id: string) => {
    setDevicesState((items) => {
      const target = items.find((device) => device.id === id)
      const next = items.filter((device) => device.id !== id)
      if (target?.current) {
        const fallback =
          next.find((device) => device.status === "connected") ?? next[0]
        if (fallback) {
          return next.map((device) =>
            device.id === fallback.id ? { ...device, current: true } : device,
          )
        }
      }
      return next
    })
  }, [])

  const addDevice = useCallback((input?: { name?: string; model?: string }) => {
    const pick =
      input?.name && input?.model
        ? { name: input.name, model: input.model }
        : candidateModels[Math.floor(Math.random() * candidateModels.length)]
    const created: PairedDevice = {
      id: newDeviceId(),
      name: pick.name,
      model: pick.model,
      status: "connecting" as DeviceStatus,
      leftBattery: 100,
      rightBattery: 100,
      caseBattery: 100,
      current: true,
      lastConnected: nowLabel(),
      lastConnectedAt: Date.now(),
    }
    setDevicesState((items) =>
      items.map((device) => ({ ...device, current: false })).concat(created),
    )
    window.setTimeout(() => {
      setDevicesState((items) =>
        items.map((device) =>
          device.id === created.id
            ? { ...device, status: "connected" as DeviceStatus }
            : device,
        ),
      )
    }, 1400)
    return created
  }, [])

  const active: PairedDevice =
    devices.length > 0
      ? (devices.find((device) => device.current) ??
        devices.find((device) => device.status === "connected") ??
        devices[0])
      : {
          id: "",
          name: "—",
          model: "",
          status: "disconnected" as DeviceStatus,
          leftBattery: 0,
          rightBattery: 0,
          caseBattery: 0,
          current: false,
          lastConnected: "",
          lastConnectedAt: 0,
        }

  return {
    devices,
    active,
    connect,
    disconnect,
    setCurrent,
    removeDevice,
    addDevice,
  } as const
}

/**
 * 数据与隐私偏好：`save` 关闭后，会话与通话结束后不再自动写入记录。
 * 「我的 → 数据与隐私」面板与通话页共用同一份状态。
 */
export type PrivacyPrefs = {
  save: boolean
  improve: boolean
}

export const defaultPrivacy: PrivacyPrefs = { save: true, improve: false }

export function usePrivacyPrefs() {
  return usePersistentState<PrivacyPrefs>("lingo.privacy", defaultPrivacy)
}

/**
 * 设备侧偏好（自动连接 / 佩戴检测 / 触控）。
 * 原型无法下发到硬件，但作为用户偏好持久化，保证开关有真实状态。
 */
export type DevicePrefs = {
  autoConnect: boolean
  wear: boolean
  touch: boolean
}

export const defaultDevicePrefs: DevicePrefs = {
  autoConnect: true,
  wear: true,
  touch: true,
}

export type PlanState = {  source: "device" | "standalone" | "none"
  name: string
  autoRenew: boolean
  renewDate: string
  price: string
  /** 订阅渠道（设备赠送时为 null） */
  channel: ChannelId | null
  regionId: string
  currency: string
  /** 订阅周期 */
  period: "monthly" | "yearly"
  orderId: string | null
  purchasedAt: string | null
}

export const defaultPlan: PlanState = {
  source: "none",
  name: "Lingo+ Unlimited",
  autoRenew: false,
  renewDate: "",
  price: "¥0",
  channel: null,
  regionId: "CN",
  currency: "CNY",
  period: "yearly",
  orderId: null,
  purchasedAt: null,
}

/** 会员订阅状态（设备赠送 / 单独订阅 / 已到期） */
export function usePlan() {
  const [plan, setPlan] = usePersistentState<PlanState>("lingo.plan", defaultPlan)
  const current = { ...defaultPlan, ...plan }
  // Older demo data granted an unverified device subscription on first load.
  if (current.source === "device" && !current.purchasedAt) current.source = "none"
  return [current, setPlan] as const
}

export type Order = {
  id: string
  planName: string
  channelId: string
  channelName: string
  regionId: string
  regionName: string
  currency: string
  gross: string
  tax: string
  total: string
  taxLabel: string
  time: string
  status: "已付款" | "已退款"
}

/** 全球支付账单记录 */
export function useOrders() {
  return usePersistentState<Order[]>("lingo.orders", [])
}

/** 生成订单号 LP-YYMMDD-XXXX */
export function makeOrderId(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0")
  const date = `${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const tail = Math.floor(Math.random() * 9000 + 1000)
  return `LP-${date}-${tail}`
}

/** 把订单导出为可下载的发票文本 */
export function invoiceToText(order: Order) {
  return [
    "LingoPods · 订阅账单 / 发票",
    "",
    `订单号：${order.id}`,
    `方案：${order.planName}`,
    `支付渠道：${order.channelName}`,
    `计费地区：${order.regionName}（${order.currency}）`,
    `下单时间：${order.time}`,
    `状态：${order.status}`,
    "",
    "—— 费用明细 ——",
    `小计：${order.gross}`,
    `${order.taxLabel}：${order.tax}`,
    `实付：${order.total}`,
    "",
    "本发票由 LingoPods 自动生成，可用于报销与税务申报。",
    "如需增值税专用发票，请在「帮助与支持」中提交开票信息。",
  ].join("\n")
}

/** 将文本以文件形式下载到本地 */
export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 复制文本，失败时返回 false */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** 把记录导出为可读文本 */
export function recordToText(record: SavedRecord) {
  const lines = record.lines
    .map((line) => `${line.speaker}：${line.original}\n    ${line.translated}`)
    .join("\n")
  return [
    `标题：${record.title}`,
    `类型：${record.type}`,
    `信息：${record.meta}`,
    `时间：${record.time}`,
    "",
    `AI 摘要：${record.summary}`,
    "",
    "—— 双语转写 ——",
    lines || "（无转写内容）",
    "",
    "由 LingoPods 导出",
  ].join("\n")
}
