import { useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { ShortcutEditor } from "@/features/ShortcutEditor"
import type { Shortcut } from "@/features/ShortcutEditor"
import type { FeatureId } from "@/lib/core"
import { useLangPair } from "@/lib/core"
import { useDevices } from "@/lib/store"
import { langOption } from "@/lib/translate"
import { useT } from "@/lib/i18n"

export function Home({
  onConnect,
  shortcuts,
  onSaveShortcuts,
  onMode,
}: {
  onConnect: () => void
  shortcuts: Shortcut[]
  onSaveShortcuts: (shortcuts: Shortcut[]) => void
  onMode: (mode: FeatureId) => void
}) {
  const [editing, setEditing] = useState(false)
  const { me: myLangId, them: themLangId, setMe: setMyLangId, setThem: setThemLangId, swap } =
    useLangPair()
  const [picker, setPicker] = useState<"me" | "them" | null>(null)
  const enabled = shortcuts.filter((item) => item.enabled)
  const { active } = useDevices()
  const t = useT()
  const batteryAvg = Math.round((active.leftBattery + active.rightBattery) / 2)
  const connected = active.status === "connected"

  const modeOf = (id: string): FeatureId =>
    id === "face" ? "dialogue" : id === "text" ? "text" : (id as FeatureId)

  return (
    <>
      <header className="topbar home-topbar">
        <h1 className="home-title">翻译</h1>
        <AppButton
          ariaLabel="管理蓝牙耳机"
          className="device-pill"
          onClick={onConnect}
        >
          <span className={`connected-dot conn-dot ${active.status}`} />
          <Icon name="headphones" size={18} />
          <span className="device-pill-name">{active.name}</span>
          <span>{batteryAvg}%</span>
        </AppButton>
      </header>

      <main className="content home-simple">
        <section className="home-hero">
          {/* 设备状态只在顶栏设备胶囊呈现，此处不重复 */}
          <div className="home-lang">
            <AppButton
              className="home-lang-cell"
              onClick={() => setPicker("me")}
            >
              <small>我的语言</small>
              <strong>{langOption(myLangId).native}</strong>
            </AppButton>
            <AppButton
              ariaLabel="交换语言"
              className="home-swap"
              onClick={swap}
            >
              <Icon name="swap" size={18} />
            </AppButton>
            <AppButton
              className="home-lang-cell"
              onClick={() => setPicker("them")}
            >
              <small>对方语言</small>
              <strong>{langOption(themLangId).native}</strong>
            </AppButton>
          </div>

          {connected ? (
            <AppButton className="home-start" onClick={() => onMode("dialogue")}>
              <span className="home-start-icon">
                <Icon name="mic" size={22} />
              </span>
              <span className="home-start-copy">
                <strong>{t("dialogue.start")}</strong>
              </span>
              <Icon name="chevron" />
            </AppButton>
          ) : (
            <div className="home-connect">
              <span className="home-connect-icon">
                <Icon name="bluetooth" size={22} />
              </span>
              <div className="home-connect-copy">
                <strong>{t("home.connectTitle")}</strong>
                <small>{t("home.connectHint")}</small>
              </div>
              <AppButton className="home-connect-btn" onClick={onConnect}>
                {t("home.connectButton")}
              </AppButton>
            </div>
          )}
        </section>

        <section className="home-block">
          <div className="section-heading">
            <h2>快捷功能</h2>
            <AppButton
              className="edit-trigger"
              onClick={() => setEditing(true)}
            >
              <Icon name="settings" size={14} />
              <span>编辑</span>
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
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
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
          title={picker === "me" ? "我的语言" : "对方语言"}
          value={picker === "me" ? myLangId : themLangId}
        />
      )}
    </>
  )
}

export default Home
