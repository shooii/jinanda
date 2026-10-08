import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { copyText, nowLabel } from "@/lib/store"



const connectHelp = [
  { title: "确认耳机电量", detail: "电量低于 10% 时可能无法进入配对模式" },
  { title: "打开充电盒并长按配对键", detail: "按住 3 秒直到指示灯白色闪烁" },
  { title: "忽略旧的蓝牙记录", detail: "在系统蓝牙设置中删除 LingoPods Pro 后重试" },
  { title: "靠近手机 1 米内", detail: "避免金属物体与 Wi-Fi 路由器的信号干扰" },
]

export function BluetoothSetup({ onClose }: { onClose: () => void }) {
  const [step, setStep] =
    useState<"searching" | "found" | "connecting" | "done" | "calibrate">(
      "searching",
    )
  const [showHelp, setShowHelp] = useState(false)
  const [ticket, setTicket] = useState("")

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
              <AppButton
                className="setup-help"
                onClick={() => setShowHelp(true)}
              >
                找不到设备？查看连接帮助
              </AppButton>
            )}
          </>
        )}
      </div>

      {showHelp && (
        <InfoSheet
          eyebrow="连接帮助"
          icon="bluetooth"
          onClose={() => setShowHelp(false)}
          title="找不到设备？"
        >
          <p className="sheet-intro">
            按以下顺序排查，多数连接问题都能在前两步解决。
          </p>
          <ol className="support-steps">
            {connectHelp.map((item, index) => (
              <li key={item.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="stack-actions">
            <AppButton
              className="manage-button"
              onClick={() => {
                setShowHelp(false)
                setStep("searching")
                setTicket("")
                toast("已重新开始搜索设备")
              }}
            >
              重新搜索设备
            </AppButton>
            <AppButton
              className="text-button"
              onClick={async () => {
                if (ticket) {
                  const ok = await copyText(ticket)
                  toast(ok ? "工单号已复制" : "复制失败，请手动记录")
                  return
                }
                const id = `LP-${Date.now().toString().slice(-6)}`
                setTicket(id)
                toast(`支持工单已创建 · ${id}`)
              }}
            >
              {ticket ? `工单 ${ticket} · 点击复制` : "仍无法连接，联系支持"}
            </AppButton>
          </div>
          {ticket ? (
            <p className="support-note">
              <Icon name="check" size={14} />
              {nowLabel()} 已创建连接问题工单，支持同学会在 2 分钟内回复。
            </p>
          ) : null}
        </InfoSheet>
      )}
    </div>
  )
}

export default BluetoothSetup
