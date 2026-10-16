/**
 * 专为耳机与临场设计的声学反馈与触觉震动 (Earcon & Haptic)
 * 使用标准 Web Audio API 纯合成，零额外静态资源，即调即播
 */

type EarconType = "ready" | "success" | "toggle" | "warning" | "sos"

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioCtx()
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => undefined)
  }
  return audioCtx
}

export function playEarcon(type: EarconType = "ready") {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 触觉反馈
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "ready") navigator.vibrate(35)
      else if (type === "success") navigator.vibrate([25, 40, 25])
      else if (type === "warning") navigator.vibrate([60, 60, 60])
      else if (type === "sos") navigator.vibrate([150, 80, 150, 80, 150])
      else navigator.vibrate(20)
    }

    if (type === "ready") {
      // 升调双音 "叮~"，提示开始聆听
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = "sine"
      osc1.frequency.setValueAtTime(587.33, now) // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5

      osc2.type = "triangle"
      osc2.frequency.setValueAtTime(880, now + 0.08)
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22) // D6

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.06)
      osc1.stop(now + 0.26)
      osc2.stop(now + 0.26)
    } else if (type === "success") {
      // 柔和确认双音
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(659.25, now) // E5
      osc.frequency.setValueAtTime(783.99, now + 0.08) // G5

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === "toggle") {
      // 短促点按音
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(440, now)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === "sos") {
      // 警示高亮音
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(987.77, now) // B5
      osc.frequency.linearRampToValueAtTime(1318.51, now + 0.15) // E6

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.3)
    }
  } catch {
    // 忽略音频初始化拦截
  }
}
