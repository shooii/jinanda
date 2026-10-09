/**
 * 会员权益与收据校验。
 *
 * 客户端只负责把「平台 + 收据」交给服务端，由服务端向 Apple / Google /
 * 三星 / 小米 / OPPO 的校验接口确认后再开通权益——客户端本地永远不作为
 * 权益的最终依据，否则等于把订阅白送。
 */

import { useEffect, useState } from "react"
import { ApiError, apiConfigured, request } from "@/lib/services/api"

export type EntitlementSource = "device" | "standalone" | "none"

export type Entitlement = {
  source: EntitlementSource
  planId: "monthly" | "yearly" | null
  /** 服务端下发的权益截止时间（ISO），未校验时为空 */
  expiresAt: string | null
  /** 是否已由服务端校验通过 */
  verified: boolean
}

export const LOCAL_ENTITLEMENT: Entitlement = {
  source: "none",
  planId: null,
  expiresAt: null,
  verified: false,
}

export type PurchaseReceipt = {
  channelId: string
  planId: "monthly" | "yearly"
  /** 平台返回的收据 / purchase token */
  receipt: string
  transactionId: string
}

/**
 * 提交收据并等待服务端校验结果。
 *
 * 本地模式（未配置服务端）会抛 not-configured，调用方应当明确告知用户
 * 「权益待服务端校验」，而不是直接当成功。
 */
export function verifyPurchase(receipt: PurchaseReceipt): Promise<Entitlement> {
  return request<Entitlement>("/v1/entitlements/verify", {
    method: "POST",
    body: receipt,
  })
}

/** 查询当前账号的权益状态 */
export function fetchEntitlement(): Promise<Entitlement> {
  return request<Entitlement>("/v1/entitlements")
}

export function useEntitlement() {
  const [entitlement, setEntitlement] = useState<Entitlement>(LOCAL_ENTITLEMENT)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!apiConfigured()) return
    setChecking(true)
    fetchEntitlement()
      .then(setEntitlement)
      .catch((cause) => {
        setError(cause instanceof ApiError ? cause.message : String(cause))
      })
      .finally(() => setChecking(false))
  }, [])

  return { entitlement, checking, error, serverConfigured: apiConfigured() }
}

/** 权益是否真的生效：必须由服务端校验过且在有效期内 */
export function entitlementActive(entitlement: Entitlement, now = Date.now()): boolean {
  if (!entitlement.verified) return false
  if (entitlement.source === "none") return false
  if (!entitlement.expiresAt) return false
  return Date.parse(entitlement.expiresAt) > now
}
