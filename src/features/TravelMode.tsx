import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { useLangPair } from "@/lib/core"
import { useT } from "@/lib/i18n"
import {
  offlinePacksSupported,
  packEntry,
  packsSnapshot,
  probePack,
  startPackDownload,
  subscribePacks,
  type CapState,
  type PackEntry,
} from "@/lib/offline-packs"
import { allLanguages, langOption } from "@/lib/translate"
import type { LanguageOption } from "@/lib/translate"

/**
 * 旅行模式 = 离线语言包。
 *
 * 页面上的每个状态都来自浏览器的端侧模型（SpeechRecognition / Translator）：
 * 下载是真实触发的，进度来自浏览器事件；拿不到信息时只显示「进行中」，
 * 不出现编造的容量、占用或下载速度。
 */
export function TravelMode({
  onClose,
  onOpenPhrasebook,
}: {
  onClose: () => void
  onOpenPhrasebook: () => void
}) {
  const t = useT()
  const { me } = useLangPair()
  const entries = useSyncExternalStore(subscribePacks, packsSnapshot, packsSnapshot)
  const supported = useMemo(() => offlinePacksSupported(), [])
  /** 语言包列表＝除「我的语言」以外的全部语言 */
  const targets = useMemo(() => allLanguages.filter((item) => item.id !== me), [me])

  // 进入页面时探测每一条的真实状态（模块内缓存，重复进入不会重复探测）
  useEffect(() => {
    targets.forEach((item) => {
      void probePack(me, item.id).catch(() => undefined)
    })
  }, [me, targets])

  const stateLabel = useCallback(
    (state: CapState) =>
      state === "installed"
        ? t("packs.stateInstalled")
        : state === "downloadable"
          ? t("packs.stateDownloadable")
          : state === "downloading"
            ? t("packs.stateDownloading")
            : t("packs.stateUnsupported"),
    [t],
  )

  const installedCount = targets.filter((item) => {
    const { capabilities } = packEntry(entries, me, item.id)
    return (
      capabilities?.recognition === "installed" &&
      capabilities?.translation === "installed"
    )
  }).length

  const progressWidth = targets.length
    ? `${Math.round((installedCount / targets.length) * 100)}%`
    : "0%"

  const summary = t("packs.summary")
    .replace("{done}", String(installedCount))
    .replace("{total}", String(targets.length))

  const rowCapability = (entry: PackEntry) => {
    const capabilities = entry.capabilities
    if (!capabilities) return t("packs.checking")
    return [
      `${t("packs.capRecognition")} · ${stateLabel(capabilities.recognition)}`,
      `${t("packs.capTranslation")} · ${stateLabel(capabilities.translation)}`,
    ].join(" · ")
  }

  const rowAction = (option: LanguageOption, entry: PackEntry) => {
    const capabilities = entry.capabilities
    const ready =
      capabilities?.recognition === "installed" &&
      capabilities?.translation === "installed"
    const name = langOption(option.id).native

    if (entry.downloading) {
      return (
        <span
          className="pack-loading"
          role="status"
          aria-label={t("packs.stateDownloading")}
        >
          <i />
        </span>
      )
    }

    if (ready) {
      return (
        <span className="pack-downloaded" aria-label={t("packs.stateInstalled")}>
          <Icon name="check" size={16} />
        </span>
      )
    }

    if (
      capabilities &&
      capabilities.recognition === "unsupported" &&
      capabilities.translation === "unsupported"
    ) {
      return (
        <span
          className="pack-downloaded is-off"
          aria-label={t("packs.stateUnsupported")}
        >
          <Icon name="close" size={14} />
        </span>
      )
    }

    // 同步触发下载：浏览器要求模型下载必须在用户手势内发起
    return (
      <AppButton
        ariaLabel={`${
          entry.failed
            ? t("packs.retry")
            : entry.partial
              ? t("packs.partial")
              : t("packs.download")
        } · ${name}`}
        className="pack-download"
        onClick={() => startPackDownload(me, option.id)}
      >
        <Icon name={entry.failed || entry.partial ? "play" : "plus"} size={16} />
      </AppButton>
    )
  }

  return (
    <div className="feature-flow travel-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle={t("packs.eyebrow")}
        title={t("feature.travel")}
      />
      <main className="travel-content">
        <section className="offline-hero">
          <div>
            <span className="eyebrow">
              <Icon name="plane" size={15} /> {t("packs.eyebrow")}
            </span>
            <h1>{t("packs.title")}</h1>
            <p>{t("packs.desc")}</p>
          </div>
          {supported && (
            <div className="storage-bar">
              <span>
                <i style={{ width: progressWidth }} />
              </span>
              <small>{summary}</small>
            </div>
          )}
        </section>

        {!supported ? (
          <section className="travel-simple-card">
            <h2>{t("packs.unsupportedTitle")}</h2>
            <p>{t("packs.unsupportedDesc")}</p>
          </section>
        ) : (
          <>
            <div className="travel-section-head">
              <div>
                <span className="eyebrow">{t("packs.eyebrow")}</span>
                <h2>{t("packs.listTitle")}</h2>
              </div>
              <span>
                {t("packs.myLanguage")} · {langOption(me).native}
              </span>
            </div>

            <section className="language-packs">
              {targets.map((option) => {
                const entry = packEntry(entries, me, option.id)
                const percent =
                  entry.downloading && entry.progress > 0
                    ? ` ${Math.round(entry.progress * 100)}%`
                    : ""
                return (
                  <div className="language-pack" key={option.id}>
                    <span className="language-code">{option.id.toUpperCase()}</span>
                    <div>
                      <strong>{langOption(option.id).native}</strong>
                      <small>{rowCapability(entry)}</small>
                      {entry.downloading && (
                        <span className="pack-capabilities" role="status">
                          {t("packs.stateDownloading")}
                          {percent}
                        </span>
                      )}
                      {entry.failed && !entry.downloading && (
                        <span className="pack-capabilities" role="status">
                          {t("packs.failed")}
                        </span>
                      )}
                      {entry.partial && !entry.failed && !entry.downloading && (
                        <span className="pack-capabilities" role="status">
                          {t("packs.partial")}
                        </span>
                      )}
                    </div>
                    {rowAction(option, entry)}
                  </div>
                )
              })}
            </section>

            <section className="travel-simple-card">
              <h2>{t("feature.travel")}</h2>
              <p>{t("packs.shared")}</p>
              <AppButton className="camera-action" onClick={onOpenPhrasebook}>
                <Icon name="message" size={18} /> {t("phrases.title")}
              </AppButton>
            </section>

            <p className="hint-note">{t("packs.footer")}</p>
          </>
        )}
      </main>
    </div>
  )
}

export default TravelMode
