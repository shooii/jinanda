import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { MiniBattery } from "@/components/BatteryPair"
import { Earbuds, Icon } from "@/components/Icon"
import { SwitchRow } from "@/components/SwitchRow"
import { useEscapeKey, usePersistentState } from "@/lib/core"
import {
  themeDetailKey,
  themeLabelKey,
  themeModes,
  useThemeMode,
} from "@/lib/theme"
import type { ThemeMode } from "@/lib/theme"
import { DeviceCare } from "@/features/DeviceCare"
import type { CareMode } from "@/features/DeviceCare"
import { DeviceFitTest } from "@/features/DeviceFitTest"
import { EqSettings, defaultEq, eqPresetLabel } from "@/features/EqSettings"
import type { EqState } from "@/features/EqSettings"
import { FindDevice } from "@/features/FindDevice"
import { GestureSettings } from "@/features/GestureSettings"
import { LegalDocument } from "@/features/LegalDocument"
import type { LegalDocId } from "@/features/LegalDocument"
import { ServiceStatus } from "@/features/ServiceStatus"
import { SubscriptionManage } from "@/features/SubscriptionManage"
import { SupportCenter } from "@/features/SupportCenter"
import { WarrantyInfo } from "@/features/WarrantyInfo"
import { channelById, regionById } from "@/lib/payments"
import {
  defaultPrivacy,
  defaultDevicePrefs,
  usePlan,
  useVocabulary,
  vocabularyCategories,
  useDevices,
} from "@/lib/store"
import type { DevicePrefs, PrivacyPrefs } from "@/lib/store"
import { allLanguages, langOption } from "@/lib/translate"
import { useAppLanguage, useT } from "@/lib/i18n"


type PanelId =
  | "device"
  | "language"
  | "vocabulary"
  | "privacy"
  | "theme"
  | null

type OverlayId =
  | "find"
  | "gesture"
  | "eq"
  | "fit"
  | "warranty"
  | "support"
  | "legal"
  | "status"
  | "billing"
  | "devices"
  | CareMode
  | null

const vocabCategoryKey: Record<string, string> = {
  "产品名称": "vocab.cat.product",
  "地点": "vocab.cat.place",
  "联系人姓名": "vocab.cat.contact",
  "专业术语": "vocab.cat.term",
  "其他": "vocab.cat.other",
}

export function Profile({
  onConnect,
  onMembership,
  onSleep,
  onPhrasebook,
}: {
  onConnect: () => void
  onMembership: () => void
  onSleep: () => void
  onPhrasebook: () => void
}) {
  const [panel, setPanel] = useState<PanelId>(null)
  const [overlay, setOverlay] = useState<OverlayId>(null)
  const [legalDoc, setLegalDoc] = useState<LegalDocId>("privacy")
  const [theme, setTheme] = useThemeMode()
  const [eq, setEq] = usePersistentState<EqState>("lingo.eq", defaultEq)
  const [plan] = usePlan()
  const [appLang, setAppLang] = useAppLanguage()
  const t = useT()
  const channel = channelById(plan.channel)
  const region = regionById(plan.regionId)
  const vocabulary = useVocabulary()
  const { active } = useDevices()
  const [vocabEditing, setVocabEditing] = useState<string | null>(null)
  const [vocabTerm, setVocabTerm] = useState("")
  const [vocabCategory, setVocabCategory] = useState<string>(
    vocabularyCategories[0],
  )
  const [vocabNote, setVocabNote] = useState("")
  const [otaState, setOtaState] = useState<
    "idle" | "checking" | "downloading" | "installing" | "done"
  >("idle")
  const [anc, setAnc] = usePersistentState<"off" | "trans" | "on" | "deep">(
    "lingo.anc",
    "on",
  )
  const [privacy, setPrivacy] = usePersistentState<PrivacyPrefs>(
    "lingo.privacy",
    defaultPrivacy,
  )
  const [devicePrefs, setDevicePrefs] = usePersistentState<DevicePrefs>(
    "lingo.device-prefs",
    defaultDevicePrefs,
  )

  const otaBusy =
    otaState === "checking" ||
    otaState === "downloading" ||
    otaState === "installing"

  const runOta = () => {
    if (otaBusy) return
    setOtaState("checking")
    setTimeout(() => setOtaState("downloading"), 1200)
    setTimeout(() => setOtaState("installing"), 2400)
    setTimeout(() => setOtaState("done"), 3600)
  }

  const otaLabel = () => {
    if (otaState === "checking") return `${t("ota.check")}…`
    if (otaState === "downloading") return t("ota.downloading")
    if (otaState === "installing") return t("ota.installing")
    if (otaState === "done") return t("ota.latest")
    return t("ota.check")
  }

  const ancModes: ("off" | "trans" | "on" | "deep")[] = [
    "off",
    "trans",
    "on",
    "deep",
  ]

  useEscapeKey(() => {
    if (overlay) setOverlay(null)
    else if (panel) setPanel(null)
  })

  const themeLabel = (mode: ThemeMode) => t(themeLabelKey(mode))

  const appLangMeta = langOption(appLang)

  return (
    <main className="tab-page profile-page">
      <header className="page-header">
        <div>
          <h1>{t("profile.title")}</h1>
        </div>
      </header>

      {/* 设备卡即本位面的主信息，不再放一张只有占位姓名的用户卡 */}
      <section className="my-device-card">
        <div className="device-card-head">
          <div>
            <span className="eyebrow">
              <i className={`conn-dot ${active.status}`} />
              {active.status === "connected"
                ? t("profile.connected")
                : active.status === "connecting"
                  ? t("devices.statusConnecting")
                  : t("devices.statusDisconnected")}
            </span>
            <h2>{active.id ? active.name : "尚未连接耳机"}</h2>
          </div>
          <AppButton className="text-button" onClick={onConnect}>
            {t("profile.manage")}
          </AppButton>
        </div>
        {active.id && <div className="device-display">
          <Earbuds />
          <div className="device-battery-grid">
            <span>
              <small>{t("profile.earLeft")}</small>
              <MiniBattery level={active.leftBattery} label="L" />
            </span>
            <span>
              <small>{t("profile.earRight")}</small>
              <MiniBattery level={active.rightBattery} label="R" />
            </span>
            <span>
              <small>{t("profile.earCase")}</small>
              <MiniBattery level={active.caseBattery} label={t("devices.caseTag")} />
            </span>
          </div>
        </div>}
        <div className="device-actions">
          <AppButton onClick={onConnect}>
            <Icon name="bluetooth" />
            <span>{active.id ? t("profile.reconnect") : "查看设备"}</span>
          </AppButton>
          {active.id && <AppButton onClick={() => setOverlay("find")}>
            <Icon name="pin" />
            <span>{t("profile.find")}</span>
          </AppButton>}
          {active.id && <AppButton onClick={() => setPanel("device")}>
            <Icon name="settings" />
            <span>{t("profile.deviceSettings")}</span>
          </AppButton>}
        </div>
      </section>

      <AppButton className="membership-row" onClick={onMembership}>
        <span>
          <Icon name="sparkles" />
        </span>
        <div>
          <small>{t("profile.memberLabel")}</small>
          <strong>{plan.source === "none" ? "尚未开通 · 查看方案" : t("profile.memberDetail")}</strong>
        </div>
        <Icon name="chevron" />
      </AppButton>

      <section className="settings-list">
        <h3 className="settings-group-title">外观与翻译</h3>
        <AppButton onClick={() => setPanel("theme")}>
          <span>
            <Icon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"} />
          </span>
          <div>
            <strong>{t("profile.theme")}</strong>
            <small>
              {themeLabel(theme)}{theme === "system" ? ` · ${t("profile.themeAuto")}` : ""}
            </small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("language")}>
          <span>
            <Icon name="globe" />
          </span>
          <div>
            <strong>{t("profile.language")}</strong>
            <small>{appLangMeta.native}</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("vocabulary")}>
          <span>
            <Icon name="sparkles" />
          </span>
          <div>
            <strong>{t("profile.vocabulary")}</strong>
            <small>{t("profile.vocabularyDetail")}</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={onPhrasebook}>
          <span>
            <Icon name="message" />
          </span>
          <div>
            <strong>{t("feature.phrasebook")}</strong>
            <small>{t("feature.phrasebookDetail")}</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <h3 className="settings-group-title">账户与帮助</h3>
        <AppButton onClick={() => setPanel("privacy")}>
          <span>
            <Icon name="notes" />
          </span>
          <div>
            <strong>{t("profile.privacy")}</strong>
            <small>记录保存在当前浏览器，尚未同步账户</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setOverlay("support")}>
          <span>
            <Icon name="headphones" />
          </span>
          <div>
            <strong>{t("profile.support")}</strong>
            <small>{t("profile.supportDetail")}</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={plan.source === "none" ? onMembership : () => setOverlay("billing")}>
          <span>
            <Icon name="card" />
          </span>
          <div>
            <strong>{t("profile.billing")}</strong>
            <small>
              {plan.source === "none" ? "暂无账单" : `${channel ? channel.name : t("profile.billingGift")} · ${region.currency}`}
            </small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={onSleep}>
          <span>
            <Icon name="moon" />
          </span>
          <div>
            <strong>{t("sleep.eyebrow")}</strong>
            <small>{t("sleep.title")}</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
      </section>
      <small className="app-version">LingoPods 1.0 · {active.model || "—"}</small>
      <div className="service-footer">
        <span>
          <i /> 翻译与设备服务尚未接入
        </span>
        <div>
          <AppButton
            onClick={() => {
              setLegalDoc("privacy")
              setOverlay("legal")
            }}
          >
            {t("profile.privacyPolicy")}
          </AppButton>
          <AppButton
            onClick={() => {
              setLegalDoc("agreement")
              setOverlay("legal")
            }}
          >
            {t("profile.agreement")}
          </AppButton>
          <AppButton onClick={() => setOverlay("status")}>
            {t("profile.serviceStatus")}
          </AppButton>
        </div>
      </div>
      {panel && (
        <div className="profile-panel-backdrop" onClick={() => setPanel(null)}>
          <div
            className="profile-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("settings.eyebrow")}
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">{t("settings.eyebrow")}</span>
                <h2>
                  {panel === "device"
                    ? t("panel.device")
                    : panel === "language"
                      ? t("panel.language")
                      : panel === "vocabulary"
                        ? t("panel.vocabulary")
                        : panel === "privacy"
                          ? t("panel.privacy")
                          : panel === "theme"
                            ? t("panel.theme")
                            : t("panel.support")}
                </h2>
              </div>
              <AppButton onClick={() => setPanel(null)}>
                <Icon name="close" />
              </AppButton>
            </header>
            {panel === "theme" && (
              <div className="theme-mode-panel">
                <div className="panel-options theme-mode-options">
                  {themeModes.map((mode) => (
                    <AppButton
                      className={theme === mode.id ? "selected" : ""}
                      key={mode.id}
                      onClick={() => setTheme(mode.id)}
                    >
                      <span className="theme-mode-icon">
                        <Icon name={mode.icon} size={20} />
                      </span>
                      <span>
                        <strong>{t(themeLabelKey(mode.id))}</strong>
                        <small>{t(themeDetailKey(mode.id))}</small>
                      </span>
                      {theme === mode.id && <Icon name="check" />}
                    </AppButton>
                  ))}
                </div>
                <p className="theme-mode-note">
                  <Icon name="monitor" size={15} />
                  {t("theme.note")}
                </p>
              </div>
            )}
            {panel === "language" && (
              <div className="language-panel">
                <p className="language-panel-note">{t("language.note")}</p>
                <div className="panel-options theme-mode-options">
                  {allLanguages.map((item) => {
                    const on = appLang === item.id
                    return (
                      <AppButton
                        className={on ? "selected" : ""}
                        key={item.id}
                        onClick={() => {
                          setAppLang(item.id)
                          toast(t("toast.languageChanged"))
                        }}
                      >
                        <span className="language-code">
                          {item.id.toUpperCase()}
                        </span>
                        <span>
                          <strong>{item.native}</strong>
                          <small>{item.label}</small>
                        </span>
                        {on && <Icon name="check" />}
                      </AppButton>
                    )
                  })}
                </div>
              </div>
            )}
            {panel === "vocabulary" && (
              <div className="vocabulary-panel">
                <div className="vocabulary-stats">
                  <strong>{vocabulary.entries.length}</strong>
                  <span>
                    {t("vocab.stats")}
                    {vocabulary.entries.length === 0 ? t("vocab.statsTip") : ""}
                  </span>
                </div>

                {vocabEditing ? (
                  <div className="vocab-editor">
                    <label className="form-field">
                      <span>{t("vocab.word")}</span>
                      <input
                        onChange={(event) => setVocabTerm(event.target.value)}
                        placeholder={t("vocab.wordPlaceholder")}
                        value={vocabTerm}
                      />
                    </label>
                    <label className="form-field">
                      <span>{t("vocab.category")}</span>
                      <div className="chip-row">
                        {vocabularyCategories.map((item) => (
                          <AppButton
                            className={vocabCategory === item ? "active" : ""}
                            key={item}
                            onClick={() => setVocabCategory(item)}
                          >
                            {t(vocabCategoryKey[item] ?? "vocab.cat.other")}
                          </AppButton>
                        ))}
                      </div>
                    </label>
                    <label className="form-field">
                      <span>{t("vocab.noteLabel")}</span>
                      <input
                        onChange={(event) => setVocabNote(event.target.value)}
                        placeholder={t("vocab.notePlaceholder")}
                        value={vocabNote}
                      />
                    </label>
                    <div className="stack-actions">
                      <AppButton
                        className="manage-button"
                        onClick={() => {
                          const term = vocabTerm.trim()
                          if (!term) return
                          if (vocabEditing === "new") {
                            vocabulary.addEntry({
                              term,
                              category: vocabCategory,
                              note: vocabNote.trim(),
                            })
                            toast(t("vocab.added"))
                          } else {
                            vocabulary.updateEntry(vocabEditing, {
                              term,
                              category: vocabCategory,
                              note: vocabNote.trim(),
                            })
                            toast(t("vocab.updated"))
                          }
                          setVocabEditing(null)
                        }}
                      >
                        {vocabEditing === "new" ? t("vocab.add") : t("vocab.save")}
                      </AppButton>
                      <AppButton
                        className="text-button"
                        onClick={() => setVocabEditing(null)}
                      >
                        {t("vocab.cancel")}
                      </AppButton>
                    </div>
                  </div>
                ) : (
                  <>
                    {vocabulary.entries.length === 0 ? (
                      <p className="empty-tip">
                        {t("vocab.empty")}
                      </p>
                    ) : (
                      <div className="vocabulary-list">
                        {vocabulary.entries.map((item) => (
                          <div key={item.id}>
                            <span>
                              <strong>{item.term}</strong>
                              <small>
                                {t(vocabCategoryKey[item.category] ?? "vocab.cat.other")}
                                {item.note ? ` · ${item.note}` : ""}
                              </small>
                            </span>
                            <AppButton
                              onClick={() => {
                                setVocabEditing(item.id)
                                setVocabTerm(item.term)
                                setVocabCategory(item.category)
                                setVocabNote(item.note)
                              }}
                            >
                              {t("vocab.edit")}
                            </AppButton>
                            <AppButton
                              ariaLabel={`${t("vocab.deleted")} ${item.term}`}
                              className="vocab-remove"
                              onClick={() => {
                                vocabulary.removeEntry(item.id)
                                toast(t("vocab.deleted"))
                              }}
                            >
                              <Icon name="close" size={15} />
                            </AppButton>
                          </div>
                        ))}
                      </div>
                    )}
                    <AppButton
                      className="add-vocabulary"
                      onClick={() => {
                        setVocabEditing("new")
                        setVocabTerm("")
                        setVocabCategory("产品名称")
                        setVocabNote("")
                      }}
                    >
                      <Icon name="plus" /> {t("vocab.add")}
                    </AppButton>
                  </>
                )}
              </div>
            )}
            {panel === "privacy" && (
              <div className="privacy-options">
                <p className="prototype-note">当前为交互演示：偏好和记录仅保存在当前浏览器，尚无账户同步或音频上传。</p>
                <SwitchRow
                  title={t("privacy.save")}
                  detail="仅影响支持保存的演示流程，数据留在当前浏览器"
                  on={privacy.save}
                  onToggle={() =>
                    setPrivacy((prev) => ({ ...prev, save: !prev.save }))
                  }
                />
              </div>
            )}
            {panel === "device" && (
              <>
                <div className="privacy-options">
                  <SwitchRow
                    title={t("device.autoConnect")}
                    detail={t("device.autoConnectDetail")}
                    on={devicePrefs.autoConnect}
                    onToggle={() =>
                      setDevicePrefs((prev) => ({
                        ...prev,
                        autoConnect: !prev.autoConnect,
                      }))
                    }
                  />
                  <SwitchRow
                    title={t("device.wear")}
                    detail={t("device.wearDetail")}
                    on={devicePrefs.wear}
                    onToggle={() =>
                      setDevicePrefs((prev) => ({ ...prev, wear: !prev.wear }))
                    }
                  />
                  <SwitchRow
                    title={t("device.touch")}
                    detail={t("device.touchDetail")}
                    on={devicePrefs.touch}
                    onToggle={() =>
                      setDevicePrefs((prev) => ({ ...prev, touch: !prev.touch }))
                    }
                  />
                </div>
                <div className="device-enhance">
                  <section className="enhance-block">
                    <div className="enhance-row">
                      <div className="enhance-copy">
                        <strong>{t("ota.title")}</strong>
                        <small>{`${t("ota.version")} 2.4.1`}</small>
                      </div>
                      <AppButton
                        className="enhance-action"
                        disabled={otaBusy}
                        onClick={runOta}
                      >
                        {otaLabel()}
                      </AppButton>
                    </div>
                    {otaState === "done" && (
                      <p className="enhance-status">
                        <Icon name="check" size={14} /> {t("ota.done")}
                      </p>
                    )}
                  </section>

                  <section className="enhance-block">
                    <strong className="enhance-title">{t("anc.title")}</strong>
                    <div className="anc-options">
                      {ancModes.map((mode) => (
                        <AppButton
                          key={mode}
                          ariaLabel={t(`anc.${mode}`)}
                          ariaPressed={anc === mode}
                          className={`anc-chip ${
                            anc === mode ? "selected" : ""
                          }`}
                          onClick={() => setAnc(mode)}
                        >
                          <span>{t(`anc.${mode}`)}</span>
                        </AppButton>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="device-info-list">
                  <AppButton onClick={() => setOverlay("gesture")}>
                    <span>
                      <strong>{t("device.keys")}</strong>
                      <small>{t("device.keysDetail")}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton onClick={() => setOverlay("eq")}>
                    <span>
                      <strong>{t("device.eq")}</strong>
                      <small>{eqPresetLabel(eq)}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton onClick={() => setOverlay("fit")}>
                    <span>
                      <strong>{t("device.fit")}</strong>
                      <small>{t("device.fitDetail")}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton onClick={() => setOverlay("clean")}>
                    <span>
                      <strong>{t("device.clean")}</strong>
                      <small>{t("device.cleanDetail")}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton onClick={() => setOverlay("eject")}>
                    <span>
                      <strong>{t("device.eject")}</strong>
                      <small>{t("device.ejectDetail")}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  {/* 固件信息与版本号已在上方 OTA 区块呈现，此处不重复 */}
                  <AppButton onClick={() => setOverlay("warranty")}>
                    <span>
                      <strong>{t("device.warranty")}</strong>
                      <small>{t("device.warrantyDetail")}</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {overlay === "find" && (
        <FindDevice onClose={() => setOverlay(null)} />
      )}
      {overlay === "gesture" && (
        <GestureSettings onClose={() => setOverlay(null)} />
      )}
      {overlay === "eq" && (
        <EqSettings eq={eq} onChange={setEq} onClose={() => setOverlay(null)} />
      )}
      {(overlay === "clean" || overlay === "eject") && (
        <DeviceCare mode={overlay} onClose={() => setOverlay(null)} />
      )}
      {overlay === "fit" && (
        <DeviceFitTest onClose={() => setOverlay(null)} />
      )}
      {overlay === "warranty" && (
        <WarrantyInfo onClose={() => setOverlay(null)} />
      )}
      {overlay === "support" && (
        <SupportCenter onClose={() => setOverlay(null)} />
      )}
      {overlay === "legal" && (
        <LegalDocument doc={legalDoc} onClose={() => setOverlay(null)} />
      )}
      {overlay === "status" && (
        <ServiceStatus onClose={() => setOverlay(null)} />
      )}
      {overlay === "billing" && (
        <SubscriptionManage onClose={() => setOverlay(null)} />
      )}

    </main>
  )
}

export default Profile
