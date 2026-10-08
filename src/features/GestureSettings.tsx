import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey, usePersistentState } from "@/lib/core"
import { useT } from "@/lib/i18n"



export type GestureActionId =
  | "none"
  | "play-pause"
  | "next-track"
  | "prev-track"
  | "voice-assistant"
  | "start-translate"
  | "switch-mode"
  | "anc-cycle"
  | "volume-up"
  | "volume-down"
  | "answer-call"

export type GestureMap = Record<
  "tap" | "double" | "hold",
  GestureActionId
>

export type GestureConfig = { left: GestureMap; right: GestureMap }

const actionList: {
  id: GestureActionId
  label: string
  icon: IconName
}[] = [
  { id: "none", label: "无操作", icon: "close" },
  { id: "play-pause", label: "播放 / 暂停", icon: "play" },
  { id: "next-track", label: "下一曲", icon: "skip-next" },
  { id: "prev-track", label: "上一曲", icon: "skip-prev" },
  { id: "voice-assistant", label: "唤醒语音助手", icon: "mic" },
  { id: "start-translate", label: "开始翻译", icon: "translate" },
  { id: "switch-mode", label: "切换翻译模式", icon: "swap" },
  { id: "anc-cycle", label: "降噪 / 通透切换", icon: "headphones" },
  { id: "volume-up", label: "音量 +", icon: "volume" },
  { id: "volume-down", label: "音量 −", icon: "volume" },
  { id: "answer-call", label: "接听 / 挂断电话", icon: "bell" },
]

const gestureMeta: {
  id: keyof GestureMap
  hint: string
}[] = [
  { id: "tap", hint: "轻触一次" },
  { id: "double", hint: "快速轻触两次" },
  { id: "hold", hint: "按住约 1 秒" },
]

export const defaultGestures: GestureConfig = {
  left: {
    tap: "play-pause",
    double: "next-track",
    hold: "start-translate",
  },
  right: {
    tap: "play-pause",
    double: "voice-assistant",
    hold: "switch-mode",
  },
}

export function actionLabel(id: GestureActionId) {
  return actionList.find((item) => item.id === id)?.label ?? "无操作"
}

export function GestureSettings({ onClose }: { onClose: () => void }) {
  const [gestures, setGestures] = usePersistentState<GestureConfig>(
    "lingo.gestures",
    defaultGestures,
  )
  const [ear, setEar] = useState<"left" | "right">("left")
  const [picking, setPicking] = useState<keyof GestureMap | null>(null)
  const t = useT()

  useEscapeKey(() => {
    if (picking) setPicking(null)
    else onClose()
  })

  const current = gestures[ear]

  const assign = (gesture: keyof GestureMap, action: GestureActionId) => {
    setGestures({ ...gestures, [ear]: { ...current, [gesture]: action } })
    setPicking(null)
  }

  return (
    <div
      className="gesture-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="按键设置"
    >
      <header className="find-header">
        <AppButton
          ariaLabel="关闭按键设置"
          className="find-close"
          onClick={onClose}
        >
          <Icon name="close" size={19} />
        </AppButton>
        <div>
          <strong>{t("gesture.title")}</strong>
          <small>轻触耳机即可触发 · 无需打开 App</small>
        </div>
        <AppButton
          className="gesture-reset"
          onClick={() => setGestures(defaultGestures)}
        >
          恢复默认
        </AppButton>
      </header>

      <div className="gesture-body">
        <div className="ear-tabs" role="tablist" aria-label="选择耳机">
          <AppButton
            className={ear === "left" ? "active" : ""}
            onClick={() => setEar("left")}
          >
            <Icon name="headphones" size={16} />
            <span>左耳</span>
          </AppButton>
          <AppButton
            className={ear === "right" ? "active" : ""}
            onClick={() => setEar("right")}
          >
            <Icon name="headphones" size={16} />
            <span>右耳</span>
          </AppButton>
        </div>

        <div className="gesture-list">
          {gestureMeta.map((meta) => {
            const action = actionList.find(
              (item) => item.id === current[meta.id],
            )
            return (
              <AppButton
                className="gesture-row"
                key={meta.id}
                onClick={() => setPicking(meta.id)}
              >
                <span className="gesture-tap">
                  {meta.id === "tap" && <i />}
                  {meta.id === "double" && (
                    <>
                      <i />
                      <i />
                    </>
                  )}
                  {meta.id === "hold" && <b />}
                </span>
                <span className="gesture-copy">
                  <strong>{t(`gesture.${meta.id}`)}</strong>
                  <small>{meta.hint}</small>
                </span>
                <span className="gesture-action">
                  {action && action.id !== "none" && (
                    <Icon name={action.icon} size={16} />
                  )}
                  <b>{action?.label ?? "无操作"}</b>
                </span>
                <Icon name="chevron" size={16} />
              </AppButton>
            )
          })}
        </div>

        <p className="gesture-note">
          <Icon name="sparkles" size={15} />
          设置完成后由耳机直接执行对应功能，App 无需在后台运行。
        </p>
      </div>

      {picking && (
        <div
          className="profile-panel-backdrop gesture-picker-backdrop"
          onClick={() => setPicking(null)}
        >
          <div
            className="profile-panel gesture-picker"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="选择手势功能"
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">
                  {ear === "left" ? "左耳" : "右耳"} ·{" "}
                  {gestureMeta.find((item) => item.id === picking)?.hint}
                </span>
                <h2>{t("gesture.action")}</h2>
              </div>
              <AppButton onClick={() => setPicking(null)}>
                <Icon name="close" />
              </AppButton>
            </header>
            <div className="panel-options gesture-options">
              {actionList.map((item) => (
                <AppButton
                  className={current[picking] === item.id ? "selected" : ""}
                  key={item.id}
                  onClick={() => assign(picking, item.id)}
                >
                  <span className="gesture-option-icon">
                    <Icon name={item.icon} size={17} />
                  </span>
                  <span>{item.label}</span>
                  {current[picking] === item.id && <Icon name="check" />}
                </AppButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestureSettings
