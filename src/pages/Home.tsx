import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Earbuds, Icon } from "@/components/Icon"
import { ShortcutEditor } from "@/features/ShortcutEditor"
import type { Shortcut } from "@/features/ShortcutEditor"
import type { FeatureId } from "@/lib/core"



export function Home({
  onStart,
  onUpgrade,
  onConnect,
  onSleep,
  onRecords,
  shortcuts,
  onSaveShortcuts,
  onMode,
}: {
  onStart: () => void
  onUpgrade: () => void
  onConnect: () => void
  onSleep: () => void
  onRecords: () => void
  shortcuts: Shortcut[]
  onSaveShortcuts: (shortcuts: Shortcut[]) => void
  onMode: (mode: FeatureId) => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="brand-mark">L</div>
        <div className="wordmark">LingoPods</div>
        <AppButton
          ariaLabel="管理蓝牙耳机"
          className="device-pill"
          onClick={onConnect}
        >
          <span className="connected-dot" />
          <Icon name="headphones" size={18} />
          <span>88%</span>
        </AppButton>
      </header>

      <main className="content">
        <section className="device-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <i /> LINGOPODS PRO · 已连接
            </span>
            <h1>
              翻译，
              <br />
              直接入耳。
            </h1>
          </div>
          <Earbuds />
          <AppButton className="start-button" onClick={onStart}>
            <span className="start-icon">
              <Icon name="mic" size={24} />
            </span>
            <span>
              <strong>开始实时翻译</strong>
              <small>中文 ↔ 英语</small>
            </span>
            <Icon name="chevron" />
          </AppButton>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>快捷功能</h2>
            <AppButton
              className="edit-trigger"
              onClick={() => setEditing(true)}
            >
              <Icon name="settings" size={14} />
              <span>编辑</span>
            </AppButton>
          </div>
          <div className="modes-grid">
            {shortcuts
              .filter((item) => item.enabled)
              .map((item) => (
                <AppButton
                  className={`mode-card ${item.featured ? "featured" : ""}`}
                  key={item.id}
                  onClick={() =>
                    onMode(
                      item.id === "face"
                        ? "dialogue"
                        : item.id === "meeting" ||
                              item.id === "travel" ||
                              item.id === "camera"
                          ? item.id
                          : "dialogue",
                    )
                  }
                >
                  <span className="mode-icon">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                  {item.badge ? (
                    <span className="new-tag">{item.badge}</span>
                  ) : (
                    <Icon name="chevron" size={16} />
                  )}
                </AppButton>
              ))}
          </div>
        </section>

        <section className="recent-section">
          <div className="section-heading">
            <h2>最近记录</h2>
            <AppButton className="text-button" onClick={onRecords}>
              查看全部
            </AppButton>
          </div>
          <AppButton className="recent-row" onClick={onRecords}>
            <span className="recent-icon">
              <Icon name="notes" size={20} />
            </span>
            <span>
              <strong>咖啡馆对话</strong>
              <small>西班牙语 · 8 分钟 · 今天 09:24</small>
            </span>
            <span className="summary-badge">AI 摘要</span>
          </AppButton>
        </section>

        <section className="home-secondary">
          <AppButton className="home-sleep-row" onClick={onSleep}>
            <span className="sleep-orb">
              <Icon name="moon" size={22} />
              <i />
            </span>
            <span>
              <small>夜间聆听</small>
              <strong>深海白噪音</strong>
              <b>45 分钟睡眠定时</b>
            </span>
            <Icon name="chevron" size={18} />
          </AppButton>
        </section>

        <section className="pro-card">
          <div className="pro-spark">
            <Icon name="sparkles" size={26} />
          </div>
          <div>
            <span className="eyebrow">设备专属权益</span>
            <h3>Lingo+ 已激活</h3>
            <div className="pro-meta">
              <span>2026 年 10 月续费</span>
            </div>
          </div>
          <AppButton
            ariaLabel="查看会员权益"
            className="round-arrow"
            onClick={onUpgrade}
          >
            <Icon name="chevron" size={18} />
          </AppButton>
        </section>
        {editing && (
          <ShortcutEditor
            onClose={() => setEditing(false)}
            onSave={(items) => {
              onSaveShortcuts(items)
              setEditing(false)
            }}
            shortcuts={shortcuts}
          />
        )}
      </main>
    </>
  )
}

export default Home
