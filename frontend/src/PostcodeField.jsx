import { useRef } from 'react'
import { SEGMENTS, cleanSegment, splitCode } from './postcode.js'

export default function PostcodeField({ parts, onChange }) {
  const refs = useRef([])

  function setPart(index, value) {
    const next = [...parts]
    next[index] = cleanSegment(value, index)
    onChange(next)
    if (next[index].length === SEGMENTS[index].length && index < SEGMENTS.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  function onKeyDown(event, index) {
    const input = event.currentTarget

    if (event.key === 'Backspace' && parts[index] === '' && index > 0) {
      event.preventDefault()
      const next = [...parts]
      next[index - 1] = next[index - 1].slice(0, -1)
      onChange(next)
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && input.selectionStart === 0 && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }
    if (
      event.key === 'ArrowRight' &&
      input.selectionStart === input.value.length &&
      index < SEGMENTS.length - 1
    ) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  function onPaste(event) {
    const pasted = splitCode(event.clipboardData.getData('text'))
    if (pasted) {
      event.preventDefault()
      onChange(pasted)
      refs.current[SEGMENTS.length - 1]?.focus()
    }
  }

  return (
    <div role="group" aria-label="Postcode" className="flex items-start" onPaste={onPaste}>
      {SEGMENTS.map((segment, index) => (
        <div key={segment.label} className="flex items-start">
          {index > 0 && (
            <span
              aria-hidden="true"
              className="flex h-14 select-none items-center px-0.5 font-mono text-xl text-rule sm:h-[4.5rem] sm:px-1.5 sm:text-4xl"
            >
              -
            </span>
          )}
          <label className="block">
            <input
              ref={(el) => (refs.current[index] = el)}
              value={parts[index]}
              onChange={(event) => setPart(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onFocus={(event) => event.target.select()}
              placeholder={segment.example}
              inputMode={segment.numeric ? 'numeric' : 'text'}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck="false"
              aria-label={`${segment.label}, ${segment.length} characters`}
              style={{ width: `calc(${segment.length} * 1ch + 1rem)` }}
              className="h-14 rounded-md border-2 border-rule bg-sheet text-center font-mono text-xl uppercase text-ink outline-none transition placeholder:text-rule focus:border-stamp focus:ring-4 focus:ring-stamp-soft sm:h-[4.5rem] sm:text-4xl"
            />
            <span className="mt-2 block text-center text-sm text-ink-soft">{segment.label}</span>
          </label>
        </div>
      ))}
    </div>
  )
}