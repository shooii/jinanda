import { useState } from "react"
import { AppButton, DemoToast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { transitionTo, usePersistentState } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import { BluetoothSetup } from "@/features/BluetoothSetup"
import { CameraMode } from "@/features/CameraMode"
import { DialogueMode } from "@/features/DialogueMode"
import { LiveSession } from "@/features/LiveSession"
import { MeetingMode } from "@/features/MeetingMode"
import { TravelMode } from "@/features/TravelMode"
import { defaultShortcuts } from "@/features/ShortcutEditor"
import { Home } from "@/pages/Home"
import { Membership } from "@/pages/Membership"
import { Profile } from "@/pages/Profile"
import { Records } from "@/pages/Records"
import { SleepLibrary } from "@/pages/SleepLibrary"
import { TranslateHub } from "@/pages/TranslateHub"



export default function App() {
  const [tab, setTab] = useState("home")
  const [showLive, setShowLive] = useState(false)
  const [showMembership, setShowMembership] = useState(false)
  const [showBluetooth, setShowBluetooth] = useState(false)
  const [shortcuts, setShortcuts] = usePersistentState(
    "lingo.shortcuts",
    defaultShortcuts,
  )
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null)

  const navItems: { id: string label: string icon: IconName }[] = [
    { id: "home", label: "首页", icon: "home" },
    { id: "live", label: "翻译", icon: "mic" },
    { id: "notes", label: "记录", icon: "notes" },
    { id: "profile", label: "我的", icon: "profile" },
  ]

  return (
    <div className="app-shell">
      <aside className="desktop-story">
        <div className="story-brand">
          <span>L</span> LingoPods
        </div>
        <div className="story-content">
          <span className="story-label">听见 · 理解 · 连接</span>
          <h2>
            每一种声音，
            <br />
            都近在耳边。
          </h2>
          <p>专为耳机打造的 AI 翻译，无需一直盯着手机屏幕。</p>
          <div className="story-stat">
            <strong>42</strong>
            <span>
              种语言
              <br />
              覆盖真实生活场景
            </span>
          </div>
        </div>
        <span className="story-foot">专为 LingoPods Pro 打造</span>
      </aside>

      <div className="phone-app">
        {showBluetooth ? (
          <BluetoothSetup
            onClose={() => transitionTo(() => setShowBluetooth(false))}
          />
        ) : activeFeature === "dialogue" ? (
          <DialogueMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
            onStart={() =>
              transitionTo(() => {
                setActiveFeature(null)
                setShowLive(true)
              })
            }
          />
        ) : activeFeature === "meeting" ? (
          <MeetingMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "travel" ? (
          <TravelMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "camera" ? (
          <CameraMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : showLive ? (
          <LiveSession onClose={() => transitionTo(() => setShowLive(false))} />
        ) : (
          <>
            {tab === "home" ? (
              <Home
                onConnect={() => transitionTo(() => setShowBluetooth(true))}
                onRecords={() => transitionTo(() => setTab("notes"))}
                onSleep={() => transitionTo(() => setTab("sleep"))}
                onStart={() =>
                  transitionTo(() => setActiveFeature("dialogue"))
                }
                onUpgrade={() => transitionTo(() => setShowMembership(true))}
                onSaveShortcuts={setShortcuts}
                shortcuts={shortcuts}
                onMode={(mode) => transitionTo(() => setActiveFeature(mode))}
              />
            ) : tab === "live" ? (
              <TranslateHub
                onLive={() => transitionTo(() => setShowLive(true))}
                onMode={(mode) => transitionTo(() => setActiveFeature(mode))}
              />
            ) : tab === "notes" ? (
              <Records />
            ) : tab === "sleep" ? (
              <SleepLibrary onBack={() => transitionTo(() => setTab("home"))} />
            ) : tab === "profile" ? (
              <Profile
                onConnect={() => transitionTo(() => setShowBluetooth(true))}
                onMembership={() => transitionTo(() => setShowMembership(true))}
              />
            ) : (
              <main className="empty-view">
                <span className="empty-icon">
                  <Icon
                    name={
                      tab === "live"
                        ? "mic"
                        : tab === "notes"
                          ? "notes"
                          : "profile"
                    }
                    size={32}
                  />
                </span>
                <h2>{tab === "live" ? "准备开始翻译" : "你的 LingoPods"}</h2>
                <p>
                  {tab === "live"
                    ? "几秒钟内即可开始自然流畅的双向对话。"
                    : "管理你的设备、语言和会员权益。"}
                </p>
                {tab === "live" && (
                  <AppButton
                    className="manage-button"
                    onClick={() => setShowLive(true)}
                  >
                    开始实时翻译
                  </AppButton>
                )}
              </main>
            )}
            <nav className="bottom-nav" aria-label="主导航">
              {navItems.map((item) => (
                <AppButton
                  ariaLabel={item.label}
                  className={tab === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => transitionTo(() => setTab(item.id))}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </AppButton>
              ))}
            </nav>
          </>
        )}
        {showMembership && (
          <Membership
            onClose={() => transitionTo(() => setShowMembership(false))}
          />
        )}
        <DemoToast />
      </div>
    </div>
  )
}

