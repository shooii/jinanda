import { useEffect, useRef, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export type CareMode = "clean" | "eject"

type CareConfig = {
  mode: CareMode
  title: string
  eyebrow: string
  description: string
  duration: number
  steps: string[]
  doneTitle: string
  doneDetail: string
  icon: IconName
}

export const careConfigs: Record<CareMode, CareConfig> = {
  clean: {
    mode: "clean",
    title: "清灰养护",
    eyebrow: "声波除尘",
    description:
      "通过高频声波震动，去除出声网面上的灰尘与耳垢残留，保持音质清晰。",
    duration: 20,
    steps: ["检测网面状态", "声波震动清洁", "生成清洁报告"],
    doneTitle: "清灰完成",
    doneDetail: "左右耳网面均已清洁，建议每月养护一次。",
    icon: "wind",
  },
  eject: {
    mode: "eject",
    title: "排水处理",
    eyebrow: "低频排水",
    description:
      "通过播放低频声波，将进入出声孔的水分震出，防止积液影响发音单元。",
    duration: 15,
    steps: ["检测水分残留", "低频声波排水", "复检确认"],
    doneTitle: "排水完成",
    doneDetail: "水分已排出，建议用柔软干布擦干耳机表面。",
    icon: "drop",
  },
}

type Phase = "idle" | "running" | "done"

export function DeviceCare({
  mode,
  onClose,
}: {
  mode: CareMode
  onClose: () => void
}) {
  const config = careConfigs[mode]
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | null>(null)

  useEscapeKey(() => {
    if (phase !== "running") onClose()
  })

  useEffect(() => {
    if (phase !== "running") return
    timer.current = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 100 / (config.duration * 10)
        if (next >= 100) {
          if (timer.current !== null) window.clearInterval(timer.current)
          setPhase("done")
          return 100
        }
        return next
      })
    }, 100)
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current)
    }
  }, [phase, config.duration])

  const activeStep = Math.min(
    config.steps.length - 1,
    Math.floor((progress / 100) * config.steps.length),
  )
  const remainSeconds = Math.ceil(
    (config.duration * (100 - progress)) / 100,
  )

  return (
    <div
      className="care-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      <header className="find-header">
        <AppButton
          ariaLabel={`关闭${config.title}`}
          className="find-close"
          onClick={() => {
            if (phase !== "running") onClose()
          }}
        >
          <Icon name="close" size={19} />
        </AppButton>
        <div>
          <strong>{config.title}</strong>
          <small>LingoPods Pro · 左右耳同步处理</small>
        </div>
        <span className="find-live-dot" aria-hidden="true" />
      </header>

      <div className="care-body">
        <div
          className={`care-stage ${phase === "running" ? "running" : ""} ${
            phase === "done" ? "done" : ""
          } ${mode === "eject" ? "eject" : "clean"}`}
        >
          {phase === "done" ? (
            <span className="care-done-badge">
              <Icon name="check" size={34} />
            </span>
          ) : (
            <>
              <span className="care-bud bud-a">
                <Icon name="headphones" size={22} />
              </span>
              <span className="care-bud bud-b">
                <Icon name="headphones" size={22} />
              </span>
            </>
          )}
          <i className="care-wave wave-one" />
          <i className="care-wave wave-two" />
          {mode === "eject" && phase === "running" && (
            <>
              <b className="care-drop drop-one" />
              <b className="care-drop drop-two" />
              <b className="care-drop drop-three" />
            </>
          )}
          {mode === "clean" && phase === "running" && (
            <>
              <b className="care-dust dust-one" />
              <b className="care-dust dust-two" />
              <b className="care-dust dust-three" />
              <b className="care-dust dust-four" />
            </>
          )}
        </div>

        {phase === "idle" && (
          <>
            <span className="eyebrow">
              <i /> {config.eyebrow}
            </span>
            <h2>{config.title}</h2>
            <p>{config.description}</p>
            <ul className="care-steps">
              {config.steps.map((step) => (
                <li key={step}>
                  <Icon name={config.icon} size={15} />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <AppButton
              className="manage-button find-action"
              onClick={() => {
                setProgress(0)
                setPhase("running")
              }}
            >
              <Icon name="play" size={16} />
              <span>
                开始{mode === "clean" ? "清灰" : "排水"} · 约{" "}
                {config.duration} 秒
              </span>
            </AppButton>
          </>
        )}

        {phase === "running" && (
          <>
            <span className="eyebrow">
              <i /> 正在进行
            </span>
            <h2>
              {config.steps[activeStep]}
              <small className="care-countdown">剩余 {remainSeconds} 秒</small>
            </h2>
            <div className="care-progress" role="progressbar" aria-valuenow={Math.round(progress)}>
              <i style={{ width: `${progress}%` }} />
            </div>
            <ol className="care-timeline">
              {config.steps.map((step, index) => (
                <li
                  className={
                    index < activeStep
                      ? "finished"
                      : index === activeStep
                        ? "current"
                        : ""
                  }
                  key={step}
                >
                  {index < activeStep ? (
                    <Icon name="check" size={13} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  {step}
                </li>
              ))}
            </ol>
            <p className="care-warn">
              <Icon name="volume" size={15} />
              {mode === "clean"
                ? "清洁过程中会播放高频声波，请摘下耳机。"
                : "排水过程中会播放低频声波，请将耳机出声孔朝下放置。"}
            </p>
          </>
        )}

        {phase === "done" && (
          <>
            <span className="eyebrow">
              <i /> 养护报告
            </span>
            <h2>{config.doneTitle}</h2>
            <p>{config.doneDetail}</p>
            <div className="care-report">
              <span>
                <small>左耳</small>
                <Icon name="check" size={15} />
                <b>{mode === "clean" ? "已清洁" : "已排水"}</b>
              </span>
              <span>
                <small>右耳</small>
                <Icon name="check" size={15} />
                <b>{mode === "clean" ? "已清洁" : "已排水"}</b>
              </span>
            </div>
            <div className="find-map-actions">
              <AppButton className="manage-button" onClick={onClose}>
                完成
              </AppButton>
              <AppButton
                className="find-nav-button"
                onClick={() => {
                  setProgress(0)
                  setPhase("running")
                }}
              >
                <Icon name="swap" size={16} />
                <span>再处理一次</span>
              </AppButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DeviceCare
