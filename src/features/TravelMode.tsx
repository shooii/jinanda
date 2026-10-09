import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"

export function TravelMode({
  onClose,
  onOpenPhrasebook,
}: {
  onClose: () => void
  onOpenPhrasebook: () => void
}) {
  return (
    <div className="feature-flow travel-flow">
      <FeatureHeader onClose={onClose} subtitle="出行常用表达" title="旅行模式" />
      <main className="travel-content">
        <section className="offline-hero">
          <div>
            <span className="eyebrow"><Icon name="plane" size={15} /> 出行准备</span>
            <h1>先把常用表达准备好</h1>
            <p>页面已加载时可查看内置常用语。当前版本尚未支持离线启动、语言包下载或离线语音翻译。</p>
          </div>
        </section>
        <section className="travel-simple-card">
          <h2>出发前建议</h2>
          <p>在常用语手册中保存地址、过敏信息和需要反复使用的表达，使用时可以快速找到。</p>
          <AppButton className="camera-demo-action" onClick={onOpenPhrasebook}>
            <Icon name="message" size={18} /> 打开常用语手册
          </AppButton>
        </section>
      </main>
    </div>
  )
}

export default TravelMode
