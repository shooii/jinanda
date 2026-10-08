import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"
import { copyText, nowLabel } from "@/lib/store"



type TopicId = "connect" | "quality" | "contact" | null

const topics: {
  id: Exclude<TopicId, null>
  title: string
  icon: IconName
  steps: { title: string; detail: string }[]
}[] = [
  {
    id: "connect",
    title: "耳机无法连接",
    icon: "bluetooth",
    steps: [
      { title: "把两只耳机放回充电盒", detail: "合盖等待 10 秒，让耳机完全复位" },
      { title: "长按充电盒配对键 3 秒", detail: "直到指示灯白色闪烁进入配对模式" },
      { title: "在手机设置中忽略旧配对", detail: "删除名为 LingoPods Pro 的旧蓝牙记录" },
      { title: "回到 App 重新连接", detail: "首页设备胶囊 → 重新连接" },
    ],
  },
  {
    id: "quality",
    title: "翻译效果不佳",
    icon: "mic",
    steps: [
      { title: "确认佩戴与贴合", detail: "可在设备设置中运行耳塞贴合测试" },
      { title: "让麦克风朝向对方", detail: "避免用手或衣领遮挡耳机收音孔" },
      { title: "降低环境噪音", detail: "在嘈杂环境可切换到“耳机 + 手机”模式" },
      { title: "补充个人词汇", detail: "把姓名、地名加入个人词汇可显著提升识别" },
    ],
  },
]

export function SupportCenter({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState<TopicId>(null)
  const [category, setCategory] = useState("连接问题")
  const [detail, setDetail] = useState("")
  const [ticket, setTicket] = useState("")
  const [ticketTime, setTicketTime] = useState("")

  useEscapeKey(() => {
    if (topic) setTopic(null)
    else onClose()
  })

  if (topic === "contact") {
    return (
      <div
        className="profile-panel-backdrop"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="profile-panel"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="联系在线支持"
        >
          <div className="sheet-handle" />
          <header>
            <div>
              <span className="eyebrow">帮助与支持</span>
              <h2>联系在线支持</h2>
            </div>
            <AppButton ariaLabel="关闭在线支持" onClick={onClose}>
              <Icon name="close" />
            </AppButton>
          </header>

          {ticket ? (
            <section className="support-done">
              <span className="support-done-icon">
                <Icon name="check" size={30} />
              </span>
              <h3>已收到你的问题</h3>
              <p>
                工单号 <b>{ticket}</b>
                ，提交于 {ticketTime}。支持同学会在 2 分钟内回复，请留意 App 内通知。
              </p>
              <p className="support-note">
                <Icon name="check" size={14} />
                问题类型：{category} · 已附带设备型号与固件版本。
              </p>
              <AppButton
                className="text-button"
                onClick={async () => {
                  const ok = await copyText(
                    [
                      `工单号：${ticket}`,
                      `提交时间：${ticketTime}`,
                      `问题类型：${category}`,
                      `详细描述：${detail.trim()}`,
                      "设备：LingoPods Pro · LP-8821 · 固件 2.4.1",
                    ].join("\n"),
                  )
                  toast(ok ? "工单信息已复制" : "复制失败，请手动记录")
                }}
              >
                复制工单信息
              </AppButton>
              <AppButton
                className="manage-button"
                onClick={() => {
                  setTicket("")
                  setDetail("")
                  setTopic(null)
                }}
              >
                再提一个问题
              </AppButton>
              <AppButton className="text-button support-back" onClick={onClose}>
                返回我的
              </AppButton>
            </section>
          ) : (
            <>
              <label className="form-field">
                <span>问题类型</span>
                <div className="chip-row">
                  {["连接问题", "翻译质量", "账号与订阅", "设备硬件"].map(
                    (item) => (
                      <AppButton
                        className={category === item ? "active" : ""}
                        key={item}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </AppButton>
                    ),
                  )}
                </div>
              </label>
              <label className="form-field">
                <span>详细描述</span>
                <textarea
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="描述你遇到的问题，例如：右耳连接后没有声音"
                  rows={4}
                  value={detail}
                />
              </label>
              <p className="support-note">
                <Icon name="check" size={14} />
                提交时会附上设备型号与固件版本，不包含任何对话内容。
              </p>
              <AppButton
                className="manage-button"
                onClick={() => {
                  if (!detail.trim()) {
                    toast("请先描述你遇到的问题")
                    return
                  }
                  const id = `LP-${Date.now().toString().slice(-6)}`
                  setTicket(id)
                  setTicketTime(nowLabel())
                  toast(`工单已提交 · ${id}`)
                }}
              >
                提交工单
              </AppButton>
              <AppButton
                className="text-button support-back"
                onClick={() => setTopic(null)}
              >
                返回帮助列表
              </AppButton>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="profile-panel-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="帮助与支持"
      >
        <div className="sheet-handle" />
        <header>
          <div>
            <span className="eyebrow">帮助与支持</span>
            <h2>{topic ? topics.find((t) => t.id === topic)?.title : "你想解决什么问题？"}</h2>
          </div>
          <AppButton ariaLabel="关闭帮助" onClick={onClose}>
            <Icon name="close" />
          </AppButton>
        </header>

        {topic ? (
          <>
            <ol className="support-steps">
              {topics
                .find((item) => item.id === topic)
                ?.steps.map((step, index) => (
                  <li key={step.title}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                    </div>
                  </li>
                ))}
            </ol>
            <div className="stack-actions">
              <AppButton
                className="manage-button"
                onClick={() => {
                  setTopic(null)
                  toast("已记录为已解决，感谢反馈")
                }}
              >
                问题已解决
              </AppButton>
              <AppButton
                className="text-button"
                onClick={() => setTopic("contact")}
              >
                仍未解决，联系支持
              </AppButton>
            </div>
            <AppButton
              className="text-button support-back"
              onClick={() => setTopic(null)}
            >
              返回帮助列表
            </AppButton>
          </>
        ) : (
          <div className="help-options">
            {topics.map((item) => (
              <AppButton key={item.id} onClick={() => setTopic(item.id)}>
                <Icon name={item.icon} />
                <span>
                  <strong>{item.title}</strong>
                  <small>查看分步排查指南</small>
                </span>
                <Icon name="chevron" />
              </AppButton>
            ))}
            <AppButton onClick={() => setTopic("contact")}>
              <Icon name="profile" />
              <span>
                <strong>联系在线支持</strong>
                <small>平均 2 分钟内回复</small>
              </span>
              <Icon name="chevron" />
            </AppButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportCenter
