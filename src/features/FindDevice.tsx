import { useEffect, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { useEscapeKey } from "@/lib/core"

const NAV_TOTAL = 35



type RingTarget = "both" | "left" | "right"

const ringTargets: { id: RingTarget; label: string }[] = [
  { id: "both", label: "双耳" },
  { id: "left", label: "左耳" },
  { id: "right", label: "右耳" },
]

/** 街区底图插画 */
function SchematicMap() {
  return (
    <svg
      aria-label="设备位置示意图"
      className="find-map-canvas"
      viewBox="0 0 340 400"
    >
      {/* 街区块 */}
      <rect
        className="map-block"
        height="74"
        rx="6"
        width="88"
        x="18"
        y="22"
      />
      <rect
        className="map-block"
        height="58"
        rx="6"
        width="64"
        x="122"
        y="30"
      />
      <rect
        className="map-block"
        height="66"
        rx="6"
        width="80"
        x="200"
        y="18"
      />
      <rect
        className="map-block"
        height="62"
        rx="6"
        width="58"
        x="292"
        y="42"
      />
      <rect
        className="map-block"
        height="60"
        rx="6"
        width="72"
        x="26"
        y="120"
      />
      <rect
        className="map-block"
        height="84"
        rx="6"
        width="94"
        x="232"
        y="108"
      />
      <rect
        className="map-block"
        height="56"
        rx="6"
        width="66"
        x="120"
        y="212"
      />
      <rect
        className="map-block"
        height="64"
        rx="6"
        width="58"
        x="34"
        y="300"
      />
      <rect
        className="map-block"
        height="52"
        rx="6"
        width="84"
        x="128"
        y="316"
      />
      <rect
        className="map-block"
        height="58"
        rx="6"
        width="76"
        x="244"
        y="292"
      />

      {/* 公园与水面 */}
      <rect
        className="map-park"
        height="70"
        rx="10"
        width="82"
        x="122"
        y="118"
      />
      <circle className="map-park-tree" cx="140" cy="136" r="7" />
      <circle className="map-park-tree" cx="162" cy="152" r="9" />
      <circle className="map-park-tree" cx="186" cy="134" r="6" />
      <path
        className="map-water"
        d="M18 246c26-14 44 10 70 4s40-24 66-18 30 26 54 30 44-8 58-22v52c-18 12-38 20-62 16s-42-18-66-22-46 6-68 16-38 8-52 0Z"
      />

      {/* 道路 */}
      <g className="map-roads">
        <path d="M108 0v400" />
        <path d="M224 0v400" />
        <path d="M0 104h340" />
        <path d="M0 212h340" />
        <path d="M0 288h340" />
      </g>
      <g className="map-road-dashes">
        <path d="M108 0v400" />
        <path d="M224 0v400" />
        <path d="M0 104h340" />
        <path d="M0 212h340" />
        <path d="M0 288h340" />
      </g>

      {/* 用户与设备之间的路径 */}
      <path
        className="map-route"
        d="M170 318v-64l-62-40v-58"
      />

      {/* 用户位置 */}
      <g className="map-user">
        <circle className="map-user-halo" cx="170" cy="318" r="20" />
        <circle cx="170" cy="318" r="9" />
      </g>

      {/* 设备位置 */}
      <g className="map-device">
        <circle className="map-device-pulse" cx="108" cy="156" r="16" />
        <circle className="map-device-accuracy" cx="108" cy="156" r="26" />
        <g transform="translate(108 156)">
          <path d="M0-15c-6.6 0-12 5.4-12 12 0 8.2 12 19 12 19s12-10.8 12-19c0-6.6-5.4-12-12-12Z" />
          <circle className="map-device-core" cx="0" cy="-3" r="4.6" />
        </g>
      </g>
    </svg>
  )
}

export function FindDevice({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"sound" | "map">("sound")
  const [ringing, setRinging] = useState(true)
  const [target, setTarget] = useState<RingTarget>("both")
  const [navigating, setNavigating] = useState(false)
  const [distance, setDistance] = useState(NAV_TOTAL)

  useEscapeKey(() => {
    if (navigating) setNavigating(false)
    else onClose()
  })

  useEffect(() => {
    if (!navigating || distance <= 0) return
    const timer = window.setTimeout(() => {
      setDistance((value) => Math.max(0, value - 5))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [navigating, distance])

  const startNavigation = () => {
    setDistance(NAV_TOTAL)
    setNavigating(true)
  }

  const targetLabel =
    target === "both" ? "双耳" : target === "left" ? "左耳" : "右耳"

  return (
    <div className="find-overlay" role="dialog" aria-modal="true" aria-label="查找耳机">
      <header className="find-header">
        <AppButton
          ariaLabel="关闭查找耳机"
          className="find-close"
          onClick={onClose}
        >
          <Icon name="close" size={19} />
        </AppButton>
        <div>
          <strong>查找耳机</strong>
          <small>LingoPods Pro · 已连接</small>
        </div>
        <span className="find-live-dot" aria-hidden="true" />
      </header>

      <div className="find-tabs" role="tablist">
        <AppButton
          className={tab === "sound" ? "active" : ""}
          onClick={() => setTab("sound")}
        >
          <Icon name="bell" size={17} />
          <span>声音查找</span>
        </AppButton>
        <AppButton
          className={tab === "map" ? "active" : ""}
          onClick={() => setTab("map")}
        >
          <Icon name="map" size={17} />
          <span>地图查找</span>
        </AppButton>
      </div>

      {tab === "sound" ? (
        <div className="find-body">
          <div className="find-radar">
            <i />
            <i />
            <span>
              <Icon name="headphones" size={30} />
            </span>
          </div>
          <span className="eyebrow">
            {ringing ? "正在播放提示音" : "提示音已停止"}
          </span>
          <h2>{ringing ? `${targetLabel}正在响铃` : "耳机就在附近"}</h2>
          <p>
            {ringing
              ? "声音将逐渐增大，直到找到耳机。"
              : "点击下方按钮重新播放提示音。"}
          </p>

          <div className="ring-targets" role="group" aria-label="选择响铃的耳机">
            {ringTargets.map((item) => (
              <AppButton
                className={target === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setTarget(item.id)}
              >
                {item.label}
              </AppButton>
            ))}
          </div>

          <AppButton
            className="manage-button find-action"
            onClick={() => setRinging(!ringing)}
          >
            {ringing ? "已找到，停止播放" : "重新播放提示音"}
          </AppButton>
        </div>
      ) : navigating ? (
        <div className="find-body nav-body">
          <div className="nav-head">
            <span className="eyebrow">
              <i /> {distance > 0 ? "正在导航" : "已到达"}
            </span>
            <h2>
              {distance > 0 ? `距耳机还有 ${distance} 米` : "耳机就在附近"}
            </h2>
            <p>
              {distance > 0
                ? "沿路线前进，可随时让耳机响铃做确认。"
                : "点击“在此处响铃”，用声音完成最后确认。"}
            </p>
          </div>
          <div
            className="nav-progress"
            role="progressbar"
            aria-valuenow={Math.round(((NAV_TOTAL - distance) / NAV_TOTAL) * 100)}
          >
            <i style={{ width: `${((NAV_TOTAL - distance) / NAV_TOTAL) * 100}%` }} />
          </div>
          <ol className="nav-steps">
            <li className={distance <= 25 ? "finished" : ""}>
              <span>1</span>
              向东北步行约 20 米
            </li>
            <li className={distance <= 10 ? "finished" : ""}>
              <span>2</span>
              在走廊尽头左转
            </li>
            <li className={distance === 0 ? "finished" : ""}>
              <span>3</span>
              耳机落在沙发附近
            </li>
          </ol>
          <div className="find-map-actions">
            <AppButton
              className="manage-button"
              onClick={() => {
                setTab("sound")
                setRinging(true)
                setNavigating(false)
              }}
            >
              <Icon name="bell" size={17} />
              <span>在此处响铃</span>
            </AppButton>
            <AppButton
              className="find-nav-button"
              onClick={() => setNavigating(false)}
            >
              <Icon name="close" size={16} />
              <span>结束导航</span>
            </AppButton>
          </div>
          <p className="find-map-note">
            <Icon name="check" size={14} />
            路线基于蓝牙信号强度推算，帮助你快速靠近
          </p>
        </div>
      ) : (
        <div className="find-body">
          <div className="find-map">
            <SchematicMap />
            <div className="find-map-badge">
              <Icon name="pin" size={14} />
              <span>最后已知位置</span>
            </div>
          </div>
          <div className="find-loc-card">
            <div>
              <strong>距你约 35 米</strong>
              <small>5 分钟前 · 在此位置附近最后连接</small>
            </div>
            <span className="find-loc-signal">
              <Icon name="audio" size={16} />
              信号强
            </span>
          </div>
          <div className="find-map-actions">
            <AppButton
              className="manage-button"
              onClick={() => {
                setTab("sound")
                setRinging(true)
              }}
            >
              <Icon name="bell" size={17} />
              <span>在此处响铃</span>
            </AppButton>
            <AppButton
              className="find-nav-button"
              onClick={startNavigation}
            >
              <Icon name="navigate" size={17} />
              <span>导航前往</span>
            </AppButton>
          </div>
          <p className="find-map-note">
            <Icon name="check" size={14} />
            耳机在地图上的位置为蓝牙信号推算的示意位置
          </p>
        </div>
      )}
    </div>
  )
}

export default FindDevice
