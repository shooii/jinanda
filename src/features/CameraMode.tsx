import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { useT } from "@/lib/i18n"

/** 图片识别尚未接入时，只展示明确标记的固定示例。 */
export function CameraMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [showResult, setShowResult] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const translated = showResult && !showOriginal

  return (
    <div className="feature-flow camera-flow">
      <FeatureHeader onClose={onClose} subtitle={t("feature.cameraDetail")} title={t("feature.camera")} />
      <main className="camera-content">
        <p className="demo-note">图片翻译演示 · 当前版本尚未接入相机或图片识别</p>
        <div className="camera-languages" aria-label="示例语言方向">
          <span>English</span><Icon name="swap" size={16} /><span>中文</span>
        </div>
        <section className="camera-viewport" aria-label="示例菜单图片">
          {showResult && (
            <AppButton className="original-toggle" onClick={() => setShowOriginal((value) => !value)}>
              <Icon name={showOriginal ? "sparkles" : "notes"} size={15} />
              {showOriginal ? t("camera.showTranslated") : t("camera.showOriginal")}
            </AppButton>
          )}
          <div className={`menu-paper ${translated ? "translated-paper" : ""}`}>
            <span>{translated ? "今日菜单" : "TODAY'S MENU"}</span>
            <strong>{translated ? "番茄汤" : "Tomato soup"}</strong>
            <i />
            <strong>{translated ? "香草烤鸡配时蔬" : "Roast chicken with herbs"}</strong>
            <i />
            <strong>{translated ? "焦糖苹果挞" : "Caramel apple tart"}</strong>
          </div>
          <div className="camera-guide">{translated ? "示例译文已覆盖在菜单上" : "固定示例图片"}</div>
        </section>
        {showResult && <p className="demo-note">你可以切换原文和译文，对照查看版式。</p>}
      </main>
      <footer className="camera-controls camera-demo-controls">
        <AppButton className="camera-demo-action" onClick={() => { setShowResult((value) => !value); setShowOriginal(false) }}>
          <Icon name={showResult ? "notes" : "camera"} size={19} />
          {showResult ? "返回示例原图" : "查看示例翻译"}
        </AppButton>
      </footer>
    </div>
  )
}

export default CameraMode
