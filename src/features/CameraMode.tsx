import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { usePersistentState } from "@/lib/core"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"



export function CameraMode({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [flash, setFlash] = useState(false)
  const [picker, setPicker] = useState<"from" | "to" | null>(null)
  const [fromLang, setFromLang] = usePersistentState<LangId>(
    "lingo.camera-from",
    "en",
  )
  const [toLang, setToLang] = usePersistentState<LangId>("lingo.camera-to", "zh")

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
          <AppButton onClick={() => setPicker("from")}>
            {langOption(fromLang).native}
          </AppButton>
          <AppButton
            ariaLabel="交换语言"
            onClick={() => {
              const prev = fromLang
              setFromLang(toLang)
              setToLang(prev)
              setScanning(true)
            }}
          >
            <Icon name="swap" size={16} />
          </AppButton>
          <AppButton onClick={() => setPicker("to")}>
            {langOption(toLang).native}
          </AppButton>
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
              <small>
                保留原有排版与文字位置 · {langOption(fromLang).label} →{" "}
                {langOption(toLang).label}
              </small>
            </div>
            <AppButton
              ariaLabel="保存翻译图片"
              onClick={() => toast("图片已保存到相册")}
            >
              <Icon name="camera" size={18} />
            </AppButton>
          </section>
        )}
      </main>
      <footer className="camera-controls">
        <AppButton
          ariaLabel="从相册选择图片"
          className="gallery-button"
          onClick={() => {
            setScanning(true)
            toast("已从相册选取图片")
          }}
        >
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
        <AppButton
          ariaLabel={flash ? "关闭闪光灯" : "开启闪光灯"}
          className={`gallery-button ${flash ? "flash-on" : ""}`}
          onClick={() => setFlash((value) => !value)}
        >
          <Icon name="bolt" />
        </AppButton>
      </footer>

      {picker && (
        <LangPicker
          onClose={() => setPicker(null)}
          onPick={(id) => {
            if (picker === "from") setFromLang(id)
            else setToLang(id)
            setPicker(null)
            setScanning(true)
          }}
          open
          title={picker === "from" ? "识别语言" : "翻译为"}
          value={picker === "from" ? fromLang : toLang}
        />
      )}
    </div>
  )
}

export default CameraMode
