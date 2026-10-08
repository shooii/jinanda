import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { downloadText, nowLabel } from "@/lib/store"



type Phase = "idle" | "testing" | "done"

const steps = ["播放测试音", "采集耳道反馈", "生成贴合报告"]

export function DeviceFitTest({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [archived, setArchived] = useState(false)

  useEscapeKey(() => {
    if (phase !== "testing") onClose()
  })

  useEffect(() => {
    if (phase !== "testing") return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 100 / 60
        if (next >= 100) {
          window.clearInterval(timer)
          setPhase("done")
          return 100
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [phase])

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((progress / 100) * steps.length),
  )

  return (
    <div
      className="find-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="耳塞贴合测试"
    >
      <header className="find-header">
        <AppButton
          ariaLabel="关闭贴合测试"
          className="find-close"
          onClick={() => {
            if (phase !== "testing") onClose()
          }}
        >
          <Icon name="close" size={19} />
        </AppButton>
        <div>
          <strong>耳塞贴合测试</strong>
          <small>LingoPods Pro · 左右耳分别检测</small>
        </div>
        <span className="find-live-dot" aria-hidden="true" />
      </header>

      <div className="find-body fit-body">
        {phase === "idle" ? (
          <>
            <div className="fit-stage">
              <span className="fit-bud">
                <Icon name="headphones" size={26} />
              </span>
              <span className="fit-wave">
                <i />
                <i />
                <i />
              </span>
            </div>
            <span className="eyebrow">
              <i /> 约 6 秒
            </span>
            <h2>检测耳塞是否密封</h2>
            <p>
              测试会播放一段低频音，通过耳道反馈判断密封程度，帮助你获得更好的降噪与译文清晰度。
            </p>
            <ol className="fit-checklist">
              {steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <AppButton
              className="manage-button find-action"
              onClick={() => {
                setProgress(0)
                setPhase("testing")
              }}
            >
              <Icon name="play" size={16} />
              <span>开始测试 · 请佩戴好耳机</span>
            </AppButton>
          </>
        ) : phase === "testing" ? (
          <>
            <div className="fit-stage running">
              <span className="fit-bud">
                <Icon name="headphones" size={26} />
              </span>
              <span className="fit-wave active">
                <i />
                <i />
                <i />
              </span>
            </div>
            <span className="eyebrow">
              <i /> 正在测试
            </span>
            <h2>
              {steps[activeStep]}
              <small className="care-countdown">
                剩余 {Math.ceil((6 * (100 - progress)) / 100)} 秒
              </small>
            </h2>
            <div
              className="care-progress"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
            >
              <i style={{ width: `${progress}%` }} />
            </div>
            <p className="care-warn">
              <Icon name="volume" size={15} />
              测试期间请保持安静，不要触碰耳机。
            </p>
          </>
        ) : (
          <>
            <div className="fit-stage done">
              <span className="fit-bud">
                <Icon name="check" size={30} />
              </span>
            </div>
            <span className="eyebrow">
              <i /> 测试报告
            </span>
            <h2>贴合良好</h2>
            <p>左右耳密封状态均可支撑主动降噪与清晰译文播放。</p>
            <div className="care-report">
              <span>
                <small>左耳</small>
                <Icon name="check" size={15} />
                <b>密封良好</b>
              </span>
              <span>
                <small>右耳</small>
                <Icon name="check" size={15} />
                <b>密封良好</b>
              </span>
            </div>
            <div className="fit-tips">
              <Icon name="sparkles" size={16} />
              <p>
                译文听不清时，可尝试更换更大一号耳塞；建议每 3 个月复测一次。
              </p>
            </div>
            <div className="find-map-actions">
              <AppButton className="manage-button" onClick={onClose}>
                完成
              </AppButton>
              <AppButton
                className="find-nav-button"
                onClick={() => {
                  setProgress(0)
                  setPhase("testing")
                }}
              >
                <Icon name="swap" size={16} />
                <span>再测一次</span>
              </AppButton>
            </div>
            <AppButton
              className="text-button fit-support"
              onClick={() => {
                downloadText(
                  "LingoPods_耳塞贴合报告.txt",
                  [
                    "LingoPods Pro · 耳塞贴合测试报告",
                    "",
                    `设备编号：LP-8821`,
                    `检测时间：${nowLabel()}`,
                    `固件版本：2.4.1`,
                    "",
                    "—— 检测结果 ——",
                    "左耳：密封良好",
                    "右耳：密封良好",
                    "结论：贴合良好，可支撑主动降噪与清晰译文播放。",
                    "",
                    "建议：译文听不清时可更换更大一号耳塞，每 3 个月复测一次。",
                  ].join("\n"),
                )
                setArchived(true)
                toast("贴合报告已保存到设备档案")
              }}
            >
              {archived ? "报告已保存到设备档案" : "保存报告到设备档案"}
            </AppButton>
          </>
        )}
      </div>
    </div>
  )
}

export default DeviceFitTest
