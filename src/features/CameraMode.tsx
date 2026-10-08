import { useEffect, useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { FeatureHeader } from "@/components/FeatureHeader"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { usePersistentState } from "@/lib/core"
import { useT } from "@/lib/i18n"
import { langOption } from "@/lib/translate"
import type { LangId } from "@/lib/translate"



export function CameraMode({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [scanning, setScanning] = useState(true)
  /** 每点一次快门自增，用于在「已在扫描」时也能重新触发一次扫描 */
  const [scanRun, setScanRun] = useState(0)
  const [showResult, setShowResult] = useState(false)
  /** 点按快门的短暂反馈：扫描中再点也能看到明确响应 */
  const [pulsing, setPulsing] = useState(false)
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
  }, [scanning, scanRun])

  return (
    <div className="feature-flow camera-flow">
      <FeatureHeader
        onClose={onClose}
        subtitle={t("feature.cameraDetail")}
        title={t("feature.camera")}
      />
      <main className="camera-content">
        <div className="camera-languages">
          <AppButton onClick={() => setPicker("from")}>
            {langOption(fromLang).native}
          </AppButton>
          <AppButton
            ariaLabel={t("dialogue.swapLang")}
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
              {showOriginal ? t("camera.showTranslated") : t("camera.showOriginal")}
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
          {scanning && <i className="scan-line" key={scanRun} />}
          <div className="camera-guide">
            {scanning
              ? t("camera.scanning")
              : showOriginal
                ? t("camera.showingSource")
                : t("camera.replaced")}
          </div>
        </section>

        {showResult && (
          <section className="direct-translation-status">
            <span className="direct-status-icon">
              <Icon name="check" size={18} />
            </span>
            <div>
              <strong>{t("camera.replaced")}</strong>
              <small>
                {t("camera.overlayHint")} · {langOption(fromLang).label} →{" "}
                {langOption(toLang).label}
              </small>
            </div>
            <AppButton
              ariaLabel={t("camera.saveImage")}
              onClick={() => toast(t("camera.saved"))}
            >
              <Icon name="camera" size={18} />
            </AppButton>
          </section>
        )}
      </main>
      <footer className="camera-controls">
        <AppButton
          ariaLabel={t("camera.pickImage")}
          className="gallery-button"
          onClick={() => {
            setScanning(true)
            toast(t("camera.picked"))
          }}
        >
          <Icon name="image" />
        </AppButton>
        <AppButton
          ariaLabel={t("camera.rescan")}
          className={`shutter-button ${scanning ? "scanning" : ""}${pulsing ? " pulsing" : ""}`}
          onClick={() => {
            setScanRun((n) => n + 1)
            setScanning(true)
            setPulsing(true)
            window.setTimeout(() => setPulsing(false), 340)
          }}
        >
          <span>
            <Icon name="camera" size={25} />
          </span>
        </AppButton>
        <AppButton
          ariaLabel={t("camera.flash")}
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
          title={picker === "from" ? t("camera.sourceLang") : t("camera.targetLang")}
          value={picker === "from" ? fromLang : toLang}
        />
      )}
    </div>
  )
}

export default CameraMode
