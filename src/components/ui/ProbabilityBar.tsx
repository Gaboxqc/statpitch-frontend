function barColor(prob: number): string {
  if (prob >= 70) return 'bg-primary'
  if (prob >= 50) return 'bg-orange-400'
  return 'bg-line'
}

/** A single probability as a filled bar. `prob` is 0–100. */
function ProbabilityBar({ prob }: { prob: number }) {
  return (
    <div className={'flex justify-center items-center mt-4 w-full mx-auto'}>
      <div
        className={`h-1 rounded-l-full lg:h-2 ${barColor(prob)}`}
        style={{ width: `${prob}%` }}
      />
      <div className={`h-1 bg-secondary lg:h-2`} style={{ width: `${100 - prob}%` }} />
    </div>
  )
}

export default ProbabilityBar
