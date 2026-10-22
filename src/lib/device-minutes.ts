import { useCallback, useRef } from "react"
import { usePersistentState } from "@/lib/core"

export const DEVICE_MINUTES_KEY = "lingo.device-minutes"
export const DEVICE_MINUTES_GRANT = 300

export type DeviceMinuteLedger = { remaining: number }

export const emptyDeviceMinuteLedger = (): DeviceMinuteLedger => ({
  remaining: DEVICE_MINUTES_GRANT,
})

export function consumeDeviceMinutes(
  ledger: DeviceMinuteLedger,
  amount: number,
): { ok: boolean; ledger: DeviceMinuteLedger } {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0
  if (ledger.remaining < safeAmount) return { ok: false, ledger }
  return { ok: true, ledger: { remaining: Math.max(0, ledger.remaining - safeAmount) } }
}

export function useDeviceMinutes(paid: boolean) {
  const [ledger, setLedger] = usePersistentState<DeviceMinuteLedger>(
    DEVICE_MINUTES_KEY,
    emptyDeviceMinuteLedger,
  )
  const remaining = Math.max(0, Math.min(DEVICE_MINUTES_GRANT, ledger.remaining))

  // 用 ref 记录最新余额，让 consume 的身份保持稳定：
  // 否则每次扣量都会改变回调引用，进而反复触发依赖它的翻译 effect（自动扣费死循环）。
  const ledgerRef = useRef(ledger)
  ledgerRef.current = ledger
  const paidRef = useRef(paid)
  paidRef.current = paid

  const consume = useCallback((amount: number) => {
    if (paidRef.current) return true
    const result = consumeDeviceMinutes(ledgerRef.current, amount)
    if (!result.ok) return false
    ledgerRef.current = result.ledger
    setLedger(result.ledger)
    return true
  }, [setLedger])

  return { remaining, allowed: paid || remaining > 0, consume }
}

export const estimateTextMinutes = (text: string) => Math.max(1 / 60, text.trim().length / 1200)

