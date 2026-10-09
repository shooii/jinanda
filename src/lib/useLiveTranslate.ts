/**
 * 把「麦克风 → 流式识别 → 翻译 → 朗读」这条真实链路封装成一个 hook，
 * 供面对面对话与手机免提对话共用。
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  detectSpeechLang,
  openMic,
  prepareRecognition,
  prepareTranslation,
  speakText,
  speechSupport,
  startRecognition,
  stopSpeaking,
  translateText,
  type MicSession,
  type RecognitionErrorReason,
  type RecognitionSession,
  type TranslateEngine,
} from "@/lib/speech"
import type { LangId } from "@/lib/translate"

export type LiveSide = "me" | "them"

/** idle → preparing（加载模型 / 打开麦克风）→ listening → translating → idle */
export type LiveStatus = "idle" | "preparing" | "listening" | "translating"

export type LiveTurn = {
  id: number
  who: LiveSide
  original: string
  translated: string
  engine: TranslateEngine
}

export type LiveError = RecognitionErrorReason | null

type Options = {
  meLang: LangId
  themLang: LangId
  /** 识别到结果后自动朗读译文 */
  autoSpeak: boolean
  /** "pick"：由用户指定谁在说；"auto"：按识别到的语种判断 */
  mode: "pick" | "auto"
  onTurn: (turn: LiveTurn) => void
}

export type LiveTranslate = {
  status: LiveStatus
  /** 正在拾音的一方；auto 模式下由识别结果决定 */
  activeSide: LiveSide | null
  /** 流式识别的中间结果 */
  interim: string
  /** 0–1 的实时音量 */
  level: number
  error: LiveError
  /** 底层错误码，便于排查 */
  errorCode: string | null
  support: ReturnType<typeof speechSupport>
  start: (side: LiveSide | "auto") => void
  stop: () => void
}

export function useLiveTranslate({
  meLang,
  themLang,
  autoSpeak,
  mode,
  onTurn,
}: Options): LiveTranslate {
  const [status, setStatus] = useState<LiveStatus>("idle")
  const [activeSide, setActiveSide] = useState<LiveSide | null>(null)
  const [interim, setInterim] = useState("")
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<LiveError>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  // 同步镜像：start/stop 在同一次事件里连续调用时，state 还来不及更新
  const statusRef = useRef<LiveStatus>("idle")
  const micRef = useRef<MicSession | null>(null)
  /** 会话结束后，迟到的麦克风流要立刻关掉 */
  const acceptMicRef = useRef(false)
  const recogRef = useRef<RecognitionSession | null>(null)
  const lastSideRef = useRef<LiveSide>("me")
  /** 识别已结束但翻译仍在进行，此时不能把状态重置为 idle */
  const translatingRef = useRef(false)
  const lastLevelUpdate = useRef(0)

  const langRef = useRef({ meLang, themLang })
  langRef.current = { meLang, themLang }
  const speakRef = useRef(autoSpeak)
  speakRef.current = autoSpeak
  const modeRef = useRef(mode)
  modeRef.current = mode
  const turnRef = useRef(onTurn)
  turnRef.current = onTurn

  const applyStatus = useCallback((next: LiveStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  /** 用函数包一层，避免 ref 上的类型收窄在 await 之后失效 */
  const isIdle = useCallback(() => statusRef.current === "idle", [])

  const closeMic = useCallback(() => {
    acceptMicRef.current = false
    micRef.current?.stop()
    micRef.current = null
    setLevel(0)
  }, [])

  const teardown = useCallback(() => {
    recogRef.current?.stop()
    recogRef.current = null
    translatingRef.current = false
    stopSpeaking()
    setInterim("")
    setActiveSide(null)
  }, [])

  const stop = useCallback(() => {
    teardown()
    applyStatus("idle")
  }, [applyStatus, teardown])

  useEffect(() => () => teardown(), [teardown])

  const start = useCallback(
    (requested: LiveSide | "auto") => {
      // 已经在跑：再点一次就是停止
      if (statusRef.current !== "idle") {
        stop()
        return
      }

      const { meLang: me, themLang: them } = langRef.current
      const wanted: LiveSide = requested === "auto" ? lastSideRef.current : requested

      setError(null)
      setErrorCode(null)
      setInterim("")
      translatingRef.current = false
      applyStatus("preparing")
      setActiveSide(requested === "auto" ? null : wanted)

      // 必须在用户手势内同步发起模型创建，Chrome 才允许下载端侧模型
      if (modeRef.current === "auto") {
        void prepareTranslation(me, them)
        void prepareTranslation(them, me)
      } else {
        void prepareTranslation(wanted === "me" ? me : them, wanted === "me" ? them : me)
      }

      // 麦克风只用于音量反馈，不阻塞识别：授权弹窗还没点，识别照样先跑起来
      acceptMicRef.current = true
      void openMic((next) => {
        const now = performance.now()
        if (now - lastLevelUpdate.current < 80) return
        lastLevelUpdate.current = now
        setLevel(next)
      })
        .then((session) => {
          if (!acceptMicRef.current) {
            session.stop()
            return
          }
          micRef.current = session
        })
        .catch(() => undefined)

      void (async () => {
        if (isIdle()) return

        const langOf = (side: LiveSide) => (side === "me" ? me : them)
        const speechLang = langOf(wanted)
        // 端侧识别优先：模型没装过时会在这里完成下载
        const engine = await prepareRecognition(speechLang)
        if (isIdle()) return

        const session = startRecognition(speechLang, {
          onInterim: (text) => setInterim(text),
          onFinal: (text) => {
            setInterim("")
            translatingRef.current = true
            applyStatus("translating")

            void (async () => {
              // auto 模式：谁说的一律以识别出的语种为准
              const detected = detectSpeechLang(text, langOf(wanted))
              const side: LiveSide =
                modeRef.current === "auto"
                  ? detected === me
                    ? "me"
                    : detected === them
                      ? "them"
                      : lastSideRef.current
                  : wanted
              const from = side === "me" ? me : them
              const to = side === "me" ? them : me
              lastSideRef.current = side
              setActiveSide(side)

              const result =
                from === to
                  ? { text, engine: "dictionary" as TranslateEngine }
                  : await translateText(text, from, to)

              turnRef.current({
                id: Date.now(),
                who: side,
                original: text,
                translated: result.text,
                engine: result.engine,
              })
              if (speakRef.current) speakText(result.text, to)

              translatingRef.current = false
              stop()
            })()
          },
          onError: (reason, code) => {
            setError(reason)
            setErrorCode(code ?? null)
          },
          onEnd: () => {
            // 识别会话结束：先收回麦克风，翻译还在进行时不要把状态清成 idle
            closeMic()
            setInterim("")
            if (!translatingRef.current) {
              setActiveSide(null)
              applyStatus("idle")
            }
          },
        }, { ondevice: engine === "ondevice" })

        if (!session) {
          closeMic()
          applyStatus("idle")
          return
        }
        recogRef.current = session
        if (statusRef.current === "preparing") applyStatus("listening")
      })()
    },
    [applyStatus, closeMic, isIdle, stop],
  )

  return {
    status,
    activeSide,
    interim,
    level,
    error,
    errorCode,
    support: speechSupport(),
    start,
    stop,
  }
}

