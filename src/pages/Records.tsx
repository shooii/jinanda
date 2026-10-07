import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export function Records() {
  const [filter, setFilter] = useState("全部")
  const filters = ["全部", "对话", "会议", "拍照"]
  const records = [
    {
      title: "咖啡馆对话",
      meta: "西班牙语 · 8 分钟",
      time: "今天 09:24",
      summary: "确认了无麸质早餐选项，并预订了靠窗座位。",
      type: "对话",
    },
    {
      title: "产品周会",
      meta: "英语 · 42 分钟",
      time: "昨天 16:30",
      summary: "3 个待办事项 · 下周二前确认测试范围。",
      type: "会议",
    },
    {
      title: "车站指示牌",
      meta: "日语 · 1 张图片",
      time: "5 月 18 日",
      summary: "中央线快速列车，请前往 4 号站台。",
      type: "拍照",
    },
  ]
  const [selected, setSelected] = useState<typeof records[number] | null>(null)
  useEscapeKey(() => {
    if (selected) setSelected(null)
  })
  const visibleRecords =
    filter === "全部"
      ? records
      : records.filter((record) => record.type === filter)

  return (
    <main className="tab-page records-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">知识库</span>
          <h1>翻译记录</h1>
        </div>
        <AppButton ariaLabel="记录设置" className="page-icon-button">
          <Icon name="settings" />
        </AppButton>
      </header>

      <section className="record-overview">
        <div>
          <strong>347</strong>
          <span>本月翻译分钟</span>
        </div>
        <div>
          <strong>18</strong>
          <span>次真实对话</span>
        </div>
        <div>
          <strong>6</strong>
          <span>份 AI 摘要</span>
        </div>
      </section>

      <div className="filter-row">
        {filters.map((item) => (
          <AppButton
            className={filter === item ? "active" : ""}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </AppButton>
        ))}
      </div>

      <section className="record-list">
        {visibleRecords.map((record) => (
          <AppButton
            className="record-card"
            key={record.title}
            onClick={() => setSelected(record)}
          >
            <span className={`record-type type-${record.type}`}>
              <Icon
                name={
                  record.type === "会议"
                    ? "calendar"
                    : record.type === "拍照"
                      ? "camera"
                      : "globe"
                }
                size={20}
              />
            </span>
            <span className="record-copy">
              <span className="record-title">
                <strong>{record.title}</strong>
                <small>{record.time}</small>
              </span>
              <small>{record.meta}</small>
              <span className="record-summary">
                <Icon name="sparkles" size={14} /> {record.summary}
              </span>
            </span>
            <Icon name="chevron" size={17} />
          </AppButton>
        ))}
      </section>
      {selected && (
        <div className="record-detail-backdrop">
          <div
            className="record-detail"
            role="dialog"
            aria-modal="true"
            aria-label="翻译记录详情"
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">{selected.type}记录</span>
                <h2>{selected.title}</h2>
                <small>
                  {selected.meta} · {selected.time}
                </small>
              </div>
              <AppButton
                ariaLabel="关闭记录详情"
                onClick={() => setSelected(null)}
              >
                <Icon name="close" />
              </AppButton>
            </header>
            <section className="detail-summary">
              <span>
                <Icon name="sparkles" size={17} /> AI 摘要
              </span>
              <p>{selected.summary}</p>
              <div>
                <b>2</b>
                <small>位发言人</small>
                <b>4</b>
                <small>个关键点</small>
              </div>
            </section>
            <section className="detail-transcript">
              <div>
                <span className="speaker-avatar speaker-a">A</span>
                <p>
                  <small>原文 · 英语</small>
                  <strong>Could we get a table by the window?</strong>
                  <i>我们可以要一张靠窗的桌子吗？</i>
                </p>
              </div>
              <div>
                <span className="speaker-avatar speaker-b">B</span>
                <p>
                  <small>译文 · 中文</small>
                  <strong>当然，可以。请跟我来。</strong>
                  <i>Of course. Please follow me.</i>
                </p>
              </div>
            </section>
            <div className="detail-actions">
              <AppButton>
                <Icon name="audio" /> 播放原声
              </AppButton>
              <AppButton>
                <Icon name="notes" /> 导出记录
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Records
