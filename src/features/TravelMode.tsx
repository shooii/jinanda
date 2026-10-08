import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"



export function TravelMode({ onClose }: { onClose: () => void }) {
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
                  disabled={isDownloaded}
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

export default TravelMode
