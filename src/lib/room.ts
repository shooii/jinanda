/**
 * 邀请入会。
 *
 * 浏览器里没有信令服务就没法建立真实的音视频连接，所以这里不假装是通话：
 * 链接只做一件事——把「语言对」对齐。对方打开后进入同一语言组合，
 * 双方各自用自己的设备做识别 → 翻译 → 朗读，靠外放或耳机互相听见。
 *
 * 因此不需要服务端：房间信息全部编码在链接参数里。
 */

import { useEffect, useRef, useState } from "react"
import type { LangId } from "@/lib/translate"

export type RoomInvite = {
  roomId: string
  /** 邀请方（宿主）自己的语言 */
  hostLang: LangId
  /** 邀请方设定的对方语言 */
  guestLang: LangId
}

/** 由调用方传入它自己的语言对 setter */
export type PairSetters = {
  setMe: (lang: LangId) => void
  setThem: (lang: LangId) => void
}

const ROOM_PARAM = "room"

const isLang = (value: string | null): value is LangId =>
  !!value && /^[a-z]{2}$/.test(value)

/** 生成邀请链接：房间号 + 双方语言，全部在 URL 里 */
export function createInviteLink(hostLang: LangId, guestLang: LangId): string {
  const url = new URL(window.location.href)
  url.search = ""
  url.hash = ""
  url.searchParams.set(ROOM_PARAM, Math.random().toString(36).slice(2, 8))
  url.searchParams.set("a", hostLang)
  url.searchParams.set("b", guestLang)
  return url.toString()
}

export function readInviteFromUrl(): RoomInvite | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const roomId = params.get(ROOM_PARAM)
  const hostLang = params.get("a")
  const guestLang = params.get("b")
  if (!roomId || !isLang(hostLang) || !isLang(guestLang)) return null
  return { roomId, hostLang, guestLang }
}

/** 参数只用来对齐一次，随后从地址栏清掉，避免刷新重复应用 */
function clearInviteFromUrl() {
  const url = new URL(window.location.href)
  ;["a", "b", ROOM_PARAM].forEach((key) => url.searchParams.delete(key))
  window.history.replaceState(null, "", url.toString())
}

/**
 * 打开邀请链接时套用对方的语言组合。
 * 注意角色互换：宿主设定的「对方语言」就是我的母语。
 */
export function useRoomInvite(pair: PairSetters): RoomInvite | null {
  const [invite, setInvite] = useState<RoomInvite | null>(null)
  /**
   * 必须用调用方的 setter：usePersistentState 是「每个 hook 实例各自的 state」，
   * 不是共享 store，在自己内部再调一次 useLangPair 写入不会让界面刷新。
   */
  const pairRef = useRef(pair)
  pairRef.current = pair

  useEffect(() => {
    const found = readInviteFromUrl()
    if (!found) return
    pairRef.current.setMe(found.guestLang)
    pairRef.current.setThem(found.hostLang)
    setInvite(found)
    clearInviteFromUrl()
  }, [])

  return invite
}
