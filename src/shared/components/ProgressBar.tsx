type ProgressBarProps = {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="progress-bar" aria-label={`${label}：${value}/${max}`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  )
}
