import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { PillBattery } from "@/components/BatteryPair"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { ShortcutEditor } from "@/features/ShortcutEditor"
import { shortcutLabel } from "@/features/ShortcutEditor"
import type { Shortcut } from "@/features/ShortcutEditor"
import type { FeatureId } from "@/lib/core"
import { useLangPair } from "@/lib/core"
import { useDevices } from "@/lib/store"
import { langOption } from "@/lib/translate"
import { useT } from "@/lib/i18n"
import type { DialogueModeId } from "@/features/DialogueMode"

export function Home({
  onConnect,
  shortcuts,
  onSaveShortcuts,
  onMode,
  onChangeDialogueMode,
  onStartPhone,
  dialogueMode,
}: {
  onConnect: () => void
  shortcuts: Shortcut[]
  onSaveShortcuts: (shortcuts: Shortcut[]) => void
  onMode: (mode: FeatureId) => void
  onChangeDialogueMode: () => void
  onStartPhone: () => void
  dialogueMode: DialogueModeId
}) {
  const [editing, setEditing] = useState(false)
  const { me: myLangId, them: themLangId, setMe: setMyLangId, setThem: setThemLangId, swap } =
    useLangPair()
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const enabled = shortcuts.filter((item) => item.enabled)
  const { active } = useDevices()
  const t = useT()
  const connected = active.status === "connected"
  /** 左右耳 + 充电盒的完整电量，仅在 aria / 长按提示里出现 */
  const batterySummary = t("devices.batterySummary")
    .replace("{left}", String(active.leftBattery))
    .replace("{right}", String(active.rightBattery))
    .replace("{case}", String(active.caseBattery))

  const modeOf = (id: string): FeatureId =>
    id === "face" ? "dialogue" : id === "text" ? "text" : (id as FeatureId)

  return (
    <>
      <header className="topbar home-topbar">
        <h1 className="home-title">{t("nav.translate")}</h1>
        <AppButton
          ariaLabel={connected ? `${t("profile.deviceSettings")} · ${batterySummary}` : "设备未连接，打开设备管理"}
          className="device-pill"
          onClick={onConnect}
        >
          <span className={`connected-dot conn-dot ${active.status}`} />
          <Icon name="headphones" size={18} />
          <span className="device-pill-name">{connected ? active.name : "未连接耳机"}</span>
          {connected && <PillBattery
            left={active.leftBattery}
            right={active.rightBattery}
            title={batterySummary}
            offline={!connected}
          />}
        </AppButton>
      </header>

      <main className="content home-simple">
        <p className="prototype-note">交互演示 · 翻译、录音、设备连接与通话服务尚未接入</p>
        <section className="home-hero">
          {/* 设备状态只在顶栏设备胶囊呈现，此处不重复 */}
          <div className="home-lang">
            <AppButton
              className="home-lang-cell"
              onClick={() => setPicker("me")}
            >
              <small>{t("dialogue.myLang")}</small>
              <strong>{langOption(myLangId).native}</strong>
            </AppButton>
            <AppButton
              ariaLabel={t("dialogue.swapLang")}
              className="home-swap"
              onClick={swap}
            >
              <Icon name="swap" size={18} />
            </AppButton>
            <AppButton
              className="home-lang-cell"
              onClick={() => setPicker("them")}
            >
              <small>{t("dialogue.otherLang")}</small>
              <strong>{langOption(themLangId).native}</strong>
            </AppButton>
          </div>

          {connected ? (
            <AppButton className="home-start" onClick={() => onMode("dialogue")}>
              <span className="home-start-icon">
                <Icon name="mic" size={22} />
              </span>
              <span className="home-start-copy">
                <strong>继续对话</strong>
                <small>{dialogueMode === "speaker" ? "手机免提" : dialogueMode === "hybrid" ? "耳机 + 手机" : "一人一只耳机"}</small>
              </span>
              <Icon name="chevron" />
            </AppButton>
          ) : (
            <div className="home-connect">
              <span className="home-connect-icon">
                <Icon name="bluetooth" size={22} />
              </span>
              <div className="home-connect-copy">
                <strong>未连接耳机</strong>
                <small>可先体验手机免提对话</small>
              </div>
              <AppButton className="home-connect-btn" onClick={onConnect}>
                连接耳机
              </AppButton>
            </div>
          )}
          <div className="home-dialogue-actions">
            {!connected && <AppButton className="home-phone-start" onClick={() => {
              onStartPhone()
            }}>用手机开始对话</AppButton>}
            <AppButton className="home-mode-link" onClick={onChangeDialogueMode}>选择对话方式</AppButton>
          </div>
        </section>

        <section className="home-block">
          <div className="section-heading">
            <h2>{t("shortcut.enabled")}</h2>
            <AppButton
              className="edit-trigger"
              onClick={() => setEditing(true)}
            >
              <Icon name="settings" size={14} />
              <span>{t("shortcut.editShort")}</span>
            </AppButton>
          </div>
          <div className="home-tools">
            {enabled.map((item) => (
              <AppButton
                className="home-tool"
                key={item.id}
                onClick={() => onMode(modeOf(item.id))}
              >
                <span className="home-tool-icon">
                  <Icon name={item.icon} size={20} />
                </span>
                <strong>{shortcutLabel(t, item.id).title}</strong>
                <small>{shortcutLabel(t, item.id).detail}</small>
              </AppButton>
            ))}
          </div>
        </section>
      </main>

      {editing && (
        <ShortcutEditor
          onClose={() => setEditing(false)}
          onSave={(items) => {
            onSaveShortcuts(items)
            setEditing(false)
          }}
          shortcuts={shortcuts}
        />
      )}

      {picker && (
        <LangPicker
          onClose={() => setPicker(null)}
          onPick={(id) => {
            if (picker === "me") setMyLangId(id)
            else setThemLangId(id)
            setPicker(null)
          }}
          open
          title={picker === "me" ? t("dialogue.myLang") : t("dialogue.otherLang")}
          value={picker === "me" ? myLangId : themLangId}
        />
      )}
    </>
  )
}

export default Home
