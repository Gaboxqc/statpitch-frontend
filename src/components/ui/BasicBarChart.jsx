function confRingColor(c) {
  if (c >= 70) return 'bg-primary'
  if (c >= 50) return 'bg-orange-400'
  return 'bg-accent/80'
}

function BarChart({ prob }) {
  return (
    <div className={'flex justify-center items-center mt-4  w-full mx-auto'}>
      <div
        className={`h-1 rounded-l-full lg:h-2 ${confRingColor(prob)}`}
        style={{ width: `${prob}%` }}
      />
      <div className={`h-1 bg-accent/20 lg:h-2`} style={{ width: `${100 - prob}%` }} />
    </div>
  )
}
export default BarChart
