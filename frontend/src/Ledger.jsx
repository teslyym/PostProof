import { Check, Cross } from './ui.jsx'
import { CLAIMS } from './postcode.js'

export default function Ledger({ entries }) {
  return (
    <section className="mt-12" aria-labelledby="ledger-title">
      <h2 id="ledger-title" className="font-display text-2xl">
        Record of checks
      </h2>
      <p className="mt-1 max-w-lg text-sm text-ink-soft">
        Each check is logged with a short fingerprint of the postcode. The postcode and the address are never kept.
      </p>

      {entries.length === 0 ? (
        <p className="mt-5 border-t border-rule pt-4 text-sm text-ink-soft">
          Nothing checked yet. Allow a request and it will show up here.
        </p>
      ) : (
        <ul className="mt-5 border-t border-rule">
          {entries.slice(0, 8).map((entry) => (
            <li
              key={entry.attestation_id}
              className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 border-b border-rule py-3 sm:grid-cols-[auto_1fr_auto]"
            >
              <time
                dateTime={entry.issued_at}
                className="text-sm tabular-nums text-ink-soft"
              >
                {new Date(entry.issued_at).toLocaleTimeString('en-GB')}
              </time>
              <div className="flex flex-wrap gap-2">
                {CLAIMS.filter((claim) => claim.id in entry.results).map((claim) => {
                  const ok = entry.results[claim.id]
                  return (
                    <span
                      key={claim.id}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ok ? 'bg-pass-soft text-pass' : 'bg-fail-soft text-fail'
                      }`}
                    >
                      {ok ? <Check className="h-3 w-3" /> : <Cross className="h-3 w-3" />}
                      {claim.short}
                    </span>
                  )
                })}
              </div>
              <code className="col-span-2 font-mono text-xs text-ink-soft sm:col-span-1">
                {entry.postcode_ref.slice(0, 8)}
              </code>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}