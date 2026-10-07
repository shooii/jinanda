import { useEffect, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"



export function CameraMode({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    if (!scanning) return
    setShowResult(false)
    setShowOriginal(false)
    const timer = window.setTimeout(() => {
      setScanning(false)
      setShowResult(true)
    }, 1700)
    return () => window.clearTimeout(timer)
  }, [scanning])

  return (
    <div className="feature-flow camera-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle="菜单、路牌与文档"
        title="拍照翻译"
      />
      <main className="camera-content">
        <div className="camera-languages">
          <span>英语</span>
          <Icon name="swap" size={16} />
          <span>中文</span>
        </div>
        <section className="camera-viewport">
          {showResult && (
            <AppButton
              className="original-toggle"
              onClick={() => setShowOriginal((value) => !value)}
            >
              <Icon name={showOriginal ? "sparkles" : "notes"} size={15} />
              {showOriginal ? "查看中文" : "对照原文"}
            </AppButton>
          )}
          <div
            className={`menu-paper ${
              showResult && !showOriginal ? "translated-paper" : ""
            }`}
            key={showResult && !showOriginal ? "translated" : "original"}
          >
            <span>
              {showResult && !showOriginal ? "今日菜单" : "TODAY'S MENU"}
            </span>
            <strong>
              {showResult && !showOriginal ? "番茄汤" : "Tomato soup"}
            </strong>
            <i />
            <strong>
              {showResult && !showOriginal
                ? "香草烤鸡配时蔬"
                : "Roast chicken with herbs"}
            </strong>
            <i />
            <strong>
              {showResult && !showOriginal
                ? "焦糖苹果挞"
                : "Caramel apple tart"}
            </strong>
          </div>
          <span className="scan-corner corner-a" />
          <span className="scan-corner corner-b" />
          <span className="scan-corner corner-c" />
          <span className="scan-corner corner-d" />
          {scanning && <i className="scan-line" />}
          <div className="camera-guide">
            {scanning
              ? "正在识别并替换英文…"
              : showOriginal
                ? "正在对照英文原文"
                : "已将 4 处英文替换为中文"}
          </div>
        </section>

        {showResult && (
          <section className="direct-translation-status">
            <span className="direct-status-icon">
              <Icon name="check" size={18} />
            </span>
            <div>
              <strong>译文已覆盖到原图</strong>
              <small>保留原有排版与文字位置 · 英语 → 中文</small>
            </div>
            <AppButton ariaLabel="保存翻译图片">
              <Icon name="camera" size={18} />
            </AppButton>
          </section>
        )}
      </main>
      <footer className="camera-controls">
        <AppButton ariaLabel="从相册选择图片" className="gallery-button">
          <Icon name="image" />
        </AppButton>
        <AppButton
          ariaLabel="重新扫描"
          className={`shutter-button ${scanning ? "scanning" : ""}`}
          onClick={() => setScanning(true)}
        >
          <span>
            <Icon name="camera" size={25} />
          </span>
        </AppButton>
        <AppButton ariaLabel="开启闪光灯" className="gallery-button">
          <Icon name="bolt" />
        </AppButton>
      </footer>
    </div>
  )
}

export default CameraMode
