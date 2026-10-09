/**
 * 真实语音链路：麦克风采集 → 流式语音识别 → 机器翻译 → 语音合成。
 *
 * 整条链路都在浏览器内完成，不依赖自建后端：
 * - 采集：getUserMedia，并提供真实音量用于界面反馈
 * - 识别：Web Speech API，返回流式中间结果与最终结果
 * - 翻译：优先 Chrome 内置 Translator（端侧神经模型），不可用时退回本地词典
 * - 合成：speechSynthesis，按目标语言挑选音色
 */

import { bcp47, detectLang, translatePhrase, type LangId } from "@/lib/translate"

export { bcp47 }

/* ------------------------------------------------------------------ 能力探测 */

type AnyCtor = new () => any

const w = typeof window === "undefined" ? null : (window as any)

/** SpeechRecognition 构造器，外加 Chrome 在构造器上挂的端侧模型静态方法 */
type RecognitionCtorType = (new () => any) & {
  available?: (options: { langs: string[]; processLocally?: boolean }) => Promise<string>
  install?: (options: { langs: string[]; processLocally?: boolean }) => Promise<void>
}

const RecognitionCtor: RecognitionCtorType | null =
  w ? (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) : null
const TranslatorApi: any = w ? (w.Translator ?? null) : null

export type SpeechSupport = {
  /** 流式语音识别可用 */
  recognition: boolean
  /** 端侧神经翻译模型可用（否则退回本地词典） */
  translation: boolean
  /** 语音合成可用 */
  synthesis: boolean
  /** 麦克风采集可用 */
  mic: boolean
}

export function speechSupport(): SpeechSupport {
  return {
    recognition: !!RecognitionCtor,
    translation: !!TranslatorApi,
    synthesis: w ? "speechSynthesis" in w : false,
    mic: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
  }
}

/* ------------------------------------------------------------------ 麦克风采集 */

export type MicSession = {
  /** 0–1 的实时音量，可直接驱动界面动效 */
  level: number
  stop: () => void
}

/**
 * 打开麦克风并持续上报真实音量。
 * 采集与分析节点与识别并行运行，互不干扰。
 */
export async function openMic(onLevel?: (level: number) => void): Promise<MicSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })

  const Ctx: AnyCtor | null = w ? (w.AudioContext ?? w.webkitAudioContext ?? null) : null
  const session: MicSession = { level: 0, stop: () => stream.getTracks().forEach((t) => t.stop()) }
  if (!Ctx) return session

  const context = new Ctx()
  const source = context.createMediaStreamSource(stream)
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.75
  source.connect(analyser)

  const buffer = new Uint8Array(analyser.fftSize)
  let raf = 0
  let stopped = false

  const tick = () => {
    if (stopped) return
    analyser.getByteTimeDomainData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i += 1) {
      const v = (buffer[i] - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / buffer.length)
    // 轻微放大，让正常说话音量就能驱动动效
    const level = Math.min(1, rms * 3.4)
    session.level = level
    onLevel?.(level)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  session.stop = () => {
    stopped = true
    cancelAnimationFrame(raf)
    source.disconnect()
    stream.getTracks().forEach((t) => t.stop())
    void context.close().catch(() => undefined)
  }
  return session
}

/* ------------------------------------------------------------------ 流式识别 */

export type RecognitionHandlers = {
  /** 流式中间结果，用于实时字幕 */
  onInterim?: (text: string) => void
  /** 一句说完后的最终结果 */
  onFinal: (text: string) => void
  /** 失败原因分类，便于界面给出可执行的提示 */
  onError?: (reason: RecognitionErrorReason, code?: string) => void
  /** 本次识别会话结束（无论成功与否） */
  onEnd?: () => void
}

export type RecognitionErrorReason =
  /** 权限被拒绝 */
  | "denied"
  /** 浏览器不支持识别 */
  | "unsupported"
  /** 识别服务连不上（通常是网络） */
  | "network"
  /** 找不到可用的麦克风 */
  | "nocapture"
  /** 该语言不支持识别 */
  | "lang"
  /** 没听到说话 */
  | "silent"
  /** 其他失败 */
  | "failed"

/** 把失败原因转成可执行的提示文案 */
export function describeRecognitionError(
  reason: RecognitionErrorReason,
  code?: string | null,
): string {
  switch (reason) {
    case "denied":
      return "缺少麦克风权限，请在浏览器地址栏允许后重试"
    case "unsupported":
      return "当前浏览器不支持语音识别，请改用 Chrome 或 Edge"
    case "network":
      return "语音识别服务连接失败，请检查网络后重试"
    case "nocapture":
      return "没有找到可用的麦克风"
    case "lang":
      return "当前语言暂不支持语音识别"
    case "silent":
      return "没有听到声音，请靠近麦克风再说一次"
    default:
      return code ? `识别失败（${code}），请重试` : "识别失败，请重试"
  }
}

export type RecognitionSession = {
  stop: () => void
}

/** 单次识别最多等待多久还没听到内容就判定为「没听到」 */
const SILENCE_TIMEOUT = 9000

/**
 * 开始一次「说一句」识别：拿到第一个最终结果后自动结束。
 * 与点按说话的交互一致，因此不做无限重启。
 */
export function startRecognition(
  lang: LangId,
  handlers: RecognitionHandlers,
  options?: { ondevice?: boolean },
): RecognitionSession | null {
  if (!RecognitionCtor) {
    handlers.onError?.("unsupported")
    return null
  }

  const recognition = new RecognitionCtor()
  recognition.lang = bcp47(lang)
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1
  // 端侧模型可用时强制本地识别：不走网络，也就没有云服务连通性问题
  if (options?.ondevice) recognition.processLocally = true

  let settled = false
  let sawSpeech = false
  let silenceTimer = 0

  const finish = () => {
    if (settled) return
    settled = true
    window.clearTimeout(silenceTimer)
    try {
      recognition.abort()
    } catch {
      /* 已结束时会抛错，忽略 */
    }
    handlers.onEnd?.()
  }

  recognition.onresult = (event: any) => {
    let interim = ""
    let final = ""
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i]
      const text = result[0]?.transcript ?? ""
      if (result.isFinal) final += text
      else interim += text
    }
    if (interim) {
      sawSpeech = true
      window.clearTimeout(silenceTimer)
      handlers.onInterim?.(interim.trim())
    }
    if (final.trim()) {
      sawSpeech = true
      const text = final.trim()
      settled = true
      window.clearTimeout(silenceTimer)
      handlers.onFinal(text)
      try {
        recognition.abort()
      } catch {
        /* 忽略 */
      }
      handlers.onEnd?.()
    }
  }

  recognition.onerror = (event: any) => {
    const code = event?.error ?? ""
    if (code === "aborted") return
    if (code === "no-speech") {
      if (!sawSpeech) handlers.onError?.("silent", code)
      finish()
      return
    }
    const reason: RecognitionErrorReason =
      code === "not-allowed" || code === "service-not-allowed"
        ? "denied"
        : code === "network"
          ? "network"
          : code === "audio-capture"
            ? "nocapture"
            : code === "language-not-supported"
              ? "lang"
              : "failed"
    handlers.onError?.(reason, code)
    finish()
  }

  recognition.onend = () => finish()

  try {
    recognition.start()
  } catch {
    handlers.onError?.("failed", "start-failed")
    return null
  }

  silenceTimer = window.setTimeout(() => {
    if (!sawSpeech) handlers.onError?.("silent", "timeout")
    finish()
  }, SILENCE_TIMEOUT)

  return { stop: finish }
}

/* -------------------------------------------------------------- 端侧识别模型 */

export type RecognitionEngine = "ondevice" | "remote"

const recognitionPrep = new Map<string, Promise<RecognitionEngine>>()

/**
 * 准备语音识别引擎，优先启用端侧模型。
 *
 * Chrome 要求模型下载必须在用户手势内发起，而 available() 是异步的、会把手势
 * 用掉，所以这里把 install() 放在异步函数体最前面同步调用——这样从麦克风按钮的
 * 点击处理函数里调用本函数即可保住手势。
 */
export function prepareRecognition(lang: LangId): Promise<RecognitionEngine> {
  const install = RecognitionCtor?.install
  const available = RecognitionCtor?.available
  if (typeof install !== "function") {
    return Promise.resolve("remote")
  }
  const tag = bcp47(lang)
  const cached = recognitionPrep.get(tag)
  if (cached) return cached

  const prep = (async (): Promise<RecognitionEngine> => {
    try {
      await install({ langs: [tag], processLocally: true })
      return "ondevice"
    } catch {
      // 已经装好时会抛错，再用 available() 确认一次状态
      try {
        const state = typeof available === "function"
          ? await available({ langs: [tag], processLocally: true })
          : "unavailable"
        return state === "available" ? "ondevice" : "remote"
      } catch {
        return "remote"
      }
    }
  })()

  recognitionPrep.set(tag, prep)
  prep.catch(() => recognitionPrep.delete(tag))
  return prep
}

/* ------------------------------------------------------------------ 机器翻译 */

export type TranslateEngine = "neural" | "dictionary"

export type TranslateResult = {
  text: string
  engine: TranslateEngine
}

type TranslatorInstance = {
  translate: (text: string) => Promise<string>
  destroy?: () => void
}

const translators = new Map<string, Promise<TranslatorInstance>>()
const pairKey = (from: LangId, to: LangId) => `${from}->${to}`

/**
 * 预加载翻译模型。
 *
 * Chrome 要求「模型尚需下载」时必须在用户手势内发起创建，因此这个函数要在
 * 点击处理函数里直接调用（不要先 await 别的东西），创建请求会同步发出。
 */
export function prepareTranslation(from: LangId, to: LangId): Promise<TranslatorInstance | null> {
  if (!TranslatorApi || from === to) return Promise.resolve(null)
  const key = pairKey(from, to)
  const cached = translators.get(key)
  if (cached) return cached

  const created = (async () => {
    const instance = await TranslatorApi.create({
      sourceLanguage: from,
      targetLanguage: to,
    })
    return instance as TranslatorInstance
  })()
  translators.set(key, created)
  created.catch(() => translators.delete(key))
  return created
}

/** 模型是否已经就绪，用于界面上区分「正在加载模型」与「正在翻译」 */
export function isTranslationReady(from: LangId, to: LangId): boolean {
  return translators.has(pairKey(from, to))
}

/**
 * 翻译一句。优先端侧神经模型，失败或不可用时退回本地词典，
 * 由 engine 字段标明本次实际使用的引擎。
 */
export async function translateText(
  text: string,
  from: LangId,
  to: LangId,
): Promise<TranslateResult> {
  const source = text.trim()
  if (!source) return { text: "", engine: "dictionary" }
  if (from === to) return { text: source, engine: "dictionary" }

  if (TranslatorApi) {
    try {
      const instance = await prepareTranslation(from, to)
      if (instance) {
        const out = await instance.translate(source)
        if (out && out.trim()) return { text: out.trim(), engine: "neural" }
      }
    } catch {
      /* 模型不可用：退回词典，不打断对话 */
    }
  }

  return { text: translatePhrase(source, from, to).text, engine: "dictionary" }
}

/** 语种识别：先用脚本启发式判断，够用且不需要额外下载模型 */
export function detectSpeechLang(text: string, fallback: LangId): LangId {
  return detectLang(text) ?? fallback
}

/* ------------------------------------------------------------------ 语音合成 */

let cachedVoices: SpeechSynthesisVoice[] = []

if (w?.speechSynthesis) {
  const load = () => {
    cachedVoices = w.speechSynthesis.getVoices() ?? []
  }
  load()
  // Chrome 首次返回空数组，音色随后异步就绪
  w.speechSynthesis.addEventListener?.("voiceschanged", load)
}

function pickVoice(lang: LangId): SpeechSynthesisVoice | null {
  const want = bcp47(lang).toLowerCase()
  const base = want.split("-")[0]
  const voices: SpeechSynthesisVoice[] = cachedVoices.length
    ? cachedVoices
    : ((w?.speechSynthesis?.getVoices() ?? []) as SpeechSynthesisVoice[])
  return (
    voices.find((v) => v.lang?.toLowerCase() === want) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(base)) ??
    null
  )
}

export type SpeakHandle = { cancel: () => void }

/** 朗读译文；返回句柄用于打断 */
export function speakText(
  text: string,
  lang: LangId,
  onEnd?: () => void,
): SpeakHandle | null {
  const synth = w?.speechSynthesis
  if (!synth || !text.trim()) return null
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.lang = bcp47(lang)
  utterance.rate = 1
  const done = () => onEnd?.()
  utterance.onend = done
  utterance.onerror = done
  synth.speak(utterance)
  return { cancel: () => synth.cancel() }
}

export function stopSpeaking() {
  w?.speechSynthesis?.cancel()
}
