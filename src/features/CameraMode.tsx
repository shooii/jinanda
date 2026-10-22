import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { UpgradePaywallModal } from "@/components/UpgradePaywallModal"
import { useT } from "@/lib/i18n"
import { useUsage } from "@/lib/usage"

/** 拍照翻译：展示菜单原图与译文覆盖的对照视图。 */
export function CameraMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { translationAllowed, deviceMinutes, gate } = useUsage()
  const [paywall, setPaywall] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const translated = showResult && !showOriginal

  return (
    <div className="feature-flow camera-flow">
      <FeatureHeader onClose={onClose} subtitle={t("feature.cameraDetail")} title={t("feature.camera")} />
      <main className="camera-content">
        <div className="camera-languages" aria-label="翻译语言方向">
          <span>English</span><Icon name="swap" size={16} /><span>中文</span>
        </div>
        <section className="camera-viewport" aria-label="菜单图片">
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
          <div className="camera-guide">{translated ? "译文已覆盖在菜单上" : "菜单原图"}</div>
        </section>
        {showResult && <p className="hint-note">你可以切换原文与译文，对照查看版式。</p>}
        <p className="hint-note">
          {translationAllowed
            ? `本机体验剩余 ${Math.floor(deviceMinutes)} 分钟`
            : "体验额度已用完 · 订阅后继续使用取词翻译"}
        </p>
      </main>
      <footer className="camera-controls camera-action-bar">
        <AppButton
          className="camera-action"
          onClick={() => {
            if (!showResult) {
              const result = gate("camera")
              if (!result.allowed || !translationAllowed) {
                toast("体验翻译额度已用完，请订阅后继续使用")
                setPaywall(true)
                return
              }
            }
            setShowResult((value) => !value)
            setShowOriginal(false)
          }}
        >
          <Icon name={showResult ? "notes" : "camera"} size={19} />
          {showResult ? "返回原图" : "查看译文"}
        </AppButton>
      </footer>
      {paywall ? <UpgradePaywallModal reason="device_minutes" onClose={() => setPaywall(false)} /> : null}
    </div>
  )
}

export default CameraMode
