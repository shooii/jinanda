import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { AppButton, AppToast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import type { IconName } from "@/components/Icon"
import { transitionTo, usePersistentState } from "@/lib/core"
import type { FeatureId } from "@/lib/core"
import type { DialogueModeId } from "@/features/DialogueMode"
import { defaultShortcuts, mergeShortcuts } from "@/features/ShortcutEditor"
import { Home } from "@/pages/Home"
import { useT } from "@/lib/i18n"
import { allLanguages } from "@/lib/translate"
import { useOnlineStatus } from "@/lib/pwa"
import { useDocumentLanguage } from "@/lib/locale"

/**
 * 首包只保留首页、导航与基础设施，其余页面按需加载。
 * 之前所有功能都打进同一个 chunk（约 640 KB），首屏为此付出了不必要的下载量。
 */
const Onboarding = lazy(() =>
  import("@/features/Onboarding").then((m) => ({ default: m.Onboarding })),
)
const DeviceManager = lazy(() =>
  import("@/features/DeviceManager").then((m) => ({ default: m.DeviceManager })),
)
const DialogueMode = lazy(() =>
  import("@/features/DialogueMode").then((m) => ({ default: m.DialogueMode })),
)
const LiveSession = lazy(() =>
  import("@/features/LiveSession").then((m) => ({ default: m.LiveSession })),
)
const MeetingMode = lazy(() =>
  import("@/features/MeetingMode").then((m) => ({ default: m.MeetingMode })),
)
const TravelMode = lazy(() =>
  import("@/features/TravelMode").then((m) => ({ default: m.TravelMode })),
)
const CameraMode = lazy(() =>
  import("@/features/CameraMode").then((m) => ({ default: m.CameraMode })),
)
const TextTranslate = lazy(() =>
  import("@/features/TextTranslate").then((m) => ({ default: m.TextTranslate })),
)
const CallTranslate = lazy(() =>
  import("@/features/CallTranslate").then((m) => ({ default: m.CallTranslate })),
)
const WatchMode = lazy(() =>
  import("@/features/WatchMode").then((m) => ({ default: m.WatchMode })),
)
const Coach = lazy(() =>
  import("@/features/Coach").then((m) => ({ default: m.Coach })),
)
const Phrasebook = lazy(() =>
  import("@/features/Phrasebook").then((m) => ({ default: m.Phrasebook })),
)
const Records = lazy(() =>
  import("@/pages/Records").then((m) => ({ default: m.Records })),
)
const SleepLibrary = lazy(() =>
  import("@/pages/SleepLibrary").then((m) => ({ default: m.SleepLibrary })),
)
const Profile = lazy(() =>
  import("@/pages/Profile").then((m) => ({ default: m.Profile })),
)
const Membership = lazy(() =>
  import("@/pages/Membership").then((m) => ({ default: m.Membership })),
)

/** 功能页加载中的占位，避免切换时闪白 */
const routeFallback = (
  <div className="route-loading" role="status">
    <span className="route-loading-dot" />
    正在加载…
  </div>
)


export default function App() {
  const phoneRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState("home")
  const [showLive, setShowLive] = useState(false)
  const [showMembership, setShowMembership] = useState(false)
  const [showDevices, setShowDevices] = useState(false)
  const [dialogueModeChosen, setDialogueModeChosen] = usePersistentState("lingo.dialogue-mode-chosen", false)
  const [dialogueMode, setDialogueMode] = usePersistentState<DialogueModeId>("lingo.dialogue-mode", "share")
  const [onboarded, setOnboarded] = usePersistentState("lingo.onboarded", false)
  const [storedShortcuts, setShortcuts] = usePersistentState(
    "lingo.shortcuts",
    defaultShortcuts,
  )
  // 历史数据补齐：老用户存的旧数组缺新功能时，按最新目录补上，避免新功能「隐身」
  const shortcuts = mergeShortcuts(storedShortcuts)
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null)
  const t = useT()
  const online = useOnlineStatus()
  // 把界面语言同步到 <html lang / dir>，RTL 语言需要整份布局翻转
  useDocumentLanguage()

  useEffect(() => {
    phoneRef.current?.scrollTo({ top: 0 })
  }, [activeFeature, tab, showLive, showDevices, showMembership])

  const navItems: { id: string; label: string; icon: IconName }[] = [
    { id: "home", label: t("nav.translate"), icon: "mic" },
    { id: "notes", label: t("nav.records"), icon: "notes" },
    { id: "profile", label: t("nav.profile"), icon: "profile" },
  ]

  return (
    <div className="app-shell">
      {!online && (
        <div className="offline-banner" role="status">
          <Icon name="globe" size={15} />
          <span>当前离线 · 已缓存的页面与端侧模型仍可继续使用</span>
        </div>
      )}
      <aside className="desktop-story">
        <div className="story-brand">
          <span>L</span> LingoPods
        </div>
        <div className="story-content">
          <span className="story-label">{t("story.label")}</span>
          <h2>
            {t("story.line1")}
            <br />
            {t("story.line2")}
          </h2>
          <p>{t("story.desc")}</p>
          <div className="story-stat">
            <strong>{allLanguages.length}</strong>
            <span>
              {t("story.stat")}
              <br />
              {t("story.note")}
            </span>
          </div>
        </div>
        <span className="story-foot">{t("story.foot")}</span>
      </aside>

      <div className="phone-app" ref={phoneRef}>
        <Suspense fallback={routeFallback}>
        {!onboarded ? (
          <Onboarding onClose={() => transitionTo(() => setOnboarded(true))} />
        ) : showDevices ? (
          <DeviceManager
            onClose={() => transitionTo(() => setShowDevices(false))}
          />
        ) : activeFeature === "dialogue" ? (
          <DialogueMode
            mode={dialogueMode}
            onModeChange={setDialogueMode}
            onClose={() => transitionTo(() => setActiveFeature(null))}
            onStart={() =>
              transitionTo(() => {
                setDialogueModeChosen(true)
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
            onOpenPhrasebook={() => transitionTo(() => setActiveFeature("phrasebook"))}
          />
        ) : activeFeature === "camera" ? (
          <CameraMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "text" ? (
          <TextTranslate
            onClose={() => transitionTo(() => setActiveFeature(null))}
            onNavigate={(feature) =>
              transitionTo(() => setActiveFeature(feature))
            }
          />
        ) : activeFeature === "call" ? (
          <CallTranslate
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "watch" ? (
          <WatchMode
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "coach" ? (
          <Coach
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : activeFeature === "phrasebook" ? (
          <Phrasebook
            onClose={() => transitionTo(() => setActiveFeature(null))}
          />
        ) : showLive ? (
          <LiveSession
            mode={dialogueMode}
            onClose={() => transitionTo(() => setShowLive(false))}
            onFeature={(feature) =>
              transitionTo(() => {
                setShowLive(false)
                setActiveFeature(feature)
              })
            }
          />
        ) : (
          <>
            {tab === "home" ? (
              <Home
                onConnect={() => transitionTo(() => setShowDevices(true))}
                onSaveShortcuts={setShortcuts}
                shortcuts={shortcuts}
                onMode={(mode) => transitionTo(() => {
                  if (mode === "dialogue" && dialogueModeChosen) setShowLive(true)
                  else setActiveFeature(mode)
                })}
                onChangeDialogueMode={() => transitionTo(() => setActiveFeature("dialogue"))}
                onStartPhone={() => transitionTo(() => {
                  setDialogueMode("speaker")
                  setDialogueModeChosen(true)
                  setShowLive(true)
                })}
                dialogueMode={dialogueMode}
              />
            ) : tab === "notes" ? (
              <Records />
            ) : tab === "sleep" ? (
              <SleepLibrary onBack={() => transitionTo(() => setTab("home"))} />
            ) : tab === "profile" ? (
              <Profile
                onConnect={() => transitionTo(() => setShowDevices(true))}
                onMembership={() => transitionTo(() => setShowMembership(true))}
                onSleep={() => transitionTo(() => setTab("sleep"))}
                onPhrasebook={() =>
                  transitionTo(() => setActiveFeature("phrasebook"))
                }
              />
            ) : (
              <main className="empty-view">
                <span className="empty-icon">
                  <Icon name="notes" size={32} />
                </span>
                <h2>{t("empty.title.other")}</h2>
                <p>{t("empty.desc.other")}</p>
              </main>
            )}
            <nav className="bottom-nav" aria-label="主导航">
              {navItems.map((item) => (
                <AppButton
                  ariaLabel={item.label}
                  className={tab === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => setTab(item.id)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </AppButton>
              ))}
            </nav>
          </>
        )}
        </Suspense>
        <Suspense fallback={null}>
          {showMembership && (
            <Membership
              onClose={() => transitionTo(() => setShowMembership(false))}
            />
          )}
        </Suspense>
        <AppToast />
      </div>
    </div>
  )
}
