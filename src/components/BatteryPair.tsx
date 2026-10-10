/**
 * 单只耳塞 / 充电盒的电量：标签 + 电量条 + 百分比。
 *
 * 0 当作「还没读到」而不是「电量 0%」：设备断开或刚加载时底层一律写 0，
 * 直接渲染 0% 会让人以为耳机没电了。
 */
export function MiniBattery({
  level,
  label,
  title,
}: {
  level: number
  /** 显示用的短标签，如 L / R / 充电盒（外置文案，勿硬编码中文） */
  label: string
  /** 无障碍与长按提示，缺省用「标签 + 数值」 */
  title?: string
}) {
  const known = level > 0
  const low = known && level <= 20
  return (
    <span
      className={`mini-battery ${low ? "low" : ""}`}
      title={title ?? (known ? `${label} ${level}%` : label)}
    >
      <i>{label}</i>
      <span className="mini-battery-shell" aria-hidden="true">
        <em style={{ width: known ? `${level}%` : "0%" }} />
      </span>
      <b>{known ? `${level}%` : "—"}</b>
    </span>
  )
}

/**
 * 顶栏设备胶囊用的紧凑双耳电量：左右耳各一枚，**不做平均**。
 * 平均值会把「左 100 / 右 20」显示成 60%，用户看不出哪只快没电、也看不出是哪个数值。
 */
export function PillBattery({
  left,
  right,
  title,
  offline,
}: {
  left: number
  right: number
  /** 电量摘要（含充电盒），供 title / aria 使用 */
  title?: string
  /** 设备未连接时，数值来自上次记录，需压低对比度 */
  offline?: boolean
}) {
  const cells = [
    { tag: "L", level: left },
    { tag: "R", level: right },
  ]
  return (
    <span className={`pill-batt ${offline ? "offline" : ""}`} title={title}>
      {cells.map((cell) => (
        <span
          key={cell.tag}
          className={`pill-batt-cell ${cell.level > 0 && cell.level <= 20 ? "low" : ""}`}
        >
          <i>{cell.tag}</i>
          <b>{cell.level > 0 ? `${cell.level}%` : "—"}</b>
        </span>
      ))}
    </span>
  )
}

export default PillBattery
