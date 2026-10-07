import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"



export function SleepLibrary({ onBack }: { onBack: () => void }) {
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

export default SleepLibrary
