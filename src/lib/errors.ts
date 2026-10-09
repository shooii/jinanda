/**
 * 统一错误上报入口。
 *
 * 目前落到控制台并保留一份内存环形缓冲；接入真实监控（Sentry / 自建）时
 * 只需替换 reporter，所有调用点不用动。
 */

export type ErrorSource = "window" | "promise" | "react" | "manual"

export type ErrorReport = {
  message: string
  stack?: string
  source: ErrorSource
  detail?: Record<string, unknown>
  at: string
}

type Reporter = (report: ErrorReport) => void

const MAX_BUFFER = 50
const buffer: ErrorReport[] = []

let reporter: Reporter = (report) => {
  console.error(
    `[LingoPods] ${report.source}: ${report.message}`,
    report.detail ?? "",
  )
}

/** 替换上报实现，接入监控平台时调用 */
export function setErrorReporter(next: Reporter) {
  reporter = next
}

export function reportError(
  error: unknown,
  source: ErrorSource,
  detail?: Record<string, unknown>,
): ErrorReport {
  const report: ErrorReport = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    source,
    detail,
    at: new Date().toISOString(),
  }
  buffer.push(report)
  if (buffer.length > MAX_BUFFER) buffer.shift()
  try {
    reporter(report)
  } catch {
    // 上报本身失败不能影响主流程
  }
  return report
}

/** 最近若干条错误，供「问题诊断」展示 */
export function recentErrors(): ErrorReport[] {
  return [...buffer]
}

export function clearErrors() {
  buffer.length = 0
}

/** 安装全局兜底：未捕获异常与未处理的 Promise 拒绝 */
export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return
  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, "window")
  })
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, "promise")
  })
}
