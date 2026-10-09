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
            <p>出发前把地址、酒店和常用表达存进常用语手册，落地就能直接开口，不用现场组织语言。</p>
          </div>
        </section>
        <section className="travel-simple-card">
          <h2>出发前准备</h2>
          <p>把过敏信息、地址和需要反复使用的表达存进常用语手册，使用时可以快速找到并直接朗读。</p>
          <AppButton className="camera-action" onClick={onOpenPhrasebook}>
            <Icon name="message" size={18} /> 打开常用语手册
          </AppButton>
        </section>
      </main>
    </div>
  )
}

export default TravelMode
