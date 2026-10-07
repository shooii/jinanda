import type { ReactNode } from "react"



export type IconName = "audio" | "bluetooth" | "bolt" | "calendar" | "camera" | "check" | "chevron" | "close" | "globe" | "grip" | "headphones" | "home" | "image" | "mic" | "moon" | "notes" | "pause" | "plane" | "play" | "plus" | "profile" | "settings" | "sparkles" | "swap"

export function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    audio: (
      <>
        <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4" />
      </>
    ),
    bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
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
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
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
    mic: (
      <>
        <rect x="8" y="2" width="8" height="13" rx="4" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
      </>
    ),
    moon: <path d="M20.5 15.2A9 9 0 1 1 8.8 3.5a7 7 0 0 0 11.7 11.7Z" />,
    notes: (
      <>
        <path d="M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
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
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" />
      </>
    ),
    swap: <path d="m7 7 3-3m-3 3 3 3M7 7h10M17 17l-3-3m3 3-3 3m3-3H7" />,
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
