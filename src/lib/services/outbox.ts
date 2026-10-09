/**
 * 本地优先的同步发件箱。
 *
 * 写操作先落本地并进入发件箱，联网后按序补发；服务端是权威副本，
 * 冲突以服务端为准（拉取最新后覆盖本地对应记录）。
 * 没有配置服务端时只累积不发，界面据此如实显示「本地模式 / 待同步 N 条」。
 */

import { useCallback, useEffect, useState } from "react"
import { usePersistentState } from "@/lib/core"
import { ApiError, apiConfigured, describeApiError, request } from "@/lib/services/api"

export type OutboxOp = {
  id: string
  entity: "record" | "phrase" | "vocabulary" | "device"
  op: "upsert" | "delete"
  payload: Record<string, unknown>
  at: number
  attempts: number
}

export type SyncState = {
  online: boolean
  serverConfigured: boolean
  status: "idle" | "syncing" | "error"
  pending: number
  lastSyncedAt: number | null
  message: string
}

export function useOutbox() {
  const [ops, setOps] = usePersistentState<OutboxOp[]>("lingo.outbox", [])
  const [lastSyncedAt, setLastSyncedAt] = usePersistentState<number | null>(
    "lingo.synced-at",
    null,
  )
  const [status, setStatus] = useState<SyncState["status"]>("idle")
  const [message, setMessage] = useState("")
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  )

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener("online", up)
    window.addEventListener("offline", down)
    return () => {
      window.removeEventListener("online", up)
      window.removeEventListener("offline", down)
    }
  }, [])

  const enqueue = useCallback(
    (entity: OutboxOp["entity"], op: OutboxOp["op"], payload: Record<string, unknown>) => {
      setOps((items) => [
        ...items,
        {
          id: `${entity}-${payload.id ?? Date.now()}-${op}`,
          entity,
          op,
          payload,
          at: Date.now(),
          attempts: 0,
        },
      ])
    },
    [setOps],
  )

  const sync = useCallback(async () => {
    if (!apiConfigured()) {
      setStatus("idle")
      setMessage("当前为本地模式，未连接账户服务")
      return
    }
    if (!online) {
      setStatus("idle")
      setMessage("离线中，恢复网络后会自动同步")
      return
    }
    if (ops.length === 0) {
      setStatus("idle")
      setMessage("已是最新")
      return
    }

    setStatus("syncing")
    const remaining: OutboxOp[] = []
    for (const item of ops) {
      try {
        await request("/v1/sync", { method: "POST", body: item })
      } catch (error) {
        // 已被服务端判定为无效的条目不要再堆积，其余保留等下次重试
        if (error instanceof ApiError && error.kind === "client") continue
        remaining.push({ ...item, attempts: item.attempts + 1 })
        setStatus("error")
        setMessage(describeApiError(error))
      }
    }
    setOps(remaining)
    if (remaining.length === 0) {
      setLastSyncedAt(Date.now())
      setStatus("idle")
      setMessage("已同步")
    }
  }, [online, ops, setLastSyncedAt, setOps])

  const state: SyncState = {
    online,
    serverConfigured: apiConfigured(),
    status,
    pending: ops.length,
    lastSyncedAt,
    message,
  }

  return { ...state, enqueue, sync }
}
