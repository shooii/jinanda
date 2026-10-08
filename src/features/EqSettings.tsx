import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export const eqBands = ["60Hz", "250Hz", "1kHz", "4kHz", "8kHz", "16kHz"]

type EqPresetId =
  | "flat"
  | "pop"
  | "rock"
  | "vocal"
  | "classical"
  | "bass"
  | "custom"

export type EqState = {
  enabled: boolean
  preset: EqPresetId
  bands: number[]
}

const presetList: {
  id: EqPresetId
  label: string
  bands: number[]
}[] = [
  { id: "flat", label: "原声", bands: [0, 0, 0, 0, 0, 0] },
  { id: "pop", label: "流行", bands: [-1, 2, 4, 3, 1, 0] },
  { id: "rock", label: "摇滚", bands: [4, 2, -1, 2, 3, 4] },
  { id: "vocal", label: "人声", bands: [-2, 0, 3, 4, 2, 0] },
  { id: "classical", label: "古典", bands: [3, 1, 0, 1, 2, 3] },
  { id: "bass", label: "低音增强", bands: [6, 5, 2, 0, 0, 0] },
]

export const defaultEq: EqState = {
  enabled: true,
  preset: "pop",
  bands: presetList.find((item) => item.id === "pop")!.bands,
}

export function eqPresetLabel(state: EqState) {
  if (!state.enabled) return "已关闭"
  if (state.preset === "custom") return "自定义"
  return presetList.find((item) => item.id === state.preset)?.label ?? "原声"
}

export function EqSettings({
  onClose,
  eq,
  onChange,
}: {
  onClose: () => void
  eq: EqState
  onChange: (eq: EqState) => void
}) {
  const [dragging, setDragging] = useState(false)

  useEscapeKey(onClose)

  const setBand = (index: number, value: number) => {
    const bands = eq.bands.map((band, i) => (i === index ? value : band))
    const matched = presetList.find(
      (item) =>
        item.id !== "flat" && item.bands.every((band, i) => band === bands[i]),
    )
    const stillFlat = bands.every((band) => band === 0)
    onChange({
      ...eq,
      bands,
      preset: matched ? matched.id : stillFlat ? "flat" : "custom",
    })
  }

  const applyPreset = (id: EqPresetId) => {
    const preset = presetList.find((item) => item.id === id)
    if (!preset) return
    onChange({ ...eq, preset: id, bands: [...preset.bands] })
  }

  return (
    <div
      className="eq-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="EQ 均衡器设置"
    >
      <header className="find-header">
        <AppButton
          ariaLabel="关闭均衡器设置"
          className="find-close"
          onClick={onClose}
        >
          <Icon name="close" size={19} />
        </AppButton>
        <div>
          <strong>EQ 均衡器</strong>
          <small>LingoPods Pro · 双耳同步</small>
        </div>
        <button
          aria-label={eq.enabled ? "关闭均衡器" : "开启均衡器"}
          className={`theme-toggle eq-toggle ${eq.enabled ? "toggle-on" : ""}`}
          onClick={() => onChange({ ...eq, enabled: !eq.enabled })}
          type="button"
        >
          <b />
        </button>
      </header>

      <div className={`eq-body ${eq.enabled ? "" : "eq-disabled"}`}>
        <div className="eq-visual" aria-hidden="true">
          {eq.bands.map((gain, index) => (
            <span
              className={dragging ? "sway" : ""}
              key={eqBands[index]}
              style={{ height: `${34 + gain * 8}%` }}
            />
          ))}
        </div>

        <section className="eq-section">
          <div className="editor-section-title">
            <span>预设音效</span>
            <small>{eqPresetLabel(eq)}</small>
          </div>
          <div className="eq-presets">
            {presetList.map((preset) => (
              <AppButton
                className={
                  eq.enabled && eq.preset === preset.id ? "active" : ""
                }
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </AppButton>
            ))}
            {eq.preset === "custom" && (
              <span className="eq-custom-chip">自定义</span>
            )}
          </div>
        </section>

        <section className="eq-section">
          <div className="editor-section-title">
            <span>自定义频段</span>
            <small>拖动滑杆微调 · 自动保存</small>
          </div>
          <div className="eq-bands">
            {eq.bands.map((gain, index) => (
              <label className="eq-band" key={eqBands[index]}>
                <input
                  disabled={!eq.enabled}
                  max={6}
                  min={-6}
                  onChange={(event) =>
                    setBand(index, Number(event.target.value))
                  }
                  onPointerDown={() => setDragging(true)}
                  onPointerUp={() => setDragging(false)}
                  type="range"
                  value={gain}
                />
                <small>{eqBands[index]}</small>
                <b>{gain > 0 ? `+${gain}` : gain}</b>
              </label>
            ))}
          </div>
        </section>

        <p className="gesture-note">
          <Icon name="headphones" size={15} />
          {eq.enabled
            ? "均衡器已启用，设置即时同步到耳机。"
            : "均衡器已关闭，耳机使用默认原声音效。"}
        </p>
      </div>
    </div>
  )
}

export default EqSettings
