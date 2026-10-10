/**
 * 离线语言包：浏览器端侧模型的真实状态与下载。
 *
 * 这里不伪造任何数据：
 * - 状态来自 `SpeechRecognition.available()` 与 `Translator.availability()`
 * - 下载由 `SpeechRecognition.install()` / `Translator.create()` 真正触发，
 *   百分比来自浏览器的 `downloadprogress` 事件（拿不到事件时只显示进行中）
 * - 端侧模型由浏览器下载、缓存与更新，App 读不到它们的磁盘占用，
 *   所以界面上不出现任何「已用 1.2 GB」之类的编造数字
 *
 * 一个「语言包」＝ 该语言的语音识别包 + 我的语言↔该语言的双向翻译模型。
 * 首次下载会顺带装好「我的语言」的识别包，否则离线对话只有一半能用。
 */

import { bcp47, type LangId } from "@/lib/translate"

/** 单项端侧能力的状态 */
export type CapState = "installed" | "downloadable" | "downloading" | "unsupported"

export type PackCapabilities = {
  /** 语音识别包 */
  recognition: CapState
  /** 双向翻译模型 */
  translation: CapState
}

export type PackEntry = {
  /** null = 尚未探测 */
  capabilities: PackCapabilities | null
  /** 0–1，仅下载中有意义；拿不到进度时保持 0 */
  progress: number
  downloading: boolean
  /**
   * 部分完成：还有模型没装，但原因是浏览器「一次用户手势只能触发一次模型下载」，
   * 不是真的失败。界面提示用户再点一次即可继续。
   */
  partial: boolean
  failed: boolean
  /** 失败原因（诊断用，界面上仍只显示通用文案） */
  errorText: string
}

const EMPTY_ENTRY: PackEntry = {
  capabilities: null,
  progress: 0,
  downloading: false,
  partial: false,
  failed: false,
  errorText: "",
}

/* ------------------------------------------------------------ 浏览器能力探测 */

type RecognitionCtorType = (new () => any) & {
  available?: (options: { langs: string[]; processLocally?: boolean }) => Promise<string>
  install?: (options: { langs: string[]; processLocally?: boolean }) => Promise<void>
}

type TranslatorApiType = {
  availability?: (options: {
    sourceLanguage: string
    targetLanguage: string
  }) => Promise<string>
  create?: (options: {
    sourceLanguage: string
    targetLanguage: string
    monitor?: (monitor: EventTarget) => void
  }) => Promise<{ destroy?: () => void } | null>
}

const win =
  typeof window === "undefined"
    ? null
    : (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown; Translator?: unknown })

const RecognitionCtor = (win?.SpeechRecognition ??
  win?.webkitSpeechRecognition ??
  null) as RecognitionCtorType | null
const TranslatorApi = (win?.Translator ?? null) as TranslatorApiType | null

/** 当前浏览器具备的端侧能力 */
export function offlineSupport(): { recognition: boolean; translation: boolean } {
  return {
    recognition:
      typeof RecognitionCtor?.available === "function" &&
      typeof RecognitionCtor?.install === "function",
    translation:
      typeof TranslatorApi?.availability === "function" &&
      typeof TranslatorApi?.create === "function",
  }
}

/** 只要有一项端侧能力可用，离线语言包页就有意义 */
export function offlinePacksSupported(): boolean {
  const support = offlineSupport()
  return support.recognition || support.translation
}

/** 浏览器的可用性字符串 → 界面状态。兼容新旧两套取值。 */
function toCapState(value: unknown): CapState {
  switch (value) {
    case "available":
    case "readily":
      return "installed"
    case "downloadable":
    case "after-download":
      return "downloadable"
    case "downloading":
      return "downloading"
    default:
      return "unsupported"
  }
}

/** 两个状态取「更差」的一个，用于汇总识别 / 翻译两项能力 */
function worst(a: CapState, b: CapState): CapState {
  const rank: Record<CapState, number> = {
    installed: 0,
    downloading: 1,
    downloadable: 2,
    unsupported: 3,
  }
  return rank[a] >= rank[b] ? a : b
}

/* ------------------------------------------------------------------- 状态仓库 */

type Listener = () => void

const listeners = new Set<Listener>()
const entries = new Map<string, PackEntry>()
let snapshot: Record<string, PackEntry> = {}

const keyOf = (mine: LangId, lang: LangId) => `${mine}>${lang}`

function emit() {
  snapshot = Object.fromEntries(entries)
  listeners.forEach((listener) => listener())
}

function patch(key: string, next: Partial<PackEntry>) {
  const prev = entries.get(key) ?? EMPTY_ENTRY
  entries.set(key, { ...prev, ...next })
  emit()
}

export function subscribePacks(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function packsSnapshot(): Record<string, PackEntry> {
  return snapshot
}

export function packEntry(
  all: Record<string, PackEntry>,
  mine: LangId,
  lang: LangId,
): PackEntry {
  return all[keyOf(mine, lang)] ?? EMPTY_ENTRY
}

/* ------------------------------------------------------------------- 状态探测 */

const probePromises = new Map<string, Promise<PackCapabilities>>()

async function readCapabilities(mine: LangId, lang: LangId): Promise<PackCapabilities> {
  const support = offlineSupport()

  let recognition: CapState = "unsupported"
  if (support.recognition) {
    try {
      const target = await RecognitionCtor!.available!({
        langs: [bcp47(lang)],
        processLocally: true,
      })
      const own = await RecognitionCtor!.available!({
        langs: [bcp47(mine)],
        processLocally: true,
      })
      recognition = worst(toCapState(target), toCapState(own))
    } catch {
      recognition = "unsupported"
    }
  }

  let translation: CapState = "unsupported"
  if (support.translation) {
    try {
      // 双向都要能译，取更差的一侧
      const forward = toCapState(
        await TranslatorApi!.availability!({
          sourceLanguage: mine,
          targetLanguage: lang,
        }),
      )
      const backward = toCapState(
        await TranslatorApi!.availability!({
          sourceLanguage: lang,
          targetLanguage: mine,
        }),
      )
      translation = worst(forward, backward)
    } catch {
      translation = "unsupported"
    }
  }

  return { recognition, translation }
}

/** 探测一个语言包的真实状态并写入仓库（带缓存，重复挂载不会重复探测） */
export function probePack(mine: LangId, lang: LangId, force = false): Promise<PackCapabilities> {
  const key = keyOf(mine, lang)
  if (force) probePromises.delete(key)
  const cached = probePromises.get(key)
  if (cached) return cached

  const task = readCapabilities(mine, lang)
    .then((capabilities) => {
      patch(key, { capabilities })
      return capabilities
    })
    .catch((error) => {
      probePromises.delete(key)
      throw error
    })

  probePromises.set(key, task)
  return task
}

/* --------------------------------------------------------------------- 下载 */

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

/** 翻译模型：为某对语言准备端侧模型，onProgress 来自浏览器的下载事件 */
async function ensureTranslator(
  from: LangId,
  to: LangId,
  onProgress: (value: number) => void,
): Promise<void> {
  if (!TranslatorApi?.create || from === to) return
  // 注意：create() 必须在用户手势内同步发起，否则 Chrome 拒绝下载模型
  const created = TranslatorApi.create({
    sourceLanguage: from,
    targetLanguage: to,
    monitor: (monitor) => {
      monitor.addEventListener("downloadprogress", (event) => {
        const loaded = (event as unknown as { loaded?: number }).loaded
        if (typeof loaded === "number") onProgress(clamp01(loaded))
      })
    },
  })
  const instance = await created
  // 模型装好即可，实例不需要常驻（真正翻译时 speech.ts 会自己创建）
  instance?.destroy?.()
}

/** 语音识别包 */
async function ensureRecognition(langs: LangId[]): Promise<void> {
  if (!RecognitionCtor?.install) return
  const tags = [...new Set(langs.map((lang) => bcp47(lang)))]
  try {
    await RecognitionCtor.install({ langs: tags, processLocally: true })
  } catch (error) {
    // 已经装好时 install 会抛错，用 available 再确认一次
    const states = await Promise.all(
      tags.map((tag) =>
        RecognitionCtor!.available?.({ langs: [tag], processLocally: true }).catch(
          () => "unavailable",
        ) ?? Promise.resolve("unavailable"),
      ),
    )
    if (states.every((state) => toCapState(state) === "installed")) return
    // 保留原始报错，便于区分「用户手势用尽」「并发下载被拒」等原因
    throw error instanceof Error ? error : new Error("recognition-install-failed")
  }
}

type DownloadPiece = {
  /** 用来在日志里区分是哪一项 */
  label: string
  run: (report: (value: number) => void) => Promise<void>
}

/**
 * 下载一个语言包。
 *
 * 必须在点击处理函数里同步调用（不能先 await 别的异步操作），
 * 否则用户手势被用掉，浏览器会拒绝模型下载。
 *
 * 浏览器限制「一次用户手势只能触发一次模型下载」：第 1 项下载完，
 * 第 2 项再调用会立刻抛 NotAllowedError。所以这里逐项串行执行，
 * 遇到这个错误就停下来标记「部分完成」，由用户再点一次继续，
 * 而不是把它当成失败或假装已经装好。
 */
export function startPackDownload(mine: LangId, lang: LangId): void {
  const key = keyOf(mine, lang)
  if (entries.get(key)?.downloading) return

  const support = offlineSupport()
  const pieces: DownloadPiece[] = []

  if (support.translation) {
    pieces.push({
      label: `translation ${mine}→${lang}`,
      run: (report) => ensureTranslator(mine, lang, report),
    })
    if (mine !== lang) {
      pieces.push({
        label: `translation ${lang}→${mine}`,
        run: (report) => ensureTranslator(lang, mine, report),
      })
    }
  }
  if (support.recognition) {
    pieces.push({
      label: `recognition ${lang}`,
      run: () => ensureRecognition([lang, mine]),
    })
  }
  if (!pieces.length) return

  patch(key, { downloading: true, partial: false, failed: false, progress: 0, errorText: "" })

  void (async () => {
    // 第一项在用户手势内同步发起（async 函数体在首个 await 前是同步执行的）
    let pending = false
    let failure = ""

    for (const piece of pieces) {
      try {
        await piece.run((value) => patch(key, { progress: clamp01(value) }))
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          // 手势已用尽：剩下的留给下一次点击，不算失败
          pending = true
        } else {
          failure = String(error)
          pending = true
        }
        console.warn(
          `[offline-packs] ${mine}→${lang} 在「${piece.label}」处中断：`,
          String(error),
        )
        break
      }
      patch(key, { progress: 0 })
    }

    patch(key, {
      downloading: false,
      partial: pending,
      failed: Boolean(failure),
      progress: 0,
      errorText: failure,
    })
    await probePack(mine, lang, true).catch(() => undefined)
  })()
}
