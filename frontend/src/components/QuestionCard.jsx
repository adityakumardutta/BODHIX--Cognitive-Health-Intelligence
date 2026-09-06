import Button from './Button.jsx'
import ProgressBar from './ProgressBar.jsx'
import ProvenanceBadge from './ProvenanceBadge.jsx'

export default function QuestionCard({
  sectionName, current, total, question, value, onChange, onBack, onNext, isLast, backDisabled = false, instrument,
}) {
  const optionScores = question.optionsJson ? JSON.parse(question.optionsJson) : null
  const options = optionScores ? Object.keys(optionScores) : null
  const isTaskScore = question.responseType === 'TASK_SCORE' || question.responseType === 'NUMERIC'
  const maxTask = Math.round(Number(question.maxItemScore) || 0)

  return (
    <div className="glass-pop rounded-2xl p-6 max-w-xl mx-auto shadow-glow">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{sectionName}</p>
      <ProvenanceBadge instrument={instrument} sectionName={sectionName} />
      <ProgressBar value={current} max={total} label={`Question ${current} of ${total}`} />

      <p className="mt-6 text-lg text-primary leading-relaxed">{question.promptText}</p>
      {question.helperText && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Simple meaning</p>
          <p className="mt-1 text-sm text-muted leading-relaxed">{question.helperText}</p>
        </div>
      )}
      {question.exampleText && (
        <div className="mt-3 rounded-lg border border-default bg-surface-2/60 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Example</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">{question.exampleText}</p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {isTaskScore ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              Task score (0–{maxTask})
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxTask + 1 }, (_, s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange(String(s))}
                  className={`min-w-[2.75rem] h-11 rounded-xl border px-3 text-sm font-semibold transition-all ${
                    String(value) === String(s)
                      ? 'border-accent bg-accent/10 text-primary shadow-inner scale-[1.03]'
                      : 'border-default hover:bg-surface-2 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : options ? (
          options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                value === opt
                  ? 'border-accent bg-accent/10 text-primary shadow-inner'
                  : 'border-default hover:bg-surface-2 hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              <span className="font-semibold">{opt}</span>
              {OPTION_NOTES[opt] && (
                <span className="block mt-0.5 text-xs text-muted leading-snug">{OPTION_NOTES[opt]}</span>
              )}
            </button>
          ))
        ) : null}
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

// Presentation-only explanation of the validated PFAQ response scale.
// The scores themselves come from the backend's options_json (single source of truth).
const OPTION_NOTES = {
  'Normal': 'Does this activity independently as usual.',
  'Has difficulty but does by self': 'Can still do it alone, but with noticeable difficulty, slowness or mistakes.',
  'Requires assistance': "Needs another person's help to complete the activity.",
  'Dependent': 'Cannot perform it independently and relies on another person.',
  'Never did this activity, but could do it now': 'Has never done it, but you believe they could do it now.',
  'Never did this activity, and would have difficulty now': 'Has never done it, and you believe they would have difficulty.',
}
