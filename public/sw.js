/**
 * 离线外壳。
 *
 * 不引入 workbox：逻辑只有「预缓存外壳 + 运行时缓存构建产物」两件事，
 * 自己写更小也更可控。缓存名带版本号，升级时旧缓存整体清理。
 */

const VERSION = "lingopods-v1"
const SHELL = ["", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"]

const scoped = (path) => new URL(path, self.registration.scope).toString()

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION)
      // 逐个缓存：任何一个资源缺失都不应该让整个安装失败
      await Promise.allSettled(SHELL.map((path) => cache.add(scoped(path))))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 导航：网络优先，断网时退回外壳，保证离线也能打开
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          const cache = await caches.open(VERSION)
          cache.put(request, response.clone()).catch(() => {})
          return response
        } catch {
          const cache = await caches.open(VERSION)
          return (
            (await cache.match(request)) ??
            (await cache.match(scoped("index.html"))) ??
            Response.error()
          )
        }
      })(),
    )
    return
  }

  // 构建产物文件名带哈希，内容不会变：缓存优先，后台顺带更新
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION)
      const hit = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            cache.put(request, response.clone()).catch(() => {})
          }
          return response
        })
        .catch(() => hit ?? Response.error())
      return hit ?? network
    })(),
  )
})

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting()
})
