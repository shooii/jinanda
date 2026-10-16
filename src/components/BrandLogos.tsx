import type { CSSProperties } from "react"

export type PaymentBrandId =
  | "apple"
  | "google"
  | "stripe"
  | "paypal"
  | "card"
  | "samsung"
  | "xiaomi"
  | "oppo"
  | "klarna"
  | "sepa"

/**
 * LingoPods 官方高保真矢量品牌标志 (App Brand Logo)
 * 采用现代声学同心圆环 + 声波微透光核心设计，在深色与浅色模式下均具有顶级对比度与识别度。
 */
export function AppLogo({
  size = 32,
  className = "",
  style,
  glow = false,
}: {
  size?: number
  className?: string
  style?: CSSProperties
  glow?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      className={`app-brand-logo ${className} ${glow ? "has-glow" : ""}`}
      height={size}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      viewBox="0 0 40 40"
      width={size}
    >
      <defs>
        <linearGradient id="lp-logo-grad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="lp-logo-lime" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <radialGradient id="lp-glow-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 外圈轻柔微光底衬 */}
      <circle cx="20" cy="20" r="19" fill="url(#lp-glow-radial)" />

      {/* 渐变底座圆角方形 */}
      <rect
        x="3"
        y="3"
        width="34"
        height="34"
        rx="10"
        fill="url(#lp-logo-grad)"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.2"
      />

      {/* 动态声学双耳与声波流转线条 */}
      {/* 外部声波环 */}
      <path
        d="M12 25 A8 8 0 0 1 12 15"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M28 15 A8 8 0 0 1 28 25"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* 字母 L 现代流线融合耳塞音腔 */}
      <path
        d="M16 12 V23.5 C16 25 17 26 18.5 26 H24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 神经翻译智能核心亮点 (Bright Lime Accent Dot) */}
      <circle cx="24" cy="26" r="2.2" fill="url(#lp-logo-lime)" />
      <circle cx="16" cy="12" r="1.5" fill="#ffffff" />
    </svg>
  )
}

/**
 * 全球主流支付渠道官方高保真矢量 Logo 徽标
 * 专门针对北美 (Apple Pay, Google Pay, Stripe, PayPal, Visa/Mastercard/Amex)
 * 与西欧 (SEPA, Klarna, PayPal, Apple Pay, iDEAL) 进行高对比度视觉优化，
 * 在深色底与浅色底上均自动呈现清晰轮廓与标准色彩。
 */
export function PaymentBrandLogo({
  brand,
  size = 28,
  className = "",
}: {
  brand: PaymentBrandId
  size?: number
  className?: string
}) {
  switch (brand) {
    case "apple":
      return (
        <span className={`payment-logo-badge brand-apple ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="Apple Pay">
            <path
              d="M18.71 6.8c-.83 1.01-2.18 1.8-3.37 1.7-.18-1.2.37-2.48 1.15-3.37.84-.97 2.29-1.7 3.32-1.73.15 1.25-.27 2.4-1.1 3.4zm1.09 1.72c-1.85-.11-3.44 1.07-4.32 1.07-.89 0-2.22-1.01-3.66-.99-1.89.03-3.63 1.11-4.6 2.81-1.97 3.42-.5 8.46 1.41 11.23.94 1.35 2.05 2.86 3.51 2.81 1.41-.06 1.95-.91 3.66-.91 1.7 0 2.19.91 3.67.88 1.52-.03 2.48-1.37 3.41-2.73 1.08-1.57 1.52-3.1 1.55-3.18-.03-.02-2.99-1.15-3.02-4.57-.03-2.86 2.33-4.23 2.44-4.3-1.34-1.96-3.41-2.18-4.05-2.22z"
              fill="currentColor"
            />
          </svg>
        </span>
      )

    case "google":
      return (
        <span className={`payment-logo-badge brand-google ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="Google Pay">
            <path
              d="M23.75 16.27c0-.64-.06-1.25-.16-1.84H16v3.48h4.35c-.19 1-.76 1.86-1.61 2.43v2.02h2.61c1.53-1.4 2.4-3.47 2.4-6.09z"
              fill="#4285F4"
            />
            <path
              d="M16 24.14c2.2 0 4.04-.73 5.39-1.98l-2.61-2.02c-.73.49-1.66.78-2.78.78-2.14 0-3.95-1.44-4.6-3.39H8.68v2.09A8.14 8.14 0 0 0 16 24.14z"
              fill="#34A853"
            />
            <path
              d="M11.4 17.53a4.89 4.89 0 0 1 0-3.06v-2.09H8.68a8.14 8.14 0 0 0 0 7.24l2.72-2.09z"
              fill="#FBBC05"
            />
            <path
              d="M16 11.08c1.19 0 2.27.41 3.12 1.21l2.34-2.34C20.04 8.64 18.2 8 16 8a8.14 8.14 0 0 0-7.32 4.38l2.72 2.09c.65-1.95 2.46-3.39 4.6-3.39z"
              fill="#EA4335"
            />
          </svg>
        </span>
      )

    case "stripe":
      return (
        <span className={`payment-logo-badge brand-stripe ${className}`}>
          <svg height={size} viewBox="0 0 36 24" width={size * 1.5} aria-label="Stripe">
            <rect width="36" height="24" rx="5" fill="#635BFF" />
            <path
              d="M15.4 10.7c0-.8.7-1.3 1.8-1.3 1.5 0 3.2.5 4.3 1.2V7.1c-1.3-.5-2.9-.8-4.3-.8-3.7 0-6.1 1.9-6.1 5.2 0 4.9 6.8 4.2 6.8 6.3 0 .9-.8 1.4-2 1.4-1.8 0-3.8-.7-5.2-1.6v3.6c1.5.7 3.3 1 5.1 1 3.8 0 6.4-1.9 6.4-5.3 0-5.3-6.8-4.4-6.8-6.2z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      )

    case "paypal":
      return (
        <span className={`payment-logo-badge brand-paypal ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="PayPal">
            <path
              d="M10.8 23.5l1.6-10.2c.2-1.2 1.2-2.1 2.4-2.1h5.1c3.4 0 5.6 1.6 5 4.7-.6 3.3-2.8 4.9-5.9 4.9h-2.1l-1.3 7.8c-.1.5-.6.9-1.1.9h-3.1c-.4 0-.7-.4-.6-.8z"
              fill="#0079C1"
            />
            <path
              d="M13.2 19.3l1.1-7c.2-1.2 1.2-2.1 2.4-2.1h5.1c3.4 0 5.6 1.6 5 4.7-.6 3.3-2.8 4.9-5.9 4.9h-2.1l-1.3 7.8c-.1.5-.6.9-1.1.9h-2.6c-.4 0-.7-.4-.6-.8l1.1-6.9h-1.1z"
              fill="#00457C"
              opacity="0.85"
            />
            <path
              d="M13.2 19.3h2.1c3.1 0 5.3-1.6 5.9-4.9.4-2.3-.6-3.8-2.5-4.4l-.8 5.1c-.2 1.2-1.2 2.1-2.4 2.1h-2.3z"
              fill="#002D62"
              opacity="0.3"
            />
          </svg>
        </span>
      )

    case "card":
      return (
        <span className={`payment-logo-badge brand-card ${className}`}>
          <svg height={size} viewBox="0 0 36 24" width={size * 1.5} aria-label="Credit Card">
            <rect width="36" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect y="4" width="36" height="4" fill="#0f172a" />
            <circle cx="14" cy="15" r="4.5" fill="#eb001b" opacity="0.9" />
            <circle cx="20" cy="15" r="4.5" fill="#f79e1b" opacity="0.9" />
            <rect x="5" y="13" width="4" height="4" rx="1" fill="#fbbf24" />
          </svg>
        </span>
      )

    case "klarna":
      return (
        <span className={`payment-logo-badge brand-klarna ${className}`}>
          <svg height={size} viewBox="0 0 36 24" width={size * 1.5} aria-label="Klarna">
            <rect width="36" height="24" rx="5" fill="#FFB3C7" />
            <text
              x="18"
              y="16"
              fill="#0A0A0A"
              fontSize="12"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              Klarna.
            </text>
          </svg>
        </span>
      )

    case "sepa":
      return (
        <span className={`payment-logo-badge brand-sepa ${className}`}>
          <svg height={size} viewBox="0 0 36 24" width={size * 1.5} aria-label="SEPA Direct Debit">
            <rect width="36" height="24" rx="4" fill="#003399" />
            <text
              x="18"
              y="16"
              fill="#FFCC00"
              fontSize="10"
              fontWeight="800"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              SEPA
            </text>
          </svg>
        </span>
      )

    case "samsung":
      return (
        <span className={`payment-logo-badge brand-samsung ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="Samsung Pay">
            <rect width="32" height="32" rx="7" fill="#1428A0" />
            <text
              x="16"
              y="20"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="800"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              S
            </text>
          </svg>
        </span>
      )

    case "xiaomi":
      return (
        <span className={`payment-logo-badge brand-xiaomi ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="Mi Pay">
            <rect width="32" height="32" rx="7" fill="#FF6900" />
            <path
              d="M10 12h3v8h-3v-8zm5 0h3v4.5c0 1 .5 1.5 1.5 1.5h1.5v2h-1.8c-2.2 0-3.2-1.1-3.2-3V12zm6-2h3v10h-3V10z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      )

    case "oppo":
      return (
        <span className={`payment-logo-badge brand-oppo ${className}`}>
          <svg height={size} viewBox="0 0 32 32" width={size} aria-label="OPPO Pay">
            <rect width="32" height="32" rx="7" fill="#0F7F41" />
            <circle cx="16" cy="16" r="6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>
        </span>
      )

    default:
      return (
        <span className="payment-logo-badge brand-fallback">
          <svg height={size} viewBox="0 0 24 24" width={size}>
            <rect x="2" y="5" width="20" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
      )
  }
}
