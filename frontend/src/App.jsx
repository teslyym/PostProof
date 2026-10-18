import { useCallback, useEffect, useState } from 'react'
import { getAudit, getHealth, verify } from './api.js'
import { ALL_CLAIMS, CLAIMS, EMPTY_PARTS, joinParts, samplesFor, splitCode } from './postcode.js'
import { Check, Logo, SourceBadge } from './ui.jsx'
import { ConsentStep, RequestStep, ResultStep } from './Steps.jsx'
import Ledger from './Ledger.jsx'

const STEPS = [
  { id: 'ask', title: 'The bank asks', body: 'It picks what it needs to confirm about a postcode.' },
  { id: 'decide', title: 'The customer decides', body: 'They see what will be shared and what stays private.' },
  { id: 'receive', title: 'The bank gets answers', body: 'Yes or no for each check. No address.' },
]

function Stepper({ current }) {
  const at = STEPS.findIndex((step) => step.id === current)

  return (
    <ol className="mt-12 hidden lg:block">
      {STEPS.map((step, i) => (
        <li
          key={step.id}
          className="relative flex gap-4 pb-7 last:pb-0"
          aria-current={i === at ? 'step' : undefined}
        >
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="absolute left-[11px] top-7 h-full w-px bg-rule" />
          )}
          <span
            className={`relative mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 transition ${
              i < at
                ? 'border-ink bg-ink'
                : i === at
                  ? 'border-stamp bg-stamp-soft'
                  : 'border-rule bg-paper'
            }`}
          >
            {i < at && <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-sheet" />}
            {i === at && <span className="absolute inset-1.5 rounded-full bg-stamp" />}
          </span>
          <div>
            <p className={`font-medium ${i === at ? 'text-ink' : 'text-ink-soft'}`}>{step.title}</p>
            <p className="mt-0.5 max-w-xs text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function App() {
  const [health, setHealth] = useState(undefined)
  const [entries, setEntries] = useState([])
  const [step, setStep] = useState('ask')
  const [parts, setParts] = useState(EMPTY_PARTS)
  const [lga, setLga] = useState('')
  const [claims, setClaims] = useState(ALL_CLAIMS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState(null)

  const loadLedger = useCallback(() => {
    getAudit()
      .then(setEntries)
      .catch(() => {})
  }, [])

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
    loadLedger()
  }, [loadLedger])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  function applySample(sample) {
    setParts(splitCode(sample.code))
    setLga(sample.lga)
    setClaims(sample.claims || ALL_CLAIMS)
    setNote('')
  }

  function ask() {
    setError('')
    setNote('')
    setStep('decide')
  }

  async function allow() {
    setLoading(true)
    setError('')
    try {
      const data = await verify({
        postcode: joinParts(parts),
        consent: true,
        requested: CLAIMS.map((claim) => claim.id).filter((id) => claims.includes(id)),
        expected_lga: claims.includes('lga_match') ? lga.trim() : null,
      })
      setResult(data)
      setStep('receive')
      loadLedger()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function decline() {
    setError('')
    setNote('The customer declined. Nothing was checked and nothing was recorded.')
    setStep('ask')
  }

  function reset() {
    setParts(EMPTY_PARTS)
    setLga('')
    setClaims(ALL_CLAIMS)
    setResult(null)
    setNote('')
    setStep('ask')
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3 text-ink">
          <Logo />
          <span className="font-display text-2xl">PostProof</span>
        </div>
        <SourceBadge health={health} />
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <section className="lg:sticky lg:top-10 lg:self-start">
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            Verify, don’t reveal.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            A bank can confirm where a customer lives using Nigeria’s postcode, without ever receiving the address.
          </p>

          <Stepper current={step} />

          <p className="mt-10 hidden max-w-sm border-t border-rule pt-5 text-sm leading-relaxed text-ink-soft lg:block">
            PostProof checks the postcode first, which is free, and asks NIPOST for more only when a check needs it.
            This demo uses mock or sandbox data. It holds no real people or addresses.
          </p>
        </section>

        <section>
          <div className="rounded-md border border-rule bg-sheet p-5 shadow-[0_1px_0_var(--color-rule),0_18px_40px_-24px_rgba(16,26,61,0.35)] sm:p-10">
            {step === 'ask' && (
              <RequestStep
                parts={parts}
                setParts={setParts}
                lga={lga}
                setLga={setLga}
                claims={claims}
                setClaims={setClaims}
                samples={samplesFor(health && health.source)}
                onSample={applySample}
                note={note}
                onSubmit={ask}
              />
            )}
            {step === 'decide' && (
              <ConsentStep
                parts={parts}
                claims={claims}
                lga={lga}
                loading={loading}
                error={error}
                onAllow={allow}
                onDecline={decline}
              />
            )}
            {step === 'receive' && result && <ResultStep result={result} lga={lga} onReset={reset} />}
          </div>

          <Ledger entries={entries} />

          <p className="mt-10 text-sm leading-relaxed text-ink-soft lg:hidden">
            This demo uses mock or sandbox data. It holds no real people or addresses.
          </p>
        </section>
      </main>
    </div>
  )
}