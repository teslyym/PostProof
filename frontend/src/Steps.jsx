import PostcodeField from './PostcodeField.jsx'
import { Button, Check, Cross, Notice, RedactedRow, SOURCE_LABELS } from './ui.jsx'
import { CLAIMS, WITHHELD, isComplete, joinParts } from './postcode.js'

const BAR_WIDTHS = ['82%', '58%', '70%', '46%']
const NUMBER_WORDS = ['', 'one thing', 'two things', 'three things']

export function RequestStep({
  parts,
  setParts,
  lga,
  setLga,
  claims,
  setClaims,
  samples,
  onSample,
  note,
  onSubmit,
}) {
  const needsLga = claims.includes('lga_match')

  let hint = ''
  if (!isComplete(parts)) hint = 'Enter all 11 characters.'
  else if (claims.length === 0) hint = 'Choose at least one thing to confirm.'
  else if (needsLga && !lga.trim()) hint = 'Enter the LGA the bank expects.'

  function toggle(id) {
    setClaims(claims.includes(id) ? claims.filter((c) => c !== id) : [...claims, id])
  }

  return (
    <div className="step-in">
      {note && (
        <div className="mb-6">
          <Notice>{note}</Notice>
        </div>
      )}

      <h2 className="font-display text-3xl leading-tight sm:text-4xl">Confirm a customer’s address</h2>
      <p className="mt-2 max-w-md text-ink-soft">
        Enter their postcode, then choose what Sample Bank needs to know.
      </p>

      <div className="mt-8">
        <PostcodeField parts={parts} onChange={setParts} />
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="text-ink-soft">Try a sample:</span>
        {samples.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => onSample(sample)}
            className="font-medium text-stamp underline decoration-stamp/30 underline-offset-4 hover:decoration-stamp"
          >
            {sample.name}
          </button>
        ))}
      </div>

      <fieldset className="mt-9">
        <legend className="text-base font-semibold">What the bank needs to confirm</legend>
        <div className="mt-2 divide-y divide-rule border-y border-rule">
          {CLAIMS.map((claim) => {
            const on = claims.includes(claim.id)
            return (
              <div key={claim.id} className="py-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={on}
                    onChange={() => toggle(claim.id)}
                  />
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-rule bg-sheet text-transparent transition peer-checked:border-stamp peer-checked:bg-stamp peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-stamp-soft">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-medium">{claim.title}</span>
                    <span className="block text-sm text-ink-soft">{claim.detail}</span>
                  </span>
                </label>

                {claim.id === 'lga_match' && on && (
                  <div className="ml-9 mt-3">
                    <label htmlFor="expected-lga" className="block text-sm text-ink-soft">
                      Expected LGA
                    </label>
                    <input
                      id="expected-lga"
                      value={lga}
                      onChange={(event) => setLga(event.target.value)}
                      placeholder="For example, Ado Ekiti"
                      autoComplete="off"
                      className="mt-1 w-full max-w-xs rounded-md border-2 border-rule bg-sheet px-3 py-2 text-base outline-none transition placeholder:text-ink-soft/60 focus:border-stamp focus:ring-4 focus:ring-stamp-soft"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button onClick={onSubmit} disabled={Boolean(hint)}>
          Ask the customer
        </Button>
        {hint && (
          <p className="text-sm text-ink-soft" role="status">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

export function ConsentStep({ parts, claims, lga, loading, error, onAllow, onDecline }) {
  const asks = CLAIMS.filter((claim) => claims.includes(claim.id))

  return (
    <div className="step-in">
      <h2 className="font-display text-3xl leading-tight sm:text-4xl">
        Sample Bank wants to confirm {NUMBER_WORDS[asks.length]}
      </h2>
      <p className="mt-4 font-mono text-xl tracking-wide sm:text-2xl">{joinParts(parts)}</p>

      <ul className="mt-6 divide-y divide-rule border-y border-rule">
        {asks.map((claim) => (
          <li key={claim.id} className="flex items-baseline justify-between gap-4 py-3.5">
            <span>{claim.ask(lga.trim() || 'the expected LGA')}</span>
            <span className="shrink-0 text-sm text-ink-soft">yes or no</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-semibold">Sample Bank will not see</p>
      <dl className="mt-1">
        {WITHHELD.map((label, i) => (
          <RedactedRow key={label} label={label} width={BAR_WIDTHS[i]} />
        ))}
      </dl>

      <p className="mt-6 text-sm text-ink-soft">
        NIPOST is not asked anything until you allow this check.
      </p>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onAllow} disabled={loading}>
          {loading ? 'Checking…' : 'Allow this check'}
        </Button>
        <Button variant="quiet" onClick={onDecline} disabled={loading}>
          Decline
        </Button>
      </div>
    </div>
  )
}

export function ResultStep({ result, lga, onReset }) {
  const rows = CLAIMS.filter((claim) => claim.id in result.results)
  const passed = rows.filter((claim) => result.results[claim.id]).length
  const readAddress = rows.some((claim) => claim.id !== 'valid')
  const markDelay = (i) => `${i * 140}ms`
  const barsStart = rows.length * 140 + 300

  return (
    <div className="step-in">
      <h2 className="font-display text-3xl leading-tight sm:text-4xl">
        {passed === rows.length ? 'Every check is confirmed' : `${passed} of ${rows.length} checks confirmed`}
      </h2>
      <p className="mt-2 text-ink-soft">This is everything Sample Bank receives.</p>

      <ul className="mt-6 divide-y divide-rule border-y border-rule">
        {rows.map((claim, i) => {
          const ok = result.results[claim.id]
          const name = lga.trim() || 'the expected LGA'
          return (
            <li key={claim.id} className="flex items-center gap-4 py-4">
              <span
                className={`mark-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  ok ? 'bg-pass-soft text-pass' : 'bg-fail-soft text-fail'
                }`}
                style={{ animationDelay: markDelay(i) }}
              >
                {ok ? <Check /> : <Cross />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{claim.title}</p>
                <p className="text-sm text-ink-soft">{ok ? claim.yes(name) : claim.no(name)}</p>
              </div>
              <span
                className={`sr-only shrink-0 text-sm font-semibold sm:not-sr-only ${ok ? 'text-pass' : 'text-fail'}`}
              >
                {ok ? 'Confirmed' : 'Not confirmed'}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="mt-8 font-semibold">What stays private</p>
      <dl className="mt-1">
        {WITHHELD.map((label, i) => (
          <RedactedRow
            key={label}
            label={label}
            width={BAR_WIDTHS[i % BAR_WIDTHS.length]}
            animate
            delay={barsStart + i * 180}
          />
        ))}
      </dl>
      <p className="mt-3 text-sm text-ink-soft">
        {readAddress
          ? 'PostProof read this to run the check and passed none of it on.'
          : 'PostProof never asked for any of it.'}
      </p>

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-rule pt-5 text-sm">
        <dt className="text-ink-soft">Attestation</dt>
        <dd className="font-mono">{result.attestation_id.slice(0, 8)}</dd>
        <dt className="text-ink-soft">Issued</dt>
        <dd>{new Date(result.issued_at).toLocaleString('en-GB')}</dd>
        <dt className="text-ink-soft">Data</dt>
        <dd>{SOURCE_LABELS[result.source] || result.source}</dd>
      </dl>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-medium text-stamp underline decoration-stamp/30 underline-offset-4">
          View the response the bank gets
        </summary>
        <pre className="mt-3 overflow-x-auto rounded-md bg-paper p-4 font-mono text-xs leading-relaxed">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>

      <div className="mt-8">
        <Button variant="quiet" onClick={onReset}>
          Check another postcode
        </Button>
      </div>
    </div>
  )
}