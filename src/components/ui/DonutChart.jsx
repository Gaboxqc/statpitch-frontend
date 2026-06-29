function confRingColor(c) {
  if (c >= 80) return '#10b981'
  if (c >= 70) return '#34d399'
  return 'oklch(75% 0.183 55.934)'
}

function confTextClass(c) {
  if (c >= 70) return 'text-emerald-400'
  return 'text-amber-400'
}

function DonutChart({ value, size = 56 }) {
  const sw = 4.5
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className='relative shrink-0' style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke='rgba(255,255,255,0.05)'
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke={confRingColor(value)}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className={`text-xs font-bold leading-none ${confTextClass(value)}`}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

export default DonutChart
