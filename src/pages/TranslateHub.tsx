import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { FeatureId } from "@/lib/core"



export function TranslateHub({
  onLive,
  onMode,
}: {
  onLive: () => void
  onMode: (mode: FeatureId) => void
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
          <AppButton
            className="hub-main-action"
            onClick={() => onMode("dialogue")}
          >
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

export default TranslateHub
