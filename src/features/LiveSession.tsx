import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"



export function LiveSession({ onClose }: { onClose: () => void }) {
  const [isListening, setIsListening] = useState(true)
  const [turn, setTurn] = useState<"you" | "other">("you")
  const [showSettings, setShowSettings] = useState(false)
  const [context, setContext] = useState("旅行")
  const [noSave, setNoSave] = useState(true)
  const [offline, setOffline] = useState(false)
  const [lockScreen, setLockScreen] = useState(true)
  const [phraseActions, setPhraseActions] = useState(false)

  useEscapeKey(() => {
    if (showSettings) setShowSettings(false)
  })
  useEscapeKey(() => {
    if (phraseActions) setPhraseActions(false)
  })

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
            role="dialog"
            aria-modal="true"
            aria-label="对话设置"
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
            role="dialog"
            aria-modal="true"
            aria-label="这句话的操作"
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

export default LiveSession
