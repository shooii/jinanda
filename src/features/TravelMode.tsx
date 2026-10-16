import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { LangPicker } from "@/components/LangPicker"
import { useEscapeKey, useLangPair } from "@/lib/core"
import {
  packEntry,
  packsSnapshot,
  probePack,
  startPackDownload,
  subscribePacks,
} from "@/lib/offline-packs"
import { allLanguages, langOption, translatePhraseOf } from "@/lib/translate"
import { playEarcon } from "@/lib/earcon"

type TravelCard = {
  id: string
  category: "sos" | "food" | "traffic" | "hotel" | "shop"
  tag: string
  zh: string
}

const CATEGORIES: { id: TravelCard["category"]; label: string; icon: string }[] = [
  { id: "sos", label: "紧急求援", icon: "warning" },
  { id: "food", label: "点餐禁忌", icon: "sparkles" },
  { id: "traffic", label: "交通问路", icon: "plane" },
  { id: "hotel", label: "酒店住宿", icon: "notes" },
  { id: "shop", label: "购物结账", icon: "bookmark" },
]

const TRAVEL_CARDS: TravelCard[] = [
  // 紧急求援
  { id: "sos-1", category: "sos", tag: "呼救报警", zh: "我遇到了紧急危险，请立即帮我报警或呼叫救护车！" },
  { id: "sos-2", category: "sos", tag: "突发急病", zh: "请帮我联系医生，我突发严重身体不适！" },
  { id: "sos-3", category: "sos", tag: "证件遗失", zh: "我的护照和贵重物品遗失了，请问最近的警察局怎么走？" },

  // 点餐禁忌
  { id: "food-1", category: "food", tag: "坚果过敏", zh: "我对坚果有严重过敏反应，误食会危及生命，请确保食物绝对无坚果！" },
  { id: "food-2", category: "food", tag: "免辣口味", zh: "我不吃辣，请帮我制作完全不辣的口味，非常感谢。" },
  { id: "food-3", category: "food", tag: "找洗手间", zh: "打扰一下，请问洗手间在哪里？" },

  // 交通问路
  { id: "traffic-1", category: "traffic", tag: "打车地址", zh: "请载我前往这个地址，请打表计费，谢谢！" },
  { id: "traffic-2", category: "traffic", tag: "寻找地铁", zh: "请问最近的地铁站怎么走？" },
  { id: "traffic-3", category: "traffic", tag: "呼叫出租", zh: "请问可以帮我叫一辆正规出租车吗？" },

  // 酒店住宿
  { id: "hotel-1", category: "hotel", tag: "办理入住", zh: "您好，我预订了房间，这是我的证件和确认单。" },
  { id: "hotel-2", category: "hotel", tag: "行李寄存", zh: "请问退房后可以将行李寄存在前台吗？稍后我来取。" },
  { id: "hotel-3", category: "hotel", tag: "无线密码", zh: "请问房间的无线网络（Wi-Fi）密码是多少？" },

  // 购物结账
  { id: "shop-1", category: "shop", tag: "询问价格", zh: "请问这个多少钱？" },
  { id: "shop-2", category: "shop", tag: "刷信用卡", zh: "请问这里支持使用信用卡或电子支付吗？" },
  { id: "shop-3", category: "shop", tag: "退税申请", zh: "请问购买这个商品可以在机场办理免税或退税吗？" },
]

export function TravelMode({
  onClose,
  onOpenPhrasebook,
}: {
  onClose: () => void
  onOpenPhrasebook?: () => void
}) {
  const { me, them, setThem } = useLangPair()
  const entries = useSyncExternalStore(subscribePacks, packsSnapshot, packsSnapshot)
  const targets = useMemo(() => allLanguages.filter((item) => item.id !== me), [me])

  const [activeCategory, setActiveCategory] = useState<TravelCard["category"]>("sos")
  const [activeCard, setActiveCard] = useState<{ zh: string; tag: string } | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [customText, setCustomText] = useState("")
  const [showPicker, setShowPicker] = useState(false)
  const [showPacksManager, setShowPacksManager] = useState(false)

  useEscapeKey(() => {
    if (activeCard) setActiveCard(null)
    else if (showPicker) setShowPicker(false)
    else if (showPacksManager) setShowPacksManager(false)
    else onClose()
  })

  // 探测当前目的地语言包状态
  useEffect(() => {
    void probePack(me, them).catch(() => undefined)
  }, [me, them])

  const destOption = langOption(them)
  const currentPack = packEntry(entries, me, them)
  const isCurrentPackReady =
    currentPack.capabilities?.recognition === "installed" &&
    currentPack.capabilities?.translation === "installed"

  const installedCount = targets.filter((item) => {
    const { capabilities } = packEntry(entries, me, item.id)
    return (
      capabilities?.recognition === "installed" &&
      capabilities?.translation === "installed"
    )
  }).length

  const filteredCards = TRAVEL_CARDS.filter((c) => c.category === activeCategory)

  const openFullscreenCard = (zh: string, tag: string) => {
    playEarcon("ready")
    setActiveCard({ zh, tag })
    setFlipped(false)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customText.trim()) return
    openFullscreenCard(customText.trim(), "即时卡片")
    setCustomText("")
  }

  const playSpeech = (text: string) => {
    playEarcon("sos")
    if (!("speechSynthesis" in window)) {
      toast("当前环境不支持语音播报")
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = them === "zh" ? "zh-CN" : them === "en" ? "en-US" : them
    utterance.volume = 1
    utterance.rate = 0.88
    window.speechSynthesis.speak(utterance)
  }

  return (
    <main className="tab-page" style={{ paddingBottom: "5.5rem", minHeight: "100dvh" }}>
      {/* 顶部现代化导航 */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.8rem 1.15rem 0.5rem",
        }}
      >
        <AppButton
          ariaLabel="返回"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            background: "var(--surface-soft, rgba(255,255,255,0.06))",
            border: "1px solid var(--line, rgba(255,255,255,0.1))",
            display: "grid",
            placeItems: "center",
            color: "var(--ink, #fff)",
          }}
          onClick={onClose}
        >
          <Icon name="chevron" size={18} style={{ transform: "rotate(180deg)" }} />
        </AppButton>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>旅行模式</h1>
          <span style={{ fontSize: "0.72rem", color: "var(--muted, #888)" }}>
            出境直出 · 180° 翻转大字卡
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {onOpenPhrasebook && (
            <button
              onClick={onOpenPhrasebook}
              title="常用语手册"
              style={{
                width: "2.3rem",
                height: "2.3rem",
                borderRadius: "50%",
                border: "1px solid var(--line, rgba(255,255,255,0.12))",
                background: "var(--surface-soft, rgba(255,255,255,0.06))",
                color: "var(--ink, #fff)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <Icon name="bookmark" size={15} />
            </button>
          )}

          {/* 目的地语言切换按钮 */}
          <button
            onClick={() => setShowPicker(true)}
            style={{
              padding: "6px 10px",
              borderRadius: "20px",
              border: "1px solid var(--line, rgba(255,255,255,0.12))",
              background: "var(--surface-soft, rgba(255,255,255,0.06))",
              color: "var(--ink, #fff)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{destOption.native}</span>
            <Icon name="chevron" size={12} />
          </button>
        </div>
      </header>

      {/* 目的地离线就绪保障条 */}
      <section style={{ margin: "0.4rem 1.15rem 0.8rem" }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "14px",
            background: isCurrentPackReady
              ? "rgba(46, 213, 115, 0.1)"
              : "rgba(255, 255, 255, 0.04)",
            border: isCurrentPackReady
              ? "1px solid rgba(46, 213, 115, 0.3)"
              : "1px solid var(--line, rgba(255,255,255,0.08))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isCurrentPackReady ? "#2ed573" : "#ffa502",
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "var(--ink, #fff)", fontWeight: 600 }}>
              {destOption.native}离线包：{isCurrentPackReady ? "已就绪 · 断网直接可用" : "未下载离线包"}
            </span>
          </div>

          {!isCurrentPackReady && (
            <button
              onClick={() => startPackDownload(me, them)}
              style={{
                background: "var(--lime, #2f6cf6)",
                border: "none",
                color: "#fff",
                fontSize: "0.74rem",
                fontWeight: 650,
                padding: "4px 10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              一键下载
            </button>
          )}
        </div>
      </section>

      {/* 自定义即时大字翻转输入框 */}
      <section style={{ margin: "0 1.15rem 1rem" }}>
        <form
          onSubmit={handleCustomSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--surface, rgba(255,255,255,0.05))",
            padding: "6px 8px 6px 14px",
            borderRadius: "16px",
            border: "1px solid var(--line, rgba(255,255,255,0.1))",
          }}
        >
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="输入临时要求，一秒大字翻转给对方看..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--ink, #fff)",
              fontSize: "0.85rem",
            }}
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              background: customText.trim() ? "var(--lime, #2f6cf6)" : "rgba(255,255,255,0.08)",
              color: customText.trim() ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: customText.trim() ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            亮屏翻转
          </button>
        </form>
      </section>

      {/* 五大旅行高频场景分类胶囊 */}
      <section style={{ margin: "0 1.15rem 0.8rem" }}>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          {CATEGORIES.map((cat) => {
            const isCur = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  playEarcon("toggle")
                }}
                style={{
                  padding: "7px 12px",
                  borderRadius: "20px",
                  border: isCur
                    ? cat.id === "sos"
                      ? "1px solid #ff4757"
                      : "1px solid var(--lime, #2f6cf6)"
                    : "1px solid var(--line, rgba(255,255,255,0.08))",
                  background: isCur
                    ? cat.id === "sos"
                      ? "rgba(255, 71, 87, 0.2)"
                      : "rgba(47, 108, 246, 0.15)"
                    : "var(--surface, rgba(255,255,255,0.04))",
                  color: isCur
                    ? cat.id === "sos"
                      ? "#ff4757"
                      : "var(--lime, #2f6cf6)"
                    : "var(--muted, #888)",
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* 场景速查卡片列表 */}
      <section style={{ padding: "0 1.15rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredCards.map((card) => {
            const translated = translatePhraseOf(card.zh, them)
            return (
              <div
                key={card.id}
                onClick={() => openFullscreenCard(card.zh, card.tag)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "var(--surface, rgba(255,255,255,0.04))",
                  border: "1px solid var(--line, rgba(255,255,255,0.08))",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: card.category === "sos" ? "#ff4757" : "var(--lime, #2f6cf6)",
                    }}
                  >
                    ● {card.tag}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted, #888)" }}>
                    点按大字翻转 ➔
                  </span>
                </div>
                <strong style={{ fontSize: "0.92rem", color: "var(--ink, #fff)", display: "block", marginBottom: "3px" }}>
                  {card.zh}
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#2ed573", fontWeight: 500 }}>
                  {translated}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 底部离线包全量管理入口 */}
      <footer style={{ margin: "1.4rem 1.15rem 0", textAlign: "center" }}>
        <button
          onClick={() => setShowPacksManager(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted, #888)",
            fontSize: "0.76rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          📦 管理全部离线语言包 ({installedCount}/{targets.length} 已安装)
        </button>
      </footer>

      {/* 全屏 180° 翻转大字卡弹层 */}
      {activeCard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#08090c",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
            boxSizing: "border-box",
          }}
        >
          {/* 顶栏控制 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "#fffa65", fontWeight: 700 }}>
              ● 应急大字卡 ({destOption.native})
            </span>
            <AppButton
              onClick={() => setActiveCard(null)}
              ariaLabel="关闭大字卡"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "none",
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <Icon name="close" size={20} />
            </AppButton>
          </div>

          {/* 核心大字展示区：支持 180° 翻转给对面看 */}
          <div
            style={{
              transform: flipped ? "rotate(180deg)" : "none",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              textAlign: "center",
              padding: "20px 10px",
            }}
          >
            <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", display: "block", marginBottom: "16px" }}>
              {activeCard.zh}
            </span>
            <strong
              style={{
                fontSize: "2rem",
                color: "#fffa65",
                display: "block",
                fontWeight: 800,
                lineHeight: "1.35",
                letterSpacing: "0.02em",
                wordBreak: "break-word",
              }}
            >
              {translatePhraseOf(activeCard.zh, them)}
            </strong>
          </div>

          {/* 底部双大操作：翻转给对方看 / 超大声外放 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                setFlipped((f) => !f)
                playEarcon("toggle")
              }}
              style={{
                flex: 1,
                padding: "15px 0",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="swap" size={18} />
              <span>{flipped ? "翻回我视角" : "180° 翻转给对方看"}</span>
            </button>

            <button
              onClick={() => playSpeech(translatePhraseOf(activeCard.zh, them))}
              style={{
                flex: 1,
                padding: "15px 0",
                borderRadius: "16px",
                background: "#ff4757",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 8px 24px rgba(255, 71, 87, 0.4)",
              }}
            >
              <Icon name="volume" size={18} />
              <span>超大声外放</span>
            </button>
          </div>
        </div>
      )}

      {/* 离线包全量管理抽屉 */}
      {showPacksManager && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              background: "var(--paper, #12141a)",
              borderRadius: "20px 20px 0 0",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "18px 16px 28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <strong style={{ fontSize: "1.05rem", color: "var(--ink, #fff)" }}>
                离线语言包管理 ({installedCount}/{targets.length})
              </strong>
              <button
                onClick={() => setShowPacksManager(false)}
                style={{ background: "none", border: "none", color: "var(--muted, #888)", cursor: "pointer" }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {targets.map((opt) => {
                const entry = packEntry(entries, me, opt.id)
                const ready =
                  entry.capabilities?.recognition === "installed" &&
                  entry.capabilities?.translation === "installed"

                return (
                  <div
                    key={opt.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: "var(--surface, rgba(255,255,255,0.05))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--ink, #fff)", fontSize: "0.9rem" }}>{opt.native}</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted, #888)", marginLeft: "8px" }}>
                        {opt.label}
                      </span>
                    </div>

                    {ready ? (
                      <span style={{ color: "#2ed573", fontSize: "0.78rem", fontWeight: 650 }}>已安装 ✓</span>
                    ) : (
                      <button
                        onClick={() => startPackDownload(me, opt.id)}
                        disabled={entry.downloading}
                        style={{
                          background: "var(--surface-soft, rgba(255,255,255,0.1))",
                          border: "1px solid var(--line, rgba(255,255,255,0.12))",
                          color: "var(--ink, #fff)",
                          fontSize: "0.74rem",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        {entry.downloading ? "下载中..." : "下载"}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 语言选择弹窗 */}
      <LangPicker
        open={showPicker}
        title="选择旅行目的地语言"
        value={them}
        onPick={(id) => {
          setThem(id)
          setShowPicker(false)
        }}
        onClose={() => setShowPicker(false)}
      />
    </main>
  )
}

export default TravelMode
