import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type AiScoreViewModel } from '@/modules/ai/aiResultAdapter'

function formatScore(score: number | null) {
  if (score === null) {
    return '—'
  }

  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function progressValue(score: number | null) {
  if (score === null) {
    return 0
  }

  return Math.min(100, Math.max(0, score))
}

export function ScoreOverview({ result }: { result: AiScoreViewModel }) {
  const overallProgress = progressValue(result.overallScore)

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
      <CardHeader>
        <CardTitle className="text-xl">CV score</CardTitle>
        <CardDescription>A quick, advisory view of how your CV reads for the selected context.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Overall score</p>
              <p className="mt-2 text-5xl font-bold leading-none text-[var(--color-text-primary)]">
                {formatScore(result.overallScore)}
                {result.overallScore !== null ? <span className="ml-1 text-xl font-semibold text-[var(--color-text-secondary)]">/100</span> : null}
              </p>
            </div>
            <p className="rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
              {result.assessmentLabel}
            </p>
          </div>

          {result.overallScore !== null ? (
            <div className="mt-5" aria-label={`Overall CV score: ${formatScore(result.overallScore)} out of 100`} role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={result.overallScore}>
              <div className="h-2 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-white)]">
                <div className="h-full rounded-[var(--radius-full)] bg-[var(--color-teal)] transition-[width] duration-300" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          ) : null}
        </div>

        {result.note ? (
          <p className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {result.note}
          </p>
        ) : null}

        {result.dimensions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Score dimensions</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.dimensions.map((dimension) => {
                const dimensionProgress = progressValue(dimension.score)

                return (
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4" key={dimension.key}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{dimension.label}</p>
                      <p className="shrink-0 text-sm font-bold text-[var(--color-teal)]">
                        {dimension.score === null ? '—' : `${formatScore(dimension.score)}/100`}
                      </p>
                    </div>
                    {dimension.score !== null ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-bg-soft)]" aria-hidden="true">
                        <div className="h-full rounded-[var(--radius-full)] bg-[var(--color-teal)]" style={{ width: `${dimensionProgress}%` }} />
                      </div>
                    ) : null}
                    {dimension.description ? <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{dimension.description}</p> : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {result.fallbackText ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Additional result note</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">{result.fallbackText}</p>
          </div>
        ) : null}

        {result.malformed ? (
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)]" role="status">
            The result was created but cannot be displayed fully. You can try analyzing again.
          </p>
        ) : result.partial ? (
          <p className="text-sm text-[var(--color-text-muted)]" role="status">
            Some score details were not returned for this analysis.
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          AI feedback is advisory. Review the suggestions before using them in an application.
        </p>
      </CardContent>
    </Card>
  )
}
