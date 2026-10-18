export function Check({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Cross({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  const boxes = [
    { x: 1, w: 6 },
    { x: 9, w: 6 },
    { x: 17, w: 9 },
    { x: 28, w: 6 },
    { x: 36, w: 6 },
  ]
  return (
    <svg viewBox="0 0 43 14" className="h-5 w-auto" aria-hidden="true">
      {boxes.map((box, i) => (
        <rect
          key={box.x}
          x={box.x}
          y="1"
          width={box.w}
          height="12"
          rx="2"
          fill={i === boxes.length - 1 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export const SOURCE_LABELS = {
  mock: 'Mock data',
  'nipost-sandbox': 'NIPOST sandbox',
  'nipost-live': 'NIPOST live data',
}

const SOURCE_DOTS = {
  mock: 'bg-amber-500',
  'nipost-sandbox': 'bg-stamp',
  'nipost-live': 'bg-pass',
}

export function SourceBadge({ health }) {
  let label = 'Connecting'
  let dot = 'bg-rule'

  if (health === null) {
    label = 'Backend offline'
    dot = 'bg-fail'
  } else if (health) {
    label = SOURCE_LABELS[health.source] || health.source
    dot = SOURCE_DOTS[health.source] || 'bg-rule'
  }

  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 rounded-full border border-rule bg-sheet px-3.5 py-1.5 text-sm"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

const VARIANTS = {
  primary: 'bg-stamp text-white hover:bg-ink disabled:bg-rule disabled:text-ink-soft',
  quiet: 'border border-rule bg-transparent text-ink hover:border-ink disabled:opacity-50',
}

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Notice({ tone = 'info', children }) {
  const tones = {
    info: 'bg-stamp-soft text-ink',
    error: 'bg-fail-soft text-fail',
  }
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  )
}

export function RedactedRow({ label, width, animate = false, delay = 0 }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <dt className="w-44 shrink-0 text-sm text-ink-soft sm:w-52">{label}</dt>
      <dd className="flex-1">
        <span
          className={`block h-4 rounded-[2px] bg-redact ${animate ? 'redact-bar' : ''}`}
          style={{ width, animationDelay: `${delay}ms` }}
        />
        <span className="sr-only">Not shared</span>
      </dd>
    </div>
  )
}