import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { usePersistentState } from "@/lib/core"



export function ModeIllustration({ mode }: { mode: string }) {
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

export function DialogueMode({
  onClose,
  onStart,
}: {
  onClose: () => void
  onStart: () => void
}) {
  const [mode, setMode] = usePersistentState("lingo.dialogue-mode", "smart")
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
          <AppButton ariaLabel="更改我的语言">
            <span className="language-person">我</span>
            <p>
              <small>我的语言</small>
              <strong>中文（普通话）</strong>
            </p>
            <Icon name="chevron" size={17} />
          </AppButton>
          <span className="language-swap">
            <Icon name="swap" size={17} />
          </span>
          <AppButton ariaLabel="更改对方语言">
            <span className="language-person other">TA</span>
            <p>
              <small>对方语言</small>
              <strong>英语（美国）</strong>
            </p>
            <Icon name="chevron" size={17} />
          </AppButton>
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

export default DialogueMode
