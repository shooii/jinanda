export function MiniBattery({
  level,
  side,
}: {
  level: number
  side: string
}) {
  const low = level <= 20
  return (
    <span
      className={`mini-battery ${low ? "low" : ""}`}
      title={`${side} ${level}%`}
    >
      <i>{side}</i>
      <span className="mini-battery-shell" aria-hidden="true">
        <em style={{ width: `${level}%` }} />
      </span>
      <b>{level}%</b>
    </span>
  )
}

export function BatteryPair({
  left = 88,
  right = 84,
}: {
  left?: number
  right?: number
}) {
  return (
    <span className="battery-pair">
      <MiniBattery level={left} side="L" />
      <MiniBattery level={right} side="R" />
    </span>
  )
}

export default BatteryPair
