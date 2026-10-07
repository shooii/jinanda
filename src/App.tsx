import { useEffect, useState, type ReactNode } from "react"

type IconName = "audio" | "bluetooth" | "bolt" | "calendar" | "camera" | "check" | "chevron" | "close" | "globe" | "grip" | "headphones" | "home" | "mic" | "moon" | "notes" | "pause" | "plane" | "play" | "plus" | "profile" | "settings" | "sparkles" | "swap"

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    audio: (
      <>
        <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4" />
      </>
    ),
    bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 5 13 3H7L5.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-5.5Z" />
        <circle cx="10" cy="12" r="4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    grip: (
      <>
        <circle cx="8" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="17" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M6 13H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-7ZM18 13h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v-7Z" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    mic: (
      <>
        <rect x="8" y="2" width="8" height="13" rx="4" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
      </>
    ),
    moon: <path d="M20.5 15.2A9 9 0 1 1 8.8 3.5a7 7 0 0 0 11.7 11.7Z" />,
    notes: (
      <>
        <path d="M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    plane: <path d="m22 2-9 20-2-9-9-2L22 2Z" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" />
      </>
    ),
    swap: <path d="m7 7 3-3m-3 3 3 3M7 7h10M17 17l-3-3m3 3-3 3m3-3H7" />,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {paths[name]}
      </g>
    </svg>
  )
}

function Earbuds() {
  return (
    <div className="earbuds" aria-label="已连接 LingoPods Pro">
      <div className="bud bud-left">
        <span />
      </div>
      <div className="bud bud-right">
        <span />
      </div>
      <i className="signal signal-one" />
      <i className="signal signal-two" />
    </div>
  )
}

function AppButton({
  children,
  className = "",
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function transitionTo(update: () => void) {
  const documentWithTransitions = document as Document & {
    startViewTransition?: (callback: () => void) => void
  }

  if (documentWithTransitions.startViewTransition) {
    documentWithTransitions.startViewTransition(update)
  } else {
    update()
  }
}

function LiveSession({ onClose }: { onClose: () => void }) {
  const [isListening, setIsListening] = useState(true)
  const [turn, setTurn] = useState<"you" | "other">("you")
  const [showSettings, setShowSettings] = useState(false)
  const [context, setContext] = useState("旅行")
  const [noSave, setNoSave] = useState(true)
  const [offline, setOffline] = useState(false)
  const [lockScreen, setLockScreen] = useState(true)
  const [phraseActions, setPhraseActions] = useState(false)

  return (
    <div className="live-session">
      <header className="live-header">
        <AppButton
          ariaLabel="关闭实时翻译"
          className="icon-button"
          onClick={onClose}
        >
          <Icon name="close" />
        </AppButton>
        <div>
          <strong>智能对话</strong>
          <span className="live-status">
            <i /> {offline ? "离线模式" : isListening ? "正在聆听" : "已暂停"}
          </span>
        </div>
        <AppButton
          ariaLabel="翻译设置"
          className="icon-button"
          onClick={() => setShowSettings(true)}
        >
          <Icon name="settings" />
        </AppButton>
      </header>

      <main className="smart-conversation">
        <div className="conversation-meta">
          <span>
            <Icon name="sparkles" size={14} /> {context}
          </span>
          <span>
            <Icon name="headphones" size={14} /> 左耳 + 手机
          </span>
          <span>{offline ? "端侧翻译" : "低延迟"}</span>
        </div>
        <div className="language-pair smart-pair">
          <span>中文</span>
          <Icon name="swap" size={18} />
          <span>英语</span>
        </div>

        <section
          className={`turn-stage turn-${turn} ${isListening ? "active" : ""}`}
        >
          <span className="turn-ring">
            <Icon name={turn === "you" ? "mic" : "profile"} size={30} />
          </span>
          <small>{turn === "you" ? "轮到你" : "轮到对方"}</small>
          <h1>{turn === "you" ? "请说中文" : "请让对方说英语"}</h1>
          <p>{turn === "you" ? "译文将从手机播放" : "译文将直接传入左耳"}</p>
        </section>

        <div className="conversation-transcript">
          <div className="compact-phrase">
            <span>你</span>
            <div>
              <small>中文</small>
              <p>请问去市中心的火车从哪个站台出发？</p>
            </div>
          </div>
          <div className="compact-phrase translated">
            <span>TA</span>
            <div>
              <small>英语 · 已播放</small>
              <p>
                Which platform does the train to the city center leave from?
              </p>
              <AppButton
                className="confidence-word"
                onClick={() => setPhraseActions(true)}
              >
                platform <i /> 点击确认
              </AppButton>
            </div>
          </div>
        </div>
      </main>

      <footer className="smart-live-controls">
        <div className="session-note">
          <Icon name="check" size={15} />
          <span>{noSave ? "不保存会话" : "已加密保存"}</span>
        </div>
        <div className="smart-control-row">
          <AppButton ariaLabel="声音出口" onClick={() => setShowSettings(true)}>
            <Icon name="headphones" />
            <small>声音出口</small>
          </AppButton>
          <AppButton
            ariaLabel={isListening ? "暂停聆听" : "继续聆听"}
            className={`smart-mic ${isListening ? "active" : ""}`}
            onClick={() => setIsListening((value) => !value)}
          >
            <Icon name={isListening ? "pause" : "mic"} size={27} />
          </AppButton>
          <AppButton
            ariaLabel="切换发言人"
            onClick={() =>
              setTurn((value) => (value === "you" ? "other" : "you"))
            }
          >
            <Icon name="swap" />
            <small>换人说</small>
          </AppButton>
        </div>
      </footer>

      {showSettings && (
        <div
          className="live-settings-backdrop"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="live-settings-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <header>
              <h2>对话设置</h2>
              <AppButton onClick={() => setShowSettings(false)}>
                <Icon name="close" />
              </AppButton>
            </header>
            <section>
              <span className="sheet-label">场景</span>
              <div className="context-chips">
                {["旅行", "商务", "餐厅", "医疗"].map((item) => (
                  <AppButton
                    className={context === item ? "active" : ""}
                    key={item}
                    onClick={() => setContext(item)}
                  >
                    {item}
                  </AppButton>
                ))}
              </div>
            </section>
            <section>
              <span className="sheet-label">声音出口</span>
              <div className="route-options">
                <AppButton className="active">
                  <Icon name="headphones" />
                  <span>
                    <strong>智能分配</strong>
                    <small>我听耳机，对方听手机</small>
                  </span>
                  <Icon name="check" />
                </AppButton>
                <AppButton>
                  <Icon name="audio" />
                  <span>
                    <strong>手机免提</strong>
                    <small>双方都使用手机</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
              </div>
            </section>
            <section className="session-preferences">
              <AppButton onClick={() => setNoSave((value) => !value)}>
                <span>
                  <strong>不保存会话</strong>
                  <small>结束后删除原始音频与文字</small>
                </span>
                <i className={noSave ? "toggle-on" : ""}>
                  <b />
                </i>
              </AppButton>
              <AppButton onClick={() => setOffline((value) => !value)}>
                <span>
                  <strong>离线优先</strong>
                  <small>网络不稳时自动使用端侧语言包</small>
                </span>
                <i className={offline ? "toggle-on" : ""}>
                  <b />
                </i>
              </AppButton>
              <AppButton onClick={() => setLockScreen((value) => !value)}>
                <span>
                  <strong>锁屏继续翻译</strong>
                  <small>手机放入口袋后使用耳机控制</small>
                </span>
                <i className={lockScreen ? "toggle-on" : ""}>
                  <b />
                </i>
              </AppButton>
            </section>
          </div>
        </div>
      )}
      {phraseActions && (
        <div
          className="phrase-actions-backdrop"
          onClick={() => setPhraseActions(false)}
        >
          <div
            className="phrase-actions-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <span className="sheet-label">这句话</span>
            <div className="phrase-action-grid">
              <AppButton>
                <Icon name="audio" />
                <span>重复播放</span>
              </AppButton>
              <AppButton>
                <Icon name="audio" />
                <span>0.75× 慢速</span>
              </AppButton>
              <AppButton>
                <Icon name="notes" />
                <span>纠正译文</span>
              </AppButton>
              <AppButton>
                <Icon name="plus" />
                <span>加入常用语</span>
              </AppButton>
            </div>
            <AppButton
              className="remember-word"
              onClick={() => setPhraseActions(false)}
            >
              <Icon name="sparkles" />
              <span>
                <strong>记住 “platform”</strong>
                <small>加入个人词汇，下次优先识别</small>
              </span>
              <Icon name="chevron" />
            </AppButton>
          </div>
        </div>
      )}
    </div>
  )
}

type Shortcut = {
  id: string
  title: string
  detail: string
  icon: IconName
  enabled: boolean
  featured?: boolean
  badge?: string
}

const defaultShortcuts: Shortcut[] = [
  {
    id: "face",
    title: "面对面翻译",
    detail: "实时双向对话",
    icon: "globe",
    enabled: true,
    featured: true,
  },
  {
    id: "meeting",
    title: "会议记录",
    detail: "转写与 AI 纪要",
    icon: "calendar",
    enabled: true,
  },
  {
    id: "travel",
    title: "旅行模式",
    detail: "离线也能使用",
    icon: "plane",
    enabled: true,
    badge: "新功能",
  },
  {
    id: "camera",
    title: "拍照翻译",
    detail: "菜单、路牌与文档",
    icon: "camera",
    enabled: true,
  },
  {
    id: "call",
    title: "通话翻译",
    detail: "实时翻译语音通话",
    icon: "headphones",
    enabled: false,
  },
  {
    id: "text",
    title: "文本翻译",
    detail: "输入或粘贴文字",
    icon: "notes",
    enabled: false,
  },
]

function ShortcutEditor({
  shortcuts,
  onClose,
  onSave,
}: {
  shortcuts: Shortcut[]
  onClose: () => void
  onSave: (shortcuts: Shortcut[]) => void
}) {
  const [draft, setDraft] = useState(shortcuts)
  const [notice, setNotice] = useState("首页最多展示 4 个快捷功能")
  const enabled = draft.filter((item) => item.enabled)
  const available = draft.filter((item) => !item.enabled)

  const toggle = (id: string) => {
    const target = draft.find((item) => item.id === id)
    if (!target) return
    if (!target.enabled && enabled.length >= 4) {
      setNotice("请先移除一个快捷功能，再添加新的")
      return
    }
    if (target.enabled && enabled.length <= 2) {
      setNotice("至少保留 2 个快捷功能")
      return
    }
    setDraft((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
    setNotice(target.enabled ? "已移至更多功能" : "已添加到首页")
  }

  const move = (id: string, direction: -1 | 1) => {
    const activeItems = draft.filter((item) => item.enabled)
    const currentIndex = activeItems.findIndex((item) => item.id === id)
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= activeItems.length) return
    const reordered = [...activeItems]
    ;[reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ]
    const inactiveItems = draft.filter((item) => !item.enabled)
    setDraft([...reordered, ...inactiveItems])
    setNotice("排序已更新")
  }

  return (
    <div className="editor-backdrop">
      <div className="shortcut-editor">
        <header className="editor-header">
          <AppButton
            ariaLabel="取消编辑"
            className="editor-close"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </AppButton>
          <div>
            <strong>编辑快捷功能</strong>
            <small>按你的使用习惯排列首页</small>
          </div>
          <AppButton className="editor-save" onClick={() => onSave(draft)}>
            完成
          </AppButton>
        </header>

        <div className="editor-hint">
          <Icon name="sparkles" size={16} />
          <span>{notice}</span>
          <b>{enabled.length}/4</b>
        </div>

        <section className="editor-section">
          <div className="editor-section-title">
            <span>首页快捷功能</span>
            <AppButton
              onClick={() => {
                setDraft(defaultShortcuts.map((item) => ({ ...item })))
                setNotice("已恢复默认排序")
              }}
            >
              恢复默认
            </AppButton>
          </div>
          <div className="shortcut-list">
            {enabled.map((item, index) => (
              <div className="shortcut-edit-row" key={item.id}>
                <Icon name="grip" size={19} />
                <span className="edit-row-icon">
                  <Icon name={item.icon} size={19} />
                </span>
                <span className="edit-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <span className="order-actions">
                  <AppButton
                    ariaLabel={`上移${item.title}`}
                    className={index === 0 ? "disabled up" : "up"}
                    onClick={() => move(item.id, -1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                  <AppButton
                    ariaLabel={`下移${item.title}`}
                    className={
                      index === enabled.length - 1 ? "disabled down" : "down"
                    }
                    onClick={() => move(item.id, 1)}
                  >
                    <Icon name="chevron" size={15} />
                  </AppButton>
                </span>
                <AppButton
                  ariaLabel={`移除${item.title}`}
                  className="remove-shortcut"
                  onClick={() => toggle(item.id)}
                >
                  <Icon name="close" size={15} />
                </AppButton>
              </div>
            ))}
          </div>
        </section>

        <section className="editor-section more-section">
          <div className="editor-section-title">
            <span>更多功能</span>
            <small>点击添加到首页</small>
          </div>
          <div className="shortcut-list">
            {available.length ? (
              available.map((item) => (
                <AppButton
                  className="shortcut-edit-row available-row"
                  key={item.id}
                  onClick={() => toggle(item.id)}
                >
                  <span className="edit-row-icon">
                    <Icon name={item.icon} size={19} />
                  </span>
                  <span className="edit-row-copy">
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className="add-shortcut">
                    <Icon name="plus" size={17} />
                  </span>
                </AppButton>
              ))
            ) : (
              <div className="all-added">
                <Icon name="check" size={16} /> 所有功能都已添加到首页
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Home({
  onStart,
  onUpgrade,
  onConnect,
  onSleep,
  onRecords,
}: {
  onStart: () => void
  onUpgrade: () => void
  onConnect: () => void
  onSleep: () => void
  onRecords: () => void
}) {
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
      </main>
    </>
  )
}

function FeatureHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <header className="feature-header">
      <AppButton
        ariaLabel="返回首页"
        className="feature-back"
        onClick={onClose}
      >
        <Icon name="chevron" />
      </AppButton>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      <AppButton ariaLabel="功能设置" className="feature-settings">
        <Icon name="settings" size={19} />
      </AppButton>
    </header>
  )
}

function ModeIllustration({ mode }: { mode: string }) {
  return (
    <span
      className={`mode-illustration illustration-${mode}`}
      aria-hidden="true"
    >
      <span className="scene-user scene-me">
        <i className="scene-head">
          <b className="scene-bud" />
        </i>
        <i className="scene-body" />
        <small>我</small>
      </span>
      <span className="scene-route">
        <i />
        <i />
        <i />
        {mode === "smart" && (
          <b>
            <Icon name="sparkles" size={12} />
          </b>
        )}
      </span>
      <span className="scene-user scene-them">
        <i className="scene-head">
          <b className="scene-bud" />
        </i>
        <i className="scene-body" />
        <small>对方</small>
      </span>
      {(mode === "hybrid" || mode === "speaker" || mode === "smart") && (
        <span className="scene-phone">
          <i />
          <b className="phone-wave wave-left" />
          <b className="phone-wave wave-right" />
        </span>
      )}
    </span>
  )
}

function DialogueMode({
  onClose,
  onStart,
}: {
  onClose: () => void
  onStart: () => void
}) {
  const [mode, setMode] = useState("smart")
  const modes = [
    {
      id: "smart",
      title: "智能分配",
      detail: "自动识别佩戴状态",
      tag: "推荐",
      icon: "sparkles" as IconName,
    },
    {
      id: "share",
      title: "一人一只耳机",
      detail: "双方各戴一只耳机",
      tag: "最佳体验",
      icon: "headphones" as IconName,
    },
    {
      id: "hybrid",
      title: "耳机 + 手机",
      detail: "我戴耳机，对方听手机",
      tag: "",
      icon: "profile" as IconName,
    },
    {
      id: "speaker",
      title: "手机免提对话",
      detail: "双方直接使用手机",
      tag: "",
      icon: "audio" as IconName,
    },
  ]
  const selected = modes.find((item) => item.id === mode) ?? modes[0]

  return (
    <div className="feature-flow dialogue-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="选择声音如何传递"
        title="面对面翻译"
      />
      <main className="dialogue-content">
        <section className="dialogue-preview">
          <div className="conversation-people">
            <div className="person person-me">
              <span className="person-head">
                <i />
              </span>
              <small>我</small>
            </div>
            <div className="voice-route">
              <i />
              <i />
              <i />
              <span>
                <Icon name={selected.icon} size={22} />
              </span>
              <i />
              <i />
              <i />
            </div>
            <div className="person person-other">
              <span className="person-head">
                <i />
              </span>
              <small>对方</small>
            </div>
          </div>
          <span className="eyebrow">
            <i /> LINGOPODS PRO 已连接
          </span>
          <h1>{selected.title}</h1>
          <p>{selected.detail}</p>
          {mode === "smart" && (
            <div className="smart-route">
              <span>
                <Icon name="check" size={14} /> 已检测到左耳佩戴
              </span>
              <span>对方语音将从手机播放</span>
            </div>
          )}
        </section>

        <section className="dialogue-language-card">
          <div>
            <span className="language-person">我</span>
            <p>
              <small>我的语言</small>
              <strong>中文（普通话）</strong>
            </p>
            <Icon name="chevron" size={17} />
          </div>
          <span className="language-swap">
            <Icon name="swap" size={17} />
          </span>
          <div>
            <span className="language-person other">TA</span>
            <p>
              <small>对方语言</small>
              <strong>英语（美国）</strong>
            </p>
            <Icon name="chevron" size={17} />
          </div>
        </section>

        <div className="dialogue-section-head">
          <div>
            <h2>对话方式</h2>
          </div>
          <span>可随时切换</span>
        </div>
        <section className="dialogue-modes">
          {modes.map((item) => (
            <AppButton
              className={`dialogue-mode-card ${
                mode === item.id ? "active" : ""
              }`}
              key={item.id}
              onClick={() => setMode(item.id)}
            >
              <ModeIllustration mode={item.id} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              {item.tag && <b>{item.tag}</b>}
              <i className="mode-radio">{mode === item.id && <span />}</i>
            </AppButton>
          ))}
        </section>

        <div className="dialogue-privacy">
          <Icon name="headphones" size={18} />
          <span>
            <strong>更卫生，也更灵活</strong>
            <small>不方便分享耳机时，选择“耳机 + 手机”即可。</small>
          </span>
        </div>
      </main>
      <footer className="dialogue-start-bar">
        <div>
          <span className="connected-dot" />
          <p>
            <strong>设备已就绪</strong>
            <small>预计延迟 0.8 秒</small>
          </p>
        </div>
        <AppButton onClick={onStart}>
          <Icon name="mic" size={20} /> 开始对话
        </AppButton>
      </footer>
    </div>
  )
}

function MeetingMode({ onClose }: { onClose: () => void }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [consent, setConsent] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [recording])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <div className="feature-flow meeting-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="实时转写与 AI 纪要"
        title="会议记录"
      />
      <main className="meeting-content">
        <section className="meeting-status-card">
          <div className="meeting-orb">
            <i className={recording ? "active" : ""} />
            <Icon name="calendar" size={28} />
          </div>
          <span className="eyebrow">
            {finished ? "会议完成" : recording ? "正在记录" : "准备就绪"}
          </span>
          <h1>
            {finished
              ? "纪要已生成"
              : recording
                ? time
                : "让每个重点都有迹可循"}
          </h1>
          <p>
            {finished
              ? "已整理关键决定、待办事项和双语全文"
              : recording
                ? "正在识别英语，并同步生成中文翻译"
                : "自动区分发言人，会后生成摘要与待办事项。"}
          </p>
          <div className="meeting-languages">
            <span>英语</span>
            <Icon name="swap" size={16} />
            <span>中文</span>
          </div>
        </section>

        {finished ? (
          <section className="meeting-summary">
            <div className="summary-top">
              <Icon name="sparkles" />
              <span>
                <strong>三句话摘要</strong>
                <small>AI 已整理</small>
              </span>
            </div>
            <p>
              团队确认周五前完成发布时间表，并在下周二前提交新版测试计划。上线范围仍需产品负责人最终确认。
            </p>
            <div className="decision-list">
              <span>
                <Icon name="check" size={15} />
                <b>决定</b> 周五前冻结发布时间表
              </span>
              <span>
                <Icon name="calendar" size={15} />
                <b>待办</b> Mia · 下周二提交测试计划
              </span>
              <span>
                <Icon name="profile" size={15} />
                <b>待确认</b> 产品负责人确认上线范围
              </span>
            </div>
            <div className="summary-actions">
              <AppButton>
                <Icon name="notes" /> 查看全文
              </AppButton>
              <AppButton>
                <Icon name="plane" /> 导出
              </AppButton>
            </div>
          </section>
        ) : recording ? (
          <section className="live-transcript-card">
            <div className="transcript-head">
              <span>
                <i /> 实时转写
              </span>
              <small>2 位发言人</small>
            </div>
            <div className="speaker-line">
              <b className="speaker-avatar speaker-a">A</b>
              <div>
                <small>Alex · 刚刚</small>
                <p>Let's confirm the launch timeline before Friday.</p>
                <span>我们在周五前确认一下发布时间表。</span>
              </div>
            </div>
            <div className="speaker-line upcoming">
              <b className="speaker-avatar speaker-b">M</b>
              <div>
                <small>Mia · 正在说</small>
                <p>I'll share the updated testing plan...</p>
                <span>我会分享更新后的测试计划……</span>
              </div>
            </div>
          </section>
        ) : (
          <>
            <AppButton
              className={`consent-card ${consent ? "accepted" : ""}`}
              onClick={() => setConsent((value) => !value)}
            >
              <span>{consent ? <Icon name="check" size={15} /> : "1"}</span>
              <div>
                <strong>已获得参会者同意</strong>
                <small>开始前请告知所有参会者正在录音与转写</small>
              </div>
            </AppButton>
            <section className="meeting-benefits">
              <div>
                <Icon name="mic" />
                <span>
                  <strong>智能区分发言人</strong>
                  <small>最多识别 8 位参会者</small>
                </span>
              </div>
              <div>
                <Icon name="sparkles" />
                <span>
                  <strong>AI 自动整理</strong>
                  <small>摘要、决定与待办事项</small>
                </span>
              </div>
              <div>
                <Icon name="notes" />
                <span>
                  <strong>双语会议纪要</strong>
                  <small>原文与翻译可随时回看</small>
                </span>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="meeting-controls">
        <AppButton
          ariaLabel={recording ? "结束会议记录" : "开始会议记录"}
          className={`record-meeting ${recording ? "recording" : ""}`}
          onClick={() => {
            if (finished) {
              setFinished(false)
              setSeconds(0)
              return
            }
            if (recording) {
              setRecording(false)
              setFinished(true)
            } else {
              setConsent(true)
              setRecording(true)
            }
          }}
        >
          {recording ? (
            <span className="stop-square" />
          ) : (
            <Icon name="mic" size={26} />
          )}
        </AppButton>
        <strong>
          {finished
            ? "开始新会议"
            : recording
              ? "点击结束并生成纪要"
              : consent
                ? "点击开始记录"
                : "确认同意并开始"}
        </strong>
        <small>
          {recording ? "内容已自动保存" : "首次使用会请求麦克风权限"}
        </small>
      </footer>
    </div>
  )
}

function TravelMode({ onClose }: { onClose: () => void }) {
  const [downloaded, setDownloaded] = useState(["西班牙语"])
  const [loading, setLoading] = useState("")
  const packs = [
    {
      language: "英语",
      region: "美国、英国、澳大利亚",
      size: "168 MB",
      code: "EN",
    },
    {
      language: "西班牙语",
      region: "西班牙、墨西哥等 20 个地区",
      size: "142 MB",
      code: "ES",
    },
    { language: "日语", region: "日本", size: "156 MB", code: "JA" },
    { language: "法语", region: "法国、加拿大", size: "149 MB", code: "FR" },
  ]

  const download = (language: string) => {
    if (downloaded.includes(language) || loading) return
    setLoading(language)
    window.setTimeout(() => {
      setDownloaded((items) => [...items, language])
      setLoading("")
    }, 1100)
  }

  return (
    <div className="feature-flow travel-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="无网络也能放心交流"
        title="旅行模式"
      />
      <main className="travel-content">
        <AppButton className="trip-prep-card" onClick={() => download("日语")}>
          <span>
            <Icon name="plane" size={20} />
          </span>
          <div>
            <small>明天 · 东京</small>
            <strong>
              {downloaded.includes("日语")
                ? "旅行准备已完成"
                : "下载日语离线包"}
            </strong>
          </div>
          {downloaded.includes("日语") ? (
            <Icon name="check" size={18} />
          ) : (
            <Icon name="chevron" size={18} />
          )}
        </AppButton>
        <section className="offline-hero">
          <div>
            <span className="eyebrow">
              <i /> 离线可用
            </span>
            <h1>把语言装进口袋</h1>
            <p>出发前下载语言包，在飞机、地铁和没有漫游网络的地方继续翻译。</p>
          </div>
          <span className="travel-plane">
            <Icon name="plane" size={34} />
          </span>
          <div className="storage-bar">
            <span>
              <i />
            </span>
            <small>已使用 1.2 GB / 8 GB</small>
          </div>
        </section>

        <div className="travel-section-head">
          <div>
            <span className="eyebrow">离线语言包</span>
            <h2>选择目的地语言</h2>
          </div>
          <span>{downloaded.length} 个已下载</span>
        </div>
        <section className="language-packs">
          {packs.map((pack) => {
            const isDownloaded = downloaded.includes(pack.language)
            const isLoading = loading === pack.language
            return (
              <div className="language-pack" key={pack.language}>
                <span className="language-code">{pack.code}</span>
                <div>
                  <strong>{pack.language}</strong>
                  <small>
                    {pack.region} · {pack.size}
                  </small>
                  <span className="pack-capabilities">
                    语音识别 · 语音播报 · 5 月 20 日更新
                  </span>
                </div>
                <AppButton
                  ariaLabel={`${
                    isDownloaded ? "已下载" : "下载"
                  }${pack.language}`}
                  className={
                    isDownloaded
                      ? "pack-downloaded"
                      : isLoading
                        ? "pack-loading"
                        : "pack-download"
                  }
                  onClick={() => download(pack.language)}
                >
                  {isDownloaded ? (
                    <Icon name="check" size={16} />
                  ) : isLoading ? (
                    <i />
                  ) : (
                    <Icon name="plus" size={16} />
                  )}
                </AppButton>
              </div>
            )
          })}
        </section>

        <section className="travel-tip">
          <Icon name="sparkles" size={20} />
          <div>
            <strong>旅行小助手</strong>
            <p>语言包包含机场、餐厅、酒店和紧急求助等高频场景表达。</p>
          </div>
        </section>
      </main>
    </div>
  )
}

function CameraMode({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    if (!scanning) return
    setShowResult(false)
    setShowOriginal(false)
    const timer = window.setTimeout(() => {
      setScanning(false)
      setShowResult(true)
    }, 1700)
    return () => window.clearTimeout(timer)
  }, [scanning])

  return (
    <div className="feature-flow camera-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="菜单、路牌与文档"
        title="拍照翻译"
      />
      <main className="camera-content">
        <div className="camera-languages">
          <span>英语</span>
          <Icon name="swap" size={16} />
          <span>中文</span>
        </div>
        <section className="camera-viewport">
          {showResult && (
            <AppButton
              className="original-toggle"
              onClick={() => setShowOriginal((value) => !value)}
            >
              <Icon name={showOriginal ? "sparkles" : "notes"} size={15} />
              {showOriginal ? "查看中文" : "对照原文"}
            </AppButton>
          )}
          <div
            className={`menu-paper ${
              showResult && !showOriginal ? "translated-paper" : ""
            }`}
            key={showResult && !showOriginal ? "translated" : "original"}
          >
            <span>
              {showResult && !showOriginal ? "今日菜单" : "TODAY'S MENU"}
            </span>
            <strong>
              {showResult && !showOriginal ? "番茄汤" : "Tomato soup"}
            </strong>
            <i />
            <strong>
              {showResult && !showOriginal
                ? "香草烤鸡配时蔬"
                : "Roast chicken with herbs"}
            </strong>
            <i />
            <strong>
              {showResult && !showOriginal
                ? "焦糖苹果挞"
                : "Caramel apple tart"}
            </strong>
          </div>
          <span className="scan-corner corner-a" />
          <span className="scan-corner corner-b" />
          <span className="scan-corner corner-c" />
          <span className="scan-corner corner-d" />
          {scanning && <i className="scan-line" />}
          <div className="camera-guide">
            {scanning
              ? "正在识别并替换英文…"
              : showOriginal
                ? "正在对照英文原文"
                : "已将 4 处英文替换为中文"}
          </div>
        </section>

        {showResult && (
          <section className="direct-translation-status">
            <span className="direct-status-icon">
              <Icon name="check" size={18} />
            </span>
            <div>
              <strong>译文已覆盖到原图</strong>
              <small>保留原有排版与文字位置 · 英语 → 中文</small>
            </div>
            <AppButton ariaLabel="保存翻译图片">
              <Icon name="camera" size={18} />
            </AppButton>
          </section>
        )}
      </main>
      <footer className="camera-controls">
        <AppButton ariaLabel="从相册选择图片" className="gallery-button">
          <Icon name="notes" />
        </AppButton>
        <AppButton
          ariaLabel="重新扫描"
          className={`shutter-button ${scanning ? "scanning" : ""}`}
          onClick={() => setScanning(true)}
        >
          <span>
            <Icon name="camera" size={25} />
          </span>
        </AppButton>
        <AppButton ariaLabel="开启闪光灯" className="gallery-button">
          <Icon name="bolt" />
        </AppButton>
      </footer>
    </div>
  )
}

function BluetoothSetup({ onClose }: { onClose: () => void }) {
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

function TranslateHub({
  onLive,
  onMode,
}: {
  onLive: () => void
  onMode: (mode: "dialogue" | "meeting" | "travel" | "camera") => void
}) {
  const [swapped, setSwapped] = useState(false)
  const [phrase, setPhrase] = useState("请问最近的地铁站在哪里？")

  const phrases = [
    "请问最近的地铁站在哪里？",
    "我对坚果过敏。",
    "可以帮我叫一辆出租车吗？",
  ]

  return (
    <main className="tab-page translate-hub">
      <header className="page-header">
        <div>
          <h1>翻译</h1>
        </div>
        <span className="hub-device">
          <i />
          <Icon name="headphones" size={18} /> 88%
        </span>
      </header>

      <section className="hub-language-pair">
        <AppButton>
          <small>我的语言</small>
          <strong>{swapped ? "英语" : "中文"}</strong>
        </AppButton>
        <AppButton
          ariaLabel="交换语言"
          className="hub-swap"
          onClick={() => setSwapped((value) => !value)}
        >
          <Icon name="swap" size={19} />
        </AppButton>
        <AppButton>
          <small>对方语言</small>
          <strong>{swapped ? "中文" : "英语"}</strong>
        </AppButton>
      </section>

      <section className="hub-live-card">
        <div className="hub-wave">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="eyebrow">
          <i /> 低延迟实时翻译
        </span>
        <h2>开始实时对话</h2>
        <div className="hub-live-actions">
          <AppButton className="hub-main-action" onClick={onLive}>
            <Icon name="headphones" /> 面对面对话
          </AppButton>
          <AppButton
            ariaLabel="直接开始翻译"
            className="hub-mic-action"
            onClick={onLive}
          >
            <Icon name="mic" />
          </AppButton>
        </div>
      </section>

      <section className="hub-tools">
        <AppButton onClick={() => onMode("meeting")}>
          <span>
            <Icon name="calendar" />
          </span>
          <strong>会议</strong>
          <small>实时纪要</small>
        </AppButton>
        <AppButton onClick={() => onMode("camera")}>
          <span>
            <Icon name="camera" />
          </span>
          <strong>拍照</strong>
          <small>识别文字</small>
        </AppButton>
        <AppButton onClick={() => onMode("travel")}>
          <span>
            <Icon name="plane" />
          </span>
          <strong>离线</strong>
          <small>旅行语言包</small>
        </AppButton>
      </section>

      <section className="phrase-book">
        <div className="section-heading">
          <div>
            <h2>常用语</h2>
          </div>
          <AppButton className="text-button">管理</AppButton>
        </div>
        <div className="phrase-chips">
          {phrases.map((item) => (
            <AppButton
              className={phrase === item ? "active" : ""}
              key={item}
              onClick={() => setPhrase(item)}
            >
              {item}
            </AppButton>
          ))}
        </div>
        <div className="phrase-player">
          <div>
            <small>中文</small>
            <strong>{phrase}</strong>
            <span>Excuse me, where is the nearest subway station?</span>
          </div>
          <AppButton ariaLabel="播放表达">
            <Icon name="audio" />
          </AppButton>
        </div>
      </section>
    </main>
  )
}

function Records() {
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
          <div className="record-detail">
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

function SleepLibrary({ onBack }: { onBack: () => void }) {
  const [playing, setPlaying] = useState("深海白噪音")
  const tracks = [
    { title: "深海白噪音", detail: "海浪 · 45 分钟", art: "ocean" },
    { title: "森林雨夜", detail: "自然声 · 60 分钟", art: "forest" },
    { title: "云端漫步", detail: "氛围音乐 · 30 分钟", art: "cloud" },
    { title: "壁炉微光", detail: "环境声 · 90 分钟", art: "fire" },
  ]

  return (
    <main className="tab-page sleep-page">
      <AppButton className="sleep-back" onClick={onBack}>
        <Icon name="chevron" size={17} /> 返回首页
      </AppButton>
      <header className="page-header sleep-heading">
        <div>
          <span className="eyebrow">晚安模式</span>
          <h1>让耳朵慢下来</h1>
          <p>专为耳机优化的舒缓声景与睡眠定时。</p>
        </div>
        <span className="moon-orbit">
          <Icon name="moon" size={26} />
        </span>
      </header>

      <section className="now-playing">
        <div className="sound-art ocean">
          <i />
          <i />
          <i />
          <Icon name="moon" size={30} />
        </div>
        <div className="playing-copy">
          <span>正在播放</span>
          <strong>{playing}</strong>
          <small>睡眠定时 · 45 分钟后停止</small>
          <div className="sound-progress">
            <i />
          </div>
        </div>
        <AppButton
          ariaLabel="暂停助眠音乐"
          className="play-main"
          onClick={() => setPlaying(playing ? "" : "深海白噪音")}
        >
          <Icon name={playing ? "pause" : "play"} size={22} />
        </AppButton>
      </section>

      <section className="sound-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">为你推荐</span>
            <h2>热门声景</h2>
          </div>
          <AppButton className="text-button">查看全部</AppButton>
        </div>
        <div className="sound-grid">
          {tracks.map((track) => (
            <AppButton
              className={`sound-card ${
                playing === track.title ? "active" : ""
              }`}
              key={track.title}
              onClick={() => setPlaying(track.title)}
            >
              <span className={`mini-art ${track.art}`}>
                {playing === track.title ? (
                  <Icon name="audio" />
                ) : (
                  <Icon name="play" />
                )}
              </span>
              <strong>{track.title}</strong>
              <small>{track.detail}</small>
            </AppButton>
          ))}
        </div>
      </section>

      <section className="sleep-tools">
        <div>
          <span>
            <Icon name="moon" />
          </span>
          <p>
            <strong>睡眠定时</strong>
            <small>45 分钟后停止</small>
          </p>
          <Icon name="chevron" />
        </div>
        <div>
          <span>
            <Icon name="audio" />
          </span>
          <p>
            <strong>智能音量</strong>
            <small>入睡后缓慢降低</small>
          </p>
          <Icon name="chevron" />
        </div>
      </section>
    </main>
  )
}

function Profile({
  onConnect,
  onMembership,
}: {
  onConnect: () => void
  onMembership: () => void
}) {
  const [panel, setPanel] =
    useState<"device" | "language" | "vocabulary" | "privacy" | "help" | null>(
      null,
    )
  const [finding, setFinding] = useState(false)

  return (
    <main className="tab-page profile-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">个人中心</span>
          <h1>我的</h1>
        </div>
        <AppButton
          ariaLabel="个人设置"
          className="page-icon-button"
          onClick={() => setPanel("device")}
        >
          <Icon name="settings" />
        </AppButton>
      </header>

      <section className="user-card">
        <span className="user-avatar">YL</span>
        <div>
          <strong>远行者</strong>
          <small>已连续使用 12 天</small>
        </div>
        <span className="level-pill">探索者</span>
      </section>

      <section className="my-device-card">
        <div className="device-card-head">
          <div>
            <span className="eyebrow">
              <i /> 已连接
            </span>
            <h2>LingoPods Pro</h2>
          </div>
          <AppButton className="text-button" onClick={onConnect}>
            管理
          </AppButton>
        </div>
        <div className="device-display">
          <Earbuds />
          <div className="device-battery-grid">
            <span>
              <small>左耳</small>
              <strong>88%</strong>
            </span>
            <span>
              <small>右耳</small>
              <strong>84%</strong>
            </span>
            <span>
              <small>充电盒</small>
              <strong>62%</strong>
            </span>
          </div>
        </div>
        <div className="device-actions">
          <AppButton onClick={onConnect}>
            <Icon name="bluetooth" />
            <span>重新连接</span>
          </AppButton>
          <AppButton onClick={() => setFinding(true)}>
            <Icon name="audio" />
            <span>查找耳机</span>
          </AppButton>
          <AppButton onClick={() => setPanel("device")}>
            <Icon name="settings" />
            <span>设备设置</span>
          </AppButton>
        </div>
      </section>

      <AppButton className="membership-row" onClick={onMembership}>
        <span>
          <Icon name="sparkles" />
        </span>
        <div>
          <small>LINGO+ 会员</small>
          <strong>设备赠送权益使用中</strong>
          <i>
            <b /> 还剩 10 个月
          </i>
        </div>
        <Icon name="chevron" />
      </AppButton>

      <section className="settings-list">
        <AppButton onClick={() => setPanel("language")}>
          <span>
            <Icon name="globe" />
          </span>
          <div>
            <strong>翻译语言</strong>
            <small>中文、英语、西班牙语</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("vocabulary")}>
          <span>
            <Icon name="sparkles" />
          </span>
          <div>
            <strong>个人词汇</strong>
            <small>姓名、地点和专业术语</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("privacy")}>
          <span>
            <Icon name="notes" />
          </span>
          <div>
            <strong>数据与隐私</strong>
            <small>记录仅保存在你的账户中</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("help")}>
          <span>
            <Icon name="headphones" />
          </span>
          <div>
            <strong>帮助与支持</strong>
            <small>连接指南、常见问题</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
      </section>
      <small className="app-version">
        LingoPods 1.0 MVP · 设备编号 LP-8821
      </small>
      <div className="service-footer">
        <span>
          <i /> 所有服务运行正常
        </span>
        <div>
          <AppButton>隐私政策</AppButton>
          <AppButton>用户协议</AppButton>
          <AppButton>服务状态</AppButton>
        </div>
      </div>
      {finding && (
        <div className="find-device-backdrop">
          <div className="find-device-card">
            <AppButton
              ariaLabel="关闭查找耳机"
              onClick={() => setFinding(false)}
            >
              <Icon name="close" />
            </AppButton>
            <div className="find-radar">
              <i />
              <i />
              <span>
                <Icon name="headphones" size={30} />
              </span>
            </div>
            <span className="eyebrow">正在播放提示音</span>
            <h2>耳机就在附近</h2>
            <p>声音将逐渐增大。找到耳机后，请点击下方按钮停止。</p>
            <AppButton
              className="manage-button"
              onClick={() => setFinding(false)}
            >
              已找到，停止播放
            </AppButton>
          </div>
        </div>
      )}
      {panel && (
        <div className="profile-panel-backdrop" onClick={() => setPanel(null)}>
          <div
            className="profile-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">设置</span>
                <h2>
                  {panel === "device"
                    ? "设备偏好"
                    : panel === "language"
                      ? "翻译语言"
                      : panel === "vocabulary"
                        ? "个人词汇"
                        : panel === "privacy"
                          ? "数据与隐私"
                          : "帮助与支持"}
                </h2>
              </div>
              <AppButton onClick={() => setPanel(null)}>
                <Icon name="close" />
              </AppButton>
            </header>
            {panel === "language" && (
              <div className="panel-options">
                <AppButton className="selected">
                  <span>中文（普通话）</span>
                  <Icon name="check" />
                </AppButton>
                <AppButton>
                  <span>英语（美国）</span>
                  <Icon name="check" />
                </AppButton>
                <AppButton>
                  <span>西班牙语</span>
                  <Icon name="plus" />
                </AppButton>
              </div>
            )}
            {panel === "vocabulary" && (
              <div className="vocabulary-panel">
                <div className="vocabulary-stats">
                  <strong>12</strong>
                  <span>个词汇已用于提升识别准确率</span>
                </div>
                <div className="vocabulary-list">
                  <div>
                    <span>
                      <strong>LingoPods</strong>
                      <small>产品名称 · 按英文发音</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                  <div>
                    <span>
                      <strong>Shibuya</strong>
                      <small>地点 · 涩谷</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                  <div>
                    <span>
                      <strong>Alex Chen</strong>
                      <small>联系人姓名</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                </div>
                <AppButton className="add-vocabulary">
                  <Icon name="plus" /> 添加词汇
                </AppButton>
              </div>
            )}
            {panel === "privacy" && (
              <div className="privacy-options">
                <div>
                  <span>
                    <strong>保存翻译记录</strong>
                    <small>仅同步到你的加密账户</small>
                  </span>
                  <i className="toggle-on">
                    <b />
                  </i>
                </div>
                <div>
                  <span>
                    <strong>用于改进识别</strong>
                    <small>默认关闭，不上传原始音频</small>
                  </span>
                  <i>
                    <b />
                  </i>
                </div>
                <p>
                  <Icon name="check" size={15} /> 原始音频将在会话结束后自动删除
                </p>
              </div>
            )}
            {panel === "help" && (
              <div className="help-options">
                <AppButton>
                  <Icon name="bluetooth" />
                  <span>
                    <strong>耳机无法连接</strong>
                    <small>查看分步排查指南</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
                <AppButton>
                  <Icon name="mic" />
                  <span>
                    <strong>翻译效果不佳</strong>
                    <small>优化佩戴与收音环境</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
                <AppButton>
                  <Icon name="profile" />
                  <span>
                    <strong>联系在线支持</strong>
                    <small>平均 2 分钟内回复</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
              </div>
            )}
            {panel === "device" && (
              <>
                <div className="privacy-options">
                  <div>
                    <span>
                      <strong>自动连接</strong>
                      <small>打开 App 时连接最近设备</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                  <div>
                    <span>
                      <strong>佩戴检测</strong>
                      <small>自动判断译文播放位置</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                  <div>
                    <span>
                      <strong>触控翻译</strong>
                      <small>长按耳机开始对话</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                </div>
                <div className="device-info-list">
                  <AppButton>
                    <span>
                      <strong>触控手势</strong>
                      <small>长按开始翻译 · 双击切换发言人</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>耳塞贴合测试</strong>
                      <small>左右耳密封良好</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>固件版本 2.4.1</strong>
                      <small>已是最新版本</small>
                    </span>
                    <Icon name="check" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>保修与设备信息</strong>
                      <small>保修期至 2027 年 10 月</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function Membership({ onClose }: { onClose: () => void }) {
  const [managing, setManaging] = useState(false)

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="membership-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <AppButton
          ariaLabel="关闭会员权益"
          className="sheet-close"
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </AppButton>
        {managing ? (
          <>
            <span className="plan-icon">
              <Icon name="settings" size={27} />
            </span>
            <span className="eyebrow">订阅管理</span>
            <h2>你的 Lingo+ 方案</h2>
            <p className="sheet-intro">
              当前会员由 LingoPods Pro 设备权益提供，赠送期内不会扣费。
            </p>
            <section className="subscription-card">
              <div>
                <span>
                  <i /> 当前方案
                </span>
                <b>Lingo+ Unlimited</b>
                <small>设备赠送 · 使用中</small>
              </div>
              <strong>
                ¥0<small>/ 赠送期</small>
              </strong>
            </section>
            <div className="billing-timeline">
              <div className="complete">
                <i>
                  <Icon name="check" size={13} />
                </i>
                <span>
                  <strong>2025 年 10 月 18 日</strong>
                  <small>激活设备赠送会员</small>
                </span>
              </div>
              <div>
                <i />
                <span>
                  <strong>2026 年 10 月 18 日</strong>
                  <small>赠送期结束</small>
                </span>
              </div>
            </div>
            <section className="renewal-disclosure">
              <Icon name="calendar" size={19} />
              <div>
                <strong>到期后的续费方式</strong>
                <p>
                  将以 ¥38/月自动续费，系统会在续费前 7
                  天提醒。你可以随时取消，不影响赠送期权益。
                </p>
              </div>
            </section>
            <div className="subscription-actions">
              <AppButton onClick={() => setManaging(false)}>
                返回会员权益
              </AppButton>
              <AppButton>关闭自动续费</AppButton>
            </div>
            <div className="legal-links">
              <AppButton>恢复购买</AppButton>
              <i /> <AppButton>服务条款</AppButton>
              <i /> <AppButton>隐私政策</AppButton>
            </div>
          </>
        ) : (
          <>
            <span className="plan-icon">
              <Icon name="sparkles" size={28} />
            </span>
            <span className="eyebrow">LINGO+ 会员</span>
            <h2>让翻译陪你去往每个地方。</h2>
            <p className="sheet-intro">
              购买 LingoPods Pro 已获赠会员，有效期至 2026 年 10 月 18 日。
            </p>
            <div className="benefit-list">
              <div>
                <Icon name="globe" />
                <span>
                  <strong>不限时实时翻译</strong>
                  <small>支持 42 种语言与自然语音播报</small>
                </span>
              </div>
              <div>
                <Icon name="plane" />
                <span>
                  <strong>离线旅行语言包</strong>
                  <small>没有漫游网络或 Wi-Fi 也能交流</small>
                </span>
              </div>
              <div>
                <Icon name="sparkles" />
                <span>
                  <strong>AI 纪要与待办事项</strong>
                  <small>会后自动生成可搜索的对话摘要</small>
                </span>
              </div>
            </div>
            <section className="member-value">
              <span>
                <strong>347</strong>
                <small>翻译分钟</small>
              </span>
              <span>
                <strong>18</strong>
                <small>真实对话</small>
              </span>
              <span>
                <strong>6</strong>
                <small>会议纪要</small>
              </span>
              <span>
                <strong>4h</strong>
                <small>节省时间</small>
              </span>
            </section>
            <AppButton className="third-party-plan">
              <span>
                <Icon name="headphones" size={18} />
              </span>
              <div>
                <strong>使用其他品牌耳机？</strong>
                <small>可单独订阅 Lingo+，继续使用翻译与会议功能</small>
              </div>
              <Icon name="chevron" size={17} />
            </AppButton>
            <AppButton
              className="manage-button"
              onClick={() => setManaging(true)}
            >
              管理会员
            </AppButton>
            <small className="renewal-note">
              设备专属权益 · 可随时取消续费
            </small>
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState("home")
  const [showLive, setShowLive] = useState(false)
  const [showMembership, setShowMembership] = useState(false)
  const [showBluetooth, setShowBluetooth] = useState(false)
  const [activeFeature, setActiveFeature] =
    useState<"dialogue" | "meeting" | "travel" | "camera" | null>(null)

  const navItems: { id: string label: string icon: IconName }[] = [
    { id: "home", label: "首页", icon: "home" },
    { id: "live", label: "翻译", icon: "mic" },
    { id: "notes", label: "记录", icon: "notes" },
    { id: "profile", label: "我的", icon: "profile" },
  ]

  return (
    <div className="app-shell">
      <aside className="desktop-story">
        <div className="story-brand">
          <span>L</span> LingoPods
        </div>
        <div className="story-content">
          <span className="story-label">听见 · 理解 · 连接</span>
          <h2>
            每一种声音，
            <br />
            都近在耳边。
          </h2>
          <p>专为耳机打造的 AI 翻译，无需一直盯着手机屏幕。</p>
          <div className="story-stat">
            <strong>42</strong>
            <span>
              种语言
              <br />
              覆盖真实生活场景
            </span>
          </div>
        </div>
        <span className="story-foot">专为 LingoPods Pro 打造</span>
      </aside>

      <div className="phone-app">
        {showBluetooth ? (
          <BluetoothSetup
            onClose={() => transitionTo(() => setShowBluetooth(false))}
          />
        ) : activeFeature === "dialogue" ? (
          <DialogueMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
            onStart={() =>
              transitionTo(() => {
                setActiveFeature(null)
                setShowLive(true)
              })
            }
          />
        ) : activeFeature === "meeting" ? (
          <MeetingMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "travel" ? (
          <TravelMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "camera" ? (
          <CameraMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : showLive ? (
          <LiveSession onClose={() => transitionTo(() => setShowLive(false))} />
        ) : (
          <>
            {tab === "home" ? (
              <Home
                onConnect={() => transitionTo(() => setShowBluetooth(true))}
                onRecords={() => transitionTo(() => setTab("notes"))}
                onSleep={() => transitionTo(() => setTab("sleep"))}
                onStart={() => transitionTo(() => setShowLive(true))}
                onUpgrade={() => transitionTo(() => setShowMembership(true))}
              />
            ) : tab === "live" ? (
              <TranslateHub
                onLive={() => transitionTo(() => setShowLive(true))}
                onMode={(mode) => transitionTo(() => setActiveFeature(mode))}
              />
            ) : tab === "notes" ? (
              <Records />
            ) : tab === "sleep" ? (
              <SleepLibrary onBack={() => transitionTo(() => setTab("home"))} />
            ) : tab === "profile" ? (
              <Profile
                onConnect={() => transitionTo(() => setShowBluetooth(true))}
                onMembership={() => transitionTo(() => setShowMembership(true))}
              />
            ) : (
              <main className="empty-view">
                <span className="empty-icon">
                  <Icon
                    name={
                      tab === "live"
                        ? "mic"
                        : tab === "notes"
                          ? "notes"
                          : "profile"
                    }
                    size={32}
                  />
                </span>
                <h2>{tab === "live" ? "准备开始翻译" : "你的 LingoPods"}</h2>
                <p>
                  {tab === "live"
                    ? "几秒钟内即可开始自然流畅的双向对话。"
                    : "管理你的设备、语言和会员权益。"}
                </p>
                {tab === "live" && (
                  <AppButton
                    className="manage-button"
                    onClick={() => setShowLive(true)}
                  >
                    开始实时翻译
                  </AppButton>
                )}
              </main>
            )}
            <nav className="bottom-nav" aria-label="主导航">
              {navItems.map((item) => (
                <AppButton
                  ariaLabel={item.label}
                  className={tab === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => transitionTo(() => setTab(item.id))}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </AppButton>
              ))}
            </nav>
          </>
        )}
        {showMembership && (
          <Membership
            onClose={() => transitionTo(() => setShowMembership(false))}
          />
        )}
      </div>
    </div>
  )
}
