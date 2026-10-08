import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"



export function SleepLibrary({ onBack }: { onBack: () => void }) {
  const t = useT()
  const [playing, setPlaying] = useState(t("sleep.trackOceanTitle"))
  const [timerOn, setTimerOn] = useState(false)
  const [volumeOn, setVolumeOn] = useState(false)
  const tracks = [
    { title: t("sleep.trackOceanTitle"), detail: t("sleep.trackOceanDetail"), art: "ocean" },
    { title: t("sleep.trackForestTitle"), detail: t("sleep.trackForestDetail"), art: "forest" },
    { title: t("sleep.trackCloudTitle"), detail: t("sleep.trackCloudDetail"), art: "cloud" },
    { title: t("sleep.trackFireTitle"), detail: t("sleep.trackFireDetail"), art: "fire" },
  ]

  return (
    <main className="tab-page sleep-page">
      <AppButton className="sleep-back" onClick={onBack}>
        <Icon name="chevron" size={17} /> {t("sleep.back")}
      </AppButton>
      <header className="page-header sleep-heading">
        <div>
          <span className="eyebrow">{t("sleep.eyebrow")}</span>
          <h1>{t("sleep.title")}</h1>
          <p>{t("sleep.desc")}</p>
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
          <span>{t("sleep.playing")}</span>
          <strong>{playing}</strong>
          <small>{t("sleep.timerNote")}</small>
          <div className="sound-progress">
            <i />
          </div>
        </div>
        <AppButton
          ariaLabel={t("sleep.pauseAria")}
          className="play-main"
          onClick={() => setPlaying(playing ? "" : t("sleep.trackOceanTitle"))}
        >
          <Icon name={playing ? "pause" : "play"} size={22} />
        </AppButton>
      </section>

      <section className="sound-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("sleep.recommended")}</span>
            <h2>{t("sleep.popular")}</h2>
          </div>
          <AppButton
            className="text-button"
            onClick={() => {
              const next = tracks[0]
              setPlaying(next.title)
              toast(`已播放：${next.title}`)
            }}
          >
            <Icon name="play" size={14} /> {t("sleep.viewAll")}
          </AppButton>
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
        <AppButton onClick={() => setTimerOn((value) => !value)}>
          <span>
            <Icon name="moon" />
          </span>
          <p>
            <strong>{t("sleep.timerTitle")}</strong>
            <small>{timerOn ? "30 分钟后自动停止" : t("sleep.timerSub")}</small>
          </p>
          <i className={`sleep-toggle ${timerOn ? "on" : ""}`} />
        </AppButton>
        <AppButton onClick={() => setVolumeOn((value) => !value)}>
          <span>
            <Icon name="audio" />
          </span>
          <p>
            <strong>{t("sleep.volumeTitle")}</strong>
            <small>
              {volumeOn ? "已开启随睡眠自动降音" : t("sleep.volumeSub")}
            </small>
          </p>
          <i className={`sleep-toggle ${volumeOn ? "on" : ""}`} />
        </AppButton>
      </section>
    </main>
  )
}

export default SleepLibrary
