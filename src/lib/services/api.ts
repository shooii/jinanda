/**
 * 服务端客户端。
 *
 * 这一层只负责「怎么和后端说话」：地址、鉴权、超时、重试、错误分类。
 * 具体接口契约见 docs/api-contract.md。
 *
 * 未配置 VITE_API_BASE_URL 时（例如当前仓库的本地预览），客户端进入
 * 「本地模式」：所有请求都会以 not-configured 失败，由调用方明确降级，
 * 不会假装成功。
 */

export type ApiErrorKind =
  | "not-configured"
  | "network"
  | "timeout"
  | "unauthorized"
  | "conflict"
  | "server"
  | "client"

export class ApiError extends Error {
  kind: ApiErrorKind
  status: number
  code?: string

  constructor(kind: ApiErrorKind, message: string, status = 0, code?: string) {
    super(message)
    this.kind = kind
    this.status = status
    this.code = code
    this.name = "ApiError"
  }
}

export const apiBaseUrl = (): string =>
  String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")

export const apiConfigured = (): boolean => apiBaseUrl().length > 0

/* ------------------------------------------------------------------ 令牌 */

const TOKEN_KEY = "lingo.auth-token"
let token: string | null =
  typeof localStorage === "undefined" ? null : localStorage.getItem(TOKEN_KEY)

export const getToken = () => token

export function setToken(next: string | null) {
  token = next
  if (typeof localStorage === "undefined") return
  if (next) localStorage.setItem(TOKEN_KEY, next)
  else localStorage.removeItem(TOKEN_KEY)
}

/* ------------------------------------------------------------------ 请求 */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  timeoutMs?: number
  /** 幂等请求才重试，避免重复下单 */
  retries?: number
}

const DEFAULT_TIMEOUT = 12000
const RETRYABLE: ApiErrorKind[] = ["network", "timeout", "server"]

const classify = (status: number): ApiErrorKind => {
  if (status === 401 || status === 403) return "unauthorized"
  if (status === 409) return "conflict"
  if (status >= 500) return "server"
  return "client"
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = apiBaseUrl()
  if (!base) {
    throw new ApiError("not-configured", "未配置服务端地址，当前为本地模式")
  }

  const method = options.method ?? "GET"
  const maxAttempts = options.retries ?? (method === "GET" ? 2 : 0)
  let lastError: ApiError | null = null

  for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT)
    try {
      const response = await fetch(`${base}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      })
      clearTimeout(timer)

      if (!response.ok) {
        const detail = await response.text().catch(() => "")
        throw new ApiError(
          classify(response.status),
          detail || `请求失败（${response.status}）`,
          response.status,
        )
      }
      if (response.status === 204) return undefined as T
      return (await response.json()) as T
    } catch (error) {
      clearTimeout(timer)
      const apiError =
        error instanceof ApiError
          ? error
          : (error as Error)?.name === "AbortError"
            ? new ApiError("timeout", "请求超时")
            : new ApiError("network", "网络不可用")

      lastError = apiError
      const canRetry = RETRYABLE.includes(apiError.kind) && attempt < maxAttempts
      if (!canRetry) break
      // 指数退避，避免服务端抖动时一起打过去
      await sleep(300 * 2 ** attempt)
    }
  }

  throw lastError ?? new ApiError("network", "请求失败")
}

/** 把失败原因转成给用户看的短句 */
export function describeApiError(error: unknown): string {
  if (!(error instanceof ApiError)) return "操作失败，请重试"
  switch (error.kind) {
    case "not-configured":
      return "当前为本地模式，未连接账户服务"
    case "network":
      return "网络不可用，稍后会自动重试"
    case "timeout":
      return "请求超时，请重试"
    case "unauthorized":
      return "登录状态已失效，请重新登录"
    case "conflict":
      return "数据已在其他设备更新，已拉取最新版本"
    default:
      return "服务端暂时不可用，请稍后重试"
  }
}
