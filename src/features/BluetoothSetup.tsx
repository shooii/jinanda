import { useEffect, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"



export function BluetoothSetup({ onClose }: { onClose: () => void }) {
  const [step, setStep] =
    useState<"searching" | "found" | "connecting" | "done" | "calibrate">(
      "searching",
    )

  useEffect(() => {
    if (step !== "searching") return
    const timer = window.setTimeout(() => setStep("found"), 1600)
    return () => window.clearTimeout(timer)
  }, [step])

  const connect = () => {
    setStep("connecting")
    window.setTimeout(() => setStep("done"), 1500)
  }

  return (
    <div className="bluetooth-flow">
      <header className="setup-header">
        <AppButton
          ariaLabel="关闭蓝牙连接"
          className="setup-close"
          onClick={onClose}
        >
          <Icon name="close" />
        </AppButton>
        <strong>{step === "calibrate" ? "设备校准" : "连接耳机"}</strong>
        <span>{step === "calibrate" ? "2 / 2" : "1 / 2"}</span>
      </header>

      <div className="pairing-visual">
        <div className={`radar ${step}`}>
          <i className="radar-ring ring-one" />
          <i className="radar-ring ring-two" />
          <i className="radar-ring ring-three" />
          <span className="bluetooth-core">
            <Icon
              name={
                step === "done" || step === "calibrate" ? "check" : "bluetooth"
              }
              size={34}
            />
          </span>
          <span className="floating-bud bud-a" />
          <span className="floating-bud bud-b" />
        </div>
        <h2>
          {step === "searching"
            ? "正在寻找附近设备"
            : step === "found"
              ? "发现你的 LingoPods"
              : step === "connecting"
                ? "正在安全连接"
                : step === "calibrate"
                  ? "佩戴与收音测试"
                  : "连接成功"}
        </h2>
        <p>
          {step === "searching"
            ? "请打开耳机盒，并长按配对键 3 秒"
            : step === "calibrate"
              ? "确认左右耳佩戴、麦克风和触控均正常"
              : step === "done"
                ? "现在可以开始实时翻译了"
                : "LingoPods Pro 已准备好与你的手机配对"}
        </p>
      </div>

      <div className="setup-panel">
        {step === "calibrate" ? (
          <>
            <div className="calibration-list">
              <div>
                <span>
                  <Icon name="check" size={15} />
                </span>
                <p>
                  <strong>左右耳佩戴</strong>
                  <small>检测正常</small>
                </p>
                <b>通过</b>
              </div>
              <div>
                <span>
                  <Icon name="check" size={15} />
                </span>
                <p>
                  <strong>麦克风收音</strong>
                  <small>环境噪音较低</small>
                </p>
                <b>通过</b>
              </div>
              <div>
                <span>
                  <Icon name="check" size={15} />
                </span>
                <p>
                  <strong>触控翻译</strong>
                  <small>长按任意耳机开始</small>
                </p>
                <b>已设置</b>
              </div>
            </div>
            <AppButton className="manage-button" onClick={onClose}>
              完成设置
            </AppButton>
          </>
        ) : (
          <>
            <div
              className={`found-device ${
                step === "searching" ? "skeleton" : ""
              }`}
            >
              <span className="device-avatar">
                <Icon name="headphones" size={24} />
              </span>
              <span>
                <strong>
                  {step === "searching" ? "正在扫描…" : "LingoPods Pro"}
                </strong>
                <small>
                  {step === "searching"
                    ? "请将耳机靠近手机"
                    : step === "done"
                      ? "已连接 · 电量 88%"
                      : "信号强 · 设备已就绪"}
                </small>
              </span>
              {step === "found" && (
                <AppButton className="mini-connect" onClick={connect}>
                  连接
                </AppButton>
              )}
              {step === "connecting" && <i className="connect-spinner" />}
              {step === "done" && (
                <span className="done-check">
                  <Icon name="check" size={16} />
                </span>
              )}
            </div>

            <div className="pairing-steps">
              <div className="complete">
                <span>
                  <Icon name="check" size={14} />
                </span>
                <p>
                  <strong>开启蓝牙</strong>
                  <small>已开启</small>
                </p>
              </div>
              <div className={step !== "searching" ? "complete" : ""}>
                <span>
                  {step !== "searching" ? <Icon name="check" size={14} /> : "2"}
                </span>
                <p>
                  <strong>选择并连接耳机</strong>
                  <small>仅首次使用时需要</small>
                </p>
              </div>
            </div>

            {step === "done" ? (
              <AppButton
                className="manage-button"
                onClick={() => setStep("calibrate")}
              >
                继续设置
              </AppButton>
            ) : (
              <AppButton className="setup-help">
                找不到设备？查看连接帮助
              </AppButton>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BluetoothSetup
