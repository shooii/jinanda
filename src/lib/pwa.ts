/**
 * PWA 接入：Service Worker 注册与在线状态。
 */

import { useEffect, useState } from "react"
import { reportError } from "@/lib/errors"

/** 注册 Service Worker。开发环境不注册，避免缓存干扰热更新。 */
export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
  if (!import.meta.env.PROD) return
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        // 注册失败不影响在线使用，但要能被监控看到
        reportError(error, "manual", { where: "service-worker-register" })
      })
    },
    { once: true },
  )
}

/** 设备在线状态，用于离线提示与阻断联网操作 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  )
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])
  return online
}
