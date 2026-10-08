import type { ReactNode } from "react"



export type IconName = "audio" | "bell" | "bluetooth" | "bolt" | "calendar" | "camera" | "card" | "check" | "chevron" | "clock" | "close" | "drop" | "flip" | "globe" | "grip" | "headphones" | "home" | "image" | "layout" | "map" | "message" | "mic" | "monitor" | "moon" | "more" | "notes" | "navigate" | "pause" | "phone" | "pin" | "plane" | "play" | "plus" | "profile" | "receipt" | "settings" | "share" | "shield" | "skip-next" | "skip-prev" | "sliders" | "sparkles" | "sun" | "swap" | "translate" | "users" | "video" | "volume" | "wallet" | "wind"

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    audio: (
      <>
        <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4" />
      </>
    ),
    bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
    bell: (
      <>
        <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 5 13 3H7L5.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-5.5Z" />
        <circle cx="10" cy="12" r="4" />
      </>
    ),
    card: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="3" />
        <path d="M2.5 10h19M6 14.5h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.4V12l3 1.9" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    drop: <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10 12 3 12 3Z" />,
    flip: (
      <>
        <path d="M4 12a8 8 0 0 1 13.2-6.1M20 12a8 8 0 0 1-13.2 6.1" />
        <path d="M17.6 2.6v3.2h-3.2M6.4 21.4v-3.2h3.2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    grip: (
      <>
        <circle cx="8" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="17" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M6 13H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-7ZM18 13h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v-7Z" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4.5 19 5-5 3 3 3.5-3.5L21 18" />
      </>
    ),
    layout: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="3" />
        <path d="M10.5 6v12" />
      </>
    ),
    map: (
      <>
        <path d="m9 5 6 2 5.2-1.8a.6.6 0 0 1 .8.6v12a1 1 0 0 1-.7 1L15 20.5 9 18.5l-5.3 1.9a.6.6 0 0 1-.7-.6V6.3a1 1 0 0 1 .7-.9L9 5Z" />
        <path d="M9 5v13.5M15 7v13.5" />
      </>
    ),
    message: (
      <>
        <path d="M20.5 14.6a2.4 2.4 0 0 1-2.4 2.4H8.6L4 20.6V6.9a2.4 2.4 0 0 1 2.4-2.4h11.7a2.4 2.4 0 0 1 2.4 2.4v7.7Z" />
        <path d="M8.6 9.4h6.8M8.6 12.6h4.2" />
      </>
    ),
    mic: (
      <>
        <rect x="8" y="2" width="8" height="13" rx="4" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2.5" />
        <path d="M9 21h6M12 17.5V21M12 4v13" />
        <path d="M3 9.5c2.5-2 5-2 7.5 0s5 2 7.5 0" />
      </>
    ),
    moon: <path d="M20.5 15.2A9 9 0 1 1 8.8 3.5a7 7 0 0 0 11.7 11.7Z" />,
    more: (
      <>
        <circle cx="12" cy="5.4" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="12" cy="18.6" r="1.35" fill="currentColor" stroke="none" />
      </>
    ),
    notes: (
      <>
        <path d="M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    navigate: <path d="M3.5 11 21 3l-8 17.5-2.4-7.1L3.5 11Z" />,
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    phone: (
      <>
        <path d="M5 4h3l2 5-2.5 1.5a12 12 0 0 0 5 5L18 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    ),
    plane: <path d="m22 2-9 20-2-9-9-2L22 2Z" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-2.5-1.6L14 21l-2.5-1.6L9 21l-2.5-1.6L5 21V4a1 1 0 0 1 1-1Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.6 6.8-4M8.6 13.4l6.8 4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v6c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-3Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </>
    ),
    "skip-next": (
      <>
        <path d="m6 5 9 7-9 7V5Z" />
        <path d="M19 5v14" />
      </>
    ),
    "skip-prev": (
      <>
        <path d="m18 5-9 7 9 7V5Z" />
        <path d="M5 5v14" />
      </>
    ),
    sliders: (
      <>
        <path d="M5 4v6M5 14v6M12 4v3M12 11v9M19 4v9M19 17v3" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="9" r="2" />
        <circle cx="19" cy="15" r="2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.9-1.9M17.5 6.5l1.9-1.9" />
      </>
    ),
    swap: <path d="m7 7 3-3m-3 3 3 3M7 7h10M17 17l-3-3m3 3-3 3m3-3H7" />,
    translate: (
      <>
        <path d="M3 6h9M7.5 4v2M9.8 6c-.7 4.5-3.4 7.6-6.8 9.2M5 10.5c1.4 2.6 3.6 4 6 4.8" />
        <path d="m12.5 21 4-10 4 10M14 17.6h5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.4" />
        <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
        <path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.4 14.4a6.2 6.2 0 0 1 3.8 5.6" />
      </>
    ),
    video: (
      <>
        <rect x="2.5" y="6.5" width="13" height="11" rx="3" />
        <path d="m15.5 12 6-3.4v6.8L15.5 12Z" />
      </>
    ),
    volume: (
      <>
        <path d="M4 9v6h3.5L12 19.5v-15L7.5 9H4Z" />
        <path d="M15.5 9.5a3.6 3.6 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="3" />
        <path d="M3 10h18M16.5 14.5h1.5" />
        <path d="M16 6V4.5a1.5 1.5 0 0 1 2.4-1.2" />
      </>
    ),
    wind: (
      <>
        <path d="M3 8h9.5a2.5 2.5 0 1 0-2.4-3.2M3 12h14.5a2.5 2.5 0 1 1-2.4 3.2M3 16h7.5a2 2 0 1 1-1.9 2.6" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {paths[name]}
      </g>
    </svg>
  )
}

export function Earbuds() {
  return (
    <div className="earbuds" aria-label="已连接 LingoPods Pro">
      <div className="bud bud-left">
        <span />
      </div>
      <div className="bud bud-right">
        <span />
      </div>
      <i className="signal signal-one" />
      <i className="signal signal-two" />
    </div>
  )
}

export default Icon
