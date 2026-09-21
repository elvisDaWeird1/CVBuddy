import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type AiScoreViewModel } from '@/modules/ai/aiResultAdapter'
import { AiRichText } from './AiRichText'

function formatScore(score: number | null) {
  if (score === null) return '—'
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function progressValue(score: number | null) {
  if (score === null) return 0
  return Math.min(100, Math.max(0, score))
}

function formatConfidence(confidence: number | null) {
  if (confidence === null) return undefined
  const percentage = confidence <= 1 ? confidence * 100 : confidence
  return `${Math.round(Math.min(100, Math.max(0, percentage)))}%`
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function dimensionAssessment(score: number | null) {
  if (score === null) return 'Not scored'
  if (score < 60) return 'Needs focus'
  if (score < 80) return 'On track'
  return 'Strong'
}

function DimensionDetailList({
  items,
  label,
  tone = 'neutral',
}: {
  items: string[]
  label: string
  tone?: 'neutral' | 'warning' | 'success'
}) {
  if (items.length === 0) return null

  const markerClass = tone === 'warning'
    ? 'bg-[var(--color-warning)]'
    : tone === 'success'
      ? 'bg-[var(--color-success)]'
      : 'bg-[var(--color-teal)]'

  return (
    <div className={'mt-4'}>
      <p className={'text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]'}>{label}</p>
      <ul className={'mt-2 space-y-2'}>
        {items.map((item, index) => (
          <li className={'flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text-secondary)]'} key={item + '-' + index}>
            <span aria-hidden={'true'} className={'mt-2 h-1.5 w-1.5 shrink-0 rounded-[var(--radius-full)] ' + markerClass} />
            <span className={'min-w-0 break-words'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScoreOverview({ result }: { result: AiScoreViewModel }) {
  const overallProgress = progressValue(result.overallScore)
  const confidence = formatConfidence(result.confidence)

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
      <CardHeader className="bg-[var(--color-gray-50)] sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <CardTitle className="text-xl">CV analysis</CardTitle>
          <CardDescription>See what is working, what needs attention, and which edits can improve role fit.</CardDescription>
        </div>
        {result.meta?.language ? (
          <span className="mt-3 inline-flex w-fit shrink-0 rounded-[var(--radius-full)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)] sm:mt-0">
            Analyzed in {result.meta.language.toUpperCase()}
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-8 p-4 sm:p-6">
        <section className="grid overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-navy)] lg:grid-cols-[220px_minmax(0,1fr)]" aria-labelledby="overall-score-heading">
          <div className="flex flex-col items-center justify-center border-b border-[var(--color-gray-700)] p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-cyan)]" id="overall-score-heading">Overall score</p>
            <div
              aria-label={`Overall CV score: ${formatScore(result.overallScore)} out of 100`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={result.overallScore ?? undefined}
              className="mt-4 flex h-36 w-36 items-center justify-center rounded-[var(--radius-full)] p-2"
              role={result.overallScore === null ? undefined : 'progressbar'}
              style={{ background: `conic-gradient(var(--color-cyan) ${overallProgress}%, var(--color-gray-700) 0)` }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-navy)]">
                <span className="text-4xl font-bold leading-none text-[var(--color-text-on-navy)]">{formatScore(result.overallScore)}</span>
                {result.overallScore !== null ? <span className="mt-1 text-sm font-medium text-[var(--color-gray-300)]">out of 100</span> : null}
              </div>
            </div>
            <span className="mt-4 rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)]">{result.assessmentLabel}</span>
          </div>

          <div className="flex flex-col justify-between gap-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-300)]">Analysis snapshot</p>
              <h4 className="mt-2 text-2xl font-semibold text-[var(--color-text-on-navy)]">Turn the score into a focused edit plan.</h4>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-gray-300)]">
                Start with the lowest-scoring dimension, then review missing keywords and rewrite suggestions before updating your CV.
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-700)] p-3">
                <dt className="text-xs text-[var(--color-gray-300)]">Dimensions</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-text-on-navy)]">{result.dimensions.length}</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-700)] p-3">
                <dt className="text-xs text-[var(--color-gray-300)]">Missing keywords</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-text-on-navy)]">{result.missingKeywords.length}</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-700)] p-3">
                <dt className="text-xs text-[var(--color-gray-300)]">Rewrite ideas</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-text-on-navy)]">{result.rewrites.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {result.note ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] px-4 py-3">
            <AiRichText text={result.note} />
          </div>
        ) : null}

        {result.dimensions.length > 0 ? (
          <section aria-labelledby="score-dimensions-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Score breakdown</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="score-dimensions-heading">Where your CV stands</h4>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Higher is stronger</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.dimensions.map((dimension) => {
                const dimensionProgress = progressValue(dimension.score)

                return (
                  <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)]" key={dimension.key}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{dimension.label}</p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{dimensionAssessment(dimension.score)}</p>
                      </div>
                      <p className="shrink-0 text-xl font-bold text-[var(--color-teal)]">{dimension.score === null ? '—' : formatScore(dimension.score)}</p>
                    </div>
                    {dimension.score !== null ? (
                      <div
                        aria-label={`${dimension.label}: ${formatScore(dimension.score)} out of 100`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={dimension.score}
                        className="mt-4 h-2 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-bg-soft)]"
                        role="progressbar"
                      >
                        <div className="h-full rounded-[var(--radius-full)] bg-[var(--color-teal)] transition-[width] duration-300" style={{ width: `${dimensionProgress}%` }} />
                      </div>
                    ) : null}
                    {dimension.description ? <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{dimension.description}</p> : null}
                    <DimensionDetailList items={dimension.issues} label="Issues found" tone="warning" />
                    <DimensionDetailList items={dimension.fixes} label="How to improve" tone="success" />
                    <DimensionDetailList items={dimension.suggestedBullets} label="Suggested bullets" tone="success" />
                    <DimensionDetailList items={dimension.gaps} label="Role-fit gaps" tone="warning" />
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {result.missingKeywords.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-5" aria-labelledby="missing-keywords-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-warning)]">Keyword opportunity</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="missing-keywords-heading">Terms missing from this CV</h4>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">Add these terms only when they accurately describe your experience, skills, or projects.</p>
              </div>
              <span className="w-fit shrink-0 rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">{result.missingKeywords.length} found</span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Missing keywords">
              {result.missingKeywords.map((keyword) => (
                <li className="rounded-[var(--radius-full)] border border-[var(--color-warning)] bg-[var(--color-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)]" key={keyword}>{keyword}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.rewrites.length > 0 ? (
          <section aria-labelledby="rewrite-suggestions-heading">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Actionable edits</p>
              <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="rewrite-suggestions-heading">Rewrite suggestions</h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Compare the original wording with a clearer, more outcome-oriented version.</p>
            </div>
            <div className="mt-4 space-y-4">
              {result.rewrites.map((rewrite, index) => (
                <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]" key={`${rewrite.suggested}-${index}`}>
                  <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 py-3">
                    <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)]">
                      {rewrite.section ? formatLabel(rewrite.section) : `Suggestion ${index + 1}`}
                    </span>
                    {rewrite.needsUserFact ? (
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                        Verify or add supporting facts before using
                      </span>
                    ) : null}
                  </header>
                  <div className="grid lg:grid-cols-2">
                    {rewrite.original ? (
                      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-main)] p-4 lg:border-b-0 lg:border-r">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Original</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">{rewrite.original}</p>
                      </div>
                    ) : null}
                    <div className={rewrite.original ? 'space-y-4 bg-[var(--color-bg-soft)] p-4' : 'space-y-4 bg-[var(--color-bg-soft)] p-4 lg:col-span-2'}>
                      {rewrite.suggestedVi ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested · Vietnamese</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">{rewrite.suggestedVi}</p>
                        </div>
                      ) : null}
                      {rewrite.suggestedEn ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested · English</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">{rewrite.suggestedEn}</p>
                        </div>
                      ) : null}
                      {!rewrite.suggestedVi && !rewrite.suggestedEn ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested rewrite</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">{rewrite.suggested}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {rewrite.reason ? <p className="border-t border-[var(--color-border)] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-muted)]">Why: {rewrite.reason}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {result.fallbackText ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Additional result note</p>
            <div className="mt-2"><AiRichText text={result.fallbackText} /></div>
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

        <footer className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-[var(--color-text-muted)]">
            {result.disclaimer || 'AI feedback is advisory. Verify every suggested claim and keyword before using it in an application.'}
          </p>
          {confidence || result.meta?.source || result.meta?.model ? (
            <div className="text-xs sm:text-right">
              <dl className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
                {confidence ? <div><dt className="inline text-[var(--color-text-muted)]">Confidence </dt><dd className="inline font-semibold text-[var(--color-text-primary)]">{confidence}</dd></div> : null}
                {result.meta?.source ? <div><dt className="inline text-[var(--color-text-muted)]">Source </dt><dd className="inline font-semibold text-[var(--color-text-primary)]">{formatLabel(result.meta.source)}</dd></div> : null}
              </dl>
              {result.meta?.model ? (
                <details className="mt-2 text-[var(--color-text-muted)]">
                  <summary className="cursor-pointer font-medium text-[var(--color-teal)]">Technical details</summary>
                  <p className="mt-1 max-w-full break-all">Model {result.meta.model}</p>
                </details>
              ) : null}
            </div>
          ) : null}
        </footer>
      </CardContent>
    </Card>
  )
}
