import { useState } from 'react'
import Button from './Button.jsx'
import ProgressBar from './ProgressBar.jsx'

// RUDAS-specific task card. Each of the 6 validated items uses its own
// interaction (widget selected from the backend options_json metadata).
// Scoring is numeric and sent up via onChange(valueString); the backend is
// the single source of truth for the resulting RUDAS total /30.
export default function RudasTaskCard({
  sectionName, current, total, question, value, onChange, onBack, onNext, isLast, backDisabled = false,
}) {
  let meta = {}
  try {
    meta = JSON.parse(question.optionsJson || '{}')
  } catch (_) {}
  const widget = meta.widget

  return (
    <div className="glass-pop rounded-2xl p-6 max-w-2xl mx-auto shadow-glow">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{sectionName}</p>
      <ProgressBar value={current} max={total} label={`Question ${current} of ${total}`} />

      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-primary">{meta.label || 'RUDAS Task'}</h2>
        <p className="text-sm text-muted">Maximum: {Math.round(Number(question.maxItemScore))}</p>
      </div>

      <p className="mt-3 text-base text-primary leading-relaxed">{question.promptText}</p>
      {question.helperText && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Simple meaning</p>
          <p className="mt-1 text-sm text-muted leading-relaxed">{question.helperText}</p>
        </div>
      )}

      <div className="mt-5">
        {widget === 'memory' && <MemoryWidget meta={meta} value={value} onChange={onChange} />}
        {widget === 'commands' && <CommandsWidget meta={meta} value={value} onChange={onChange} />}
        {widget === 'choice' && <ChoiceWidget meta={meta} value={value} onChange={onChange} />}
        {widget === 'cube' && <CubeWidget meta={meta} value={value} onChange={onChange} />}
        {widget === 'judgment' && <JudgmentWidget meta={meta} value={value} onChange={onChange} />}
        {widget === 'animals' && <AnimalsWidget meta={meta} value={value} onChange={onChange} />}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={onBack} disabled={backDisabled}>Back</Button>
        <Button onClick={onNext} disabled={value === undefined || value === null || value === ''}>
          {isLast ? 'Finish section' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
function MemoryWidget({ meta, value, onChange }) {
  const items = meta.items || ['Tea', 'Cooking Oil', 'Eggs', 'Soap']
  const each = meta.eachRecall || 2
  const [phase, setPhase] = useState('register')
  const [recalled, setRecalled] = useState(() => {
    const v = Number(value)
    return items.map((_, i) => Number.isFinite(v) && v >= (i + 1) * each)
  })
  const score = recalled.filter(Boolean).length * each

  if (phase === 'register') {
    return (
      <div className="rounded-xl border border-default bg-surface-2/50 p-4">
        <p className="text-sm font-semibold text-primary">Items to remember</p>
        <ul className="mt-2 space-y-1">
          {items.map((it) => (
            <li key={it} className="text-base text-primary">• {it}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted leading-snug">
          Ask the person to repeat the list back at least three times, until they can repeat it correctly
          or as well as they are going to (maximum 5 learning trials). Registration itself does not score
          — the list is tested again as delayed recall at the end.
        </p>
        <div className="mt-4"><Button onClick={() => setPhase('recall')}>Continue</Button></div>
      </div>
    )
  }

  const toggle = (i) => {
    const next = recalled.map((b, j) => (j === i ? !b : b))
    setRecalled(next)
    onChange(String(next.filter(Boolean).length * each))
  }

  return (
    <div className="rounded-xl border border-default bg-surface-2/50 p-4">
      <p className="text-sm font-semibold text-primary">Delayed Recall ({items.length} grocery items)</p>
      <p className="mt-1 text-xs text-muted">
        We have just arrived at the shop. Can you remember the list of groceries we need to buy?
      </p>
      <div className="mt-3 space-y-2">
        {items.map((it, i) => (
          <button
            key={it}
            type="button"
            onClick={() => toggle(i)}
            className={`w-full text-left rounded-lg border px-4 py-2 text-sm transition-all ${
              recalled[i] ? 'border-accent bg-accent/10 text-primary' : 'border-default hover:bg-surface-2'
            }`}
          >
            <span className="font-semibold">{it}</span>
            <span className="block text-xs text-muted">
              {recalled[i] ? 'Recalled without prompting' : 'Not recalled (or prompted)'}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">
        Recall score: {score} / {items.length * each}
      </p>
    </div>
  )
}

function CommandsWidget({ meta, value, onChange }) {
  const cmds = meta.commands || []
  const cap = meta.max || cmds.length
  const [results, setResults] = useState(() => {
    const v = Number(value)
    return cmds.map((_, i) => Number.isFinite(v) && i < v)
  })
  const score = Math.min(results.filter(Boolean).length, cap)

  const setResult = (i, ok) => {
    const next = results.map((b, j) => (j === i ? ok : b))
    setResults(next)
    onChange(String(Math.min(next.filter(Boolean).length, cap)))
  }

  return (
    <div className="rounded-xl border border-default bg-surface-2/50 p-4">
      <p className="text-sm font-semibold text-primary">Score each command (Correct = 1, Incorrect = 0)</p>
      <div className="mt-3 space-y-2">
        {cmds.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-3 border-b border-default/60 pb-2">
            <span className="text-sm text-primary flex-1">{c}</span>
            <div className="flex gap-2 shrink-0">
              {['Correct', 'Not correct'].map((lab, k) => {
                const okv = k === 0
                return (
                  <button
                    key={lab}
                    type="button"
                    onClick={() => setResult(i, okv)}
                    className={`text-xs rounded-lg px-3 py-1.5 border transition-all ${
                      results[i] === okv ? 'border-accent bg-accent/10 text-primary' : 'border-default text-muted hover:bg-surface-2'
                    }`}
                  >
                    {lab}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">
        Score: {score} / {cap} (stop once {cap} correct)
      </p>
    </div>
  )
}

function ChoiceWidget({ meta, value, onChange }) {
  const options = meta.options || []
  const chosen = String(value)
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(String(o.score))}
          className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${
            chosen === String(o.score) ? 'border-accent bg-accent/10 text-primary shadow-inner' : 'border-default bg-surface-2/40 hover:bg-surface-2'
          }`}
        >
          <span className="font-semibold">{o.label} — {o.score}</span>
        </button>
      ))}
    </div>
  )
}

function CubeWidget({ meta, value, onChange }) {
  const criteria = meta.criteria || []
  const [checks, setChecks] = useState(() => {
    const v = Number(value)
    return criteria.map((_, i) => Number.isFinite(v) && i < v)
  })
  const score = checks.filter(Boolean).length
  const set = (i) => {
    const next = checks.map((b, j) => (j === i ? !b : b))
    setChecks(next)
    onChange(String(next.filter(Boolean).length))
  }
  return (
    <div>
      <p className="text-sm font-semibold text-primary mb-3">Score {meta.max || 3} criteria (1 point each)</p>
      <div className="space-y-2">
        {criteria.map((c, i) => (
          <button
            key={c}
            type="button"
            onClick={() => set(i)}
            className={`w-full text-left rounded-lg border px-4 py-2 text-sm ${
              checks[i] ? 'border-accent bg-accent/10 text-primary' : 'border-default text-muted'
            }`}
          >
            <span className="font-semibold">{checks[i] ? '✓ ' : '○ '}</span>{c}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">Score: {score} / {meta.max || 3}</p>
    </div>
  )
}

function JudgmentWidget({ meta, value, onChange }) {
  const areas = meta.areas || []
  const [areaVals, setAreaVals] = useState(() => {
    const v = Number(value)
    return areas.map((a, i) => (Number.isFinite(v) ? Math.min(2, Math.max(0, v - i * 2)) : undefined))
  })
  const pick = (ai, s) => {
    const next = areaVals.map((x, j) => (j === ai ? s : x))
    setAreaVals(next)
    onChange(String(next.reduce((a, b) => a + (b || 0), 0)))
  }
  const total = areaVals.reduce((a, b) => a + (b || 0), 0)
  return (
    <div>
      <p className="text-sm text-muted mb-3">
        Record exactly what the person says, then score each part. Use the prompt &quot;Is there anything else
        you would do?&quot; for incomplete answers.
      </p>
      {areas.map((a, ai) => (
        <div key={ai} className="mb-3 rounded-lg border border-default p-3">
          <p className="text-sm font-semibold text-primary mb-2">{a.label}</p>
          <div className="flex flex-wrap gap-2">
            {(a.options || []).map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => pick(ai, o.score)}
                className={`min-w-[6rem] rounded-lg border px-3 py-2 text-xs transition-all ${
                  areaVals[ai] === o.score ? 'border-accent bg-accent/10 text-primary' : 'border-default text-muted hover:bg-surface-2'
                }`}
              >
                {o.label} ({o.score})
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-sm font-semibold text-primary">Judgement total: {total} / 4</p>
    </div>
  )
}

function AnimalsWidget({ meta, value, onChange }) {
  const slots = meta.slots || 8
  const [names, setNames] = useState(() => {
    const v = Number(value)
    return Array.from({ length: slots }, (_, i) => (Number.isFinite(v) && i < v ? `animal ${i + 1}` : ''))
  })
  const score = Math.min(names.filter((n) => n.trim() !== '').length, slots)
  const setSlot = (i, val) => {
    const next = names.map((x, j) => (j === i ? val : x))
    setNames(next)
    onChange(String(Math.min(next.filter((n) => n.trim() !== '').length, slots)))
  }
  return (
    <div>
      <p className="text-sm text-muted mb-2">
        Ask the person to name different animals for one minute ({meta.seconds || 60}s). Record each different animal named.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: slots }, (_, i) => (
          <input
            key={i}
            type="text"
            value={names[i]}
            placeholder={`Animal ${i + 1}`}
            onChange={(e) => setSlot(i, e.target.value)}
            className="input-field !py-2"
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">Language score: {score} / {slots}</p>
    </div>
  )
}