import { type ComponentPropsWithoutRef } from 'react'
import { Link, useInRouterContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRightIcon } from '@/components/ui/icons'
import { type AiScoreViewModel } from '@/modules/ai/aiResultAdapter'
import { AiCommentCard } from './AiCommentCard'
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

function assessmentBadgeClass(score: number | null) {
  if (score === null) {
    return 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)]'
  }
  if (score < 60) {
    return 'bg-[var(--color-warning-bg)] text-[var(--color-text-primary)]'
  }
  if (score < 80) {
    return 'bg-[var(--color-bg-soft)] text-[var(--color-teal)]'
  }
  return 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
}

export function SafeRouterLink({
  to,
  className,
  children,
  ...rest
}: Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { to: string }) {
  const inRouter = useInRouterContext()

  if (inRouter) {
    return (
      <Link className={className} to={to} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a className={className} href={to} {...rest}>
      {children}
    </a>
  )
}

function DetailList({
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
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{label}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text-secondary)]" key={`${item}-${index}`}>
            <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-[var(--radius-full)] ${markerClass}`} />
            <span className="min-w-0 whitespace-pre-wrap break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AiNextActions({
  sourceCvId,
  includeTranslate = true,
}: {
  sourceCvId?: string | null
  includeTranslate?: boolean
}) {
  const trimmedCvId = typeof sourceCvId === 'string' && sourceCvId.trim() ? sourceCvId.trim() : null
  const translateUrl = includeTranslate && trimmedCvId
    ? `/ai?cvId=${encodeURIComponent(trimmedCvId)}&action=translate`
    : null

  return (
    <section
      aria-labelledby="next-actions-heading"
      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">What to do next</p>
        <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="next-actions-heading">
          Next actions
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Continue improving your CV or run another analysis.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <SafeRouterLink
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-4 text-sm font-semibold text-[var(--color-text-on-teal)] transition-colors hover:opacity-95"
          to="/ai"
        >
          Analyze another CV
          <ArrowRightIcon className="h-4 w-4" />
        </SafeRouterLink>
        {translateUrl ? (
          <SafeRouterLink
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-teal)] transition-colors hover:bg-[var(--color-bg-soft)]"
            to={translateUrl}
          >
            Translate this CV
          </SafeRouterLink>
        ) : null}
        <SafeRouterLink
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-teal)]"
          to="/cv"
        >
          Manage/Edit CV
        </SafeRouterLink>
        <SafeRouterLink
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-teal)]"
          to="/ai/history"
        >
          View history
        </SafeRouterLink>
      </div>
    </section>
  )
}

export interface ScoreOverviewProps {
  result: AiScoreViewModel
  sourceCvId?: string | null
  showNextActions?: boolean
}

export function ScoreOverview({
  result,
  sourceCvId = null,
  showNextActions = true,
}: ScoreOverviewProps) {
  const overallProgress = progressValue(result.overallScore)
  const confidence = formatConfidence(result.confidence)
  const dimensionsWithFindings = result.dimensions.filter(
    (dimension) => dimension.issues.length > 0 || dimension.fixes.length > 0 || dimension.gaps.length > 0,
  )
  const dimensionGapSet = new Set(result.dimensions.flatMap((dimension) => dimension.gaps))
  const standaloneRoleFitGaps = result.roleFitGaps.filter((gap) => !dimensionGapSet.has(gap))
  const hasFindingsSection = dimensionsWithFindings.length > 0 || standaloneRoleFitGaps.length > 0
  const disclaimerText = result.disclaimer
    || 'AI feedback is advisory. Verify every suggested claim and keyword before using it in an application.'

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
      <CardHeader className="bg-[var(--color-gray-50)] sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <CardTitle className="text-xl">CV analysis</CardTitle>
          <CardDescription>See what is working, what needs attention first, and which edits can improve role fit.</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-4 sm:p-6">
        {/* 1. Overall score */}
        <section
          aria-labelledby="overall-score-heading"
          className="grid overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-navy)] lg:grid-cols-[220px_minmax(0,1fr)]"
        >
          <div className="flex flex-col items-center justify-center border-b border-[var(--color-gray-700)] p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-cyan)]" id="overall-score-heading">
              Overall score
            </p>
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
            <span className="mt-4 rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
              {result.assessmentLabel}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-300)]">Analysis snapshot</p>
              <h4 className="mt-2 text-2xl font-semibold text-[var(--color-text-on-navy)]">Turn the score into a focused edit plan.</h4>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-gray-300)]">
                Start with the lowest-scoring priority areas, check the four core dimensions and strongest area, then apply keyword and rewrite updates.
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-700)] p-3">
                <dt className="text-xs text-[var(--color-gray-300)]">Priority areas</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-text-on-navy)]">{result.priorityGroups.length}</dd>
              </div>
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

        {/* 2. Fix-first priorities */}
        {result.priorityGroups.length > 0 ? (
          <section aria-labelledby="priority-issues-heading" className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">What to fix first</p>
              <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="priority-issues-heading">
                Fix-first priorities
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Ordered from the lowest-scoring dimension to the highest among areas with reported issues, gaps, or fixes.
              </p>
            </div>
            <div className="grid gap-4">
              {result.priorityGroups.map((priority, index) => (
                <article
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4 sm:p-5"
                  key={`priority-${priority.key}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-navy)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-on-navy)]">
                        Priority {index + 1}
                      </span>
                      <h5 className="text-base font-semibold text-[var(--color-text-primary)]">{priority.label}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold ${assessmentBadgeClass(priority.score)}`}>
                        {priority.assessmentLabel}
                      </span>
                      <span className="text-sm font-bold text-[var(--color-teal)]">{formatScore(priority.score)}/100</span>
                    </div>
                  </div>
                  <DetailList items={priority.issues} label="Issues found" tone="warning" />
                  <DetailList items={priority.gaps} label="Role-fit gaps" tone="warning" />
                  <DetailList items={priority.fixes} label="How to improve" tone="success" />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* 3. Four actual score dimensions */}
        {result.dimensions.length > 0 ? (
          <section aria-labelledby="score-dimensions-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Score breakdown</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="score-dimensions-heading">
                  Where your CV stands
                </h4>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Higher is stronger</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.dimensions.map((dimension) => {
                const dimensionProgress = progressValue(dimension.score)

                return (
                  <article
                    className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)]"
                    key={dimension.key}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{dimension.label}</p>
                        <span className={`mt-1 inline-block rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-semibold ${assessmentBadgeClass(dimension.score)}`}>
                          {dimension.assessmentLabel}
                        </span>
                      </div>
                      <p className="shrink-0 text-xl font-bold text-[var(--color-teal)]">
                        {dimension.score === null ? '—' : formatScore(dimension.score)}
                      </p>
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
                        <div
                          className="h-full rounded-[var(--radius-full)] bg-[var(--color-teal)] transition-[width] duration-300"
                          style={{ width: `${dimensionProgress}%` }}
                        />
                      </div>
                    ) : null}
                    {dimension.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{dimension.description}</p>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* 4. Strongest area */}
        {result.strongestArea ? (
          <section
            aria-labelledby="strongest-area-heading"
            className="rounded-[var(--radius-xl)] border border-[var(--color-teal)] bg-[var(--color-bg-soft)] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Highest dimension score</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="strongest-area-heading">
                  Strongest area: {result.strongestArea.label}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {result.strongestArea.description || 'Highest-scoring dimension recorded in this evaluation.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold ${assessmentBadgeClass(result.strongestArea.score)}`}>
                  {result.strongestArea.assessmentLabel}
                </span>
                <span className="rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1 text-sm font-bold text-[var(--color-teal)]">
                  {formatScore(result.strongestArea.score)}/100
                </span>
              </div>
            </div>
          </section>
        ) : null}

        {/* 5. Issues, fixes and role-fit gaps */}
        {hasFindingsSection ? (
          <section aria-labelledby="issues-fixes-gaps-heading" className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Detailed findings</p>
              <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="issues-fixes-gaps-heading">
                Issues, fixes, and role-fit gaps
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Complete list of reported issues, improvement steps, and target-role gaps by dimension.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {dimensionsWithFindings.map((dimension) => (
                <article
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4"
                  key={`findings-${dimension.key}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-[var(--color-text-primary)]">{dimension.label}</h5>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {dimension.score === null ? dimension.assessmentLabel : `${formatScore(dimension.score)}/100 · ${dimension.assessmentLabel}`}
                    </span>
                  </div>
                  <DetailList items={dimension.issues} label="Issues found" tone="warning" />
                  <DetailList items={dimension.fixes} label="How to improve" tone="success" />
                  <DetailList items={dimension.gaps} label="Role-fit gaps" tone="warning" />
                </article>
              ))}
            </div>
            {standaloneRoleFitGaps.length > 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                <DetailList items={standaloneRoleFitGaps} label="Role-fit gaps" tone="warning" />
              </div>
            ) : null}
          </section>
        ) : null}

        {/* 6. Missing keywords */}
        {result.missingKeywords.length > 0 ? (
          <section
            aria-labelledby="missing-keywords-heading"
            className="rounded-[var(--radius-xl)] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-warning)]">Keyword opportunity</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="missing-keywords-heading">
                  Terms missing from this CV
                </h4>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Add these terms only when they accurately describe your experience, skills, or projects.
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-[var(--radius-full)] bg-[var(--color-white)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                {result.missingKeywords.length} found
              </span>
            </div>
            <ul aria-label="Missing keywords" className="mt-4 flex flex-wrap gap-2">
              {result.missingKeywords.map((keyword) => (
                <li
                  className="rounded-[var(--radius-full)] border border-[var(--color-warning)] bg-[var(--color-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)]"
                  key={keyword}
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 7. Global suggested bullets */}
        {result.suggestedBullets.length > 0 ? (
          <section
            aria-labelledby="suggested-bullets-heading"
            className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Suggested resume bullets</p>
              <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="suggested-bullets-heading">
                Suggested bullets
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Adapt these bullet ideas with your real metrics, tools, and outcomes.
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {result.suggestedBullets.map((bullet, index) => (
                <li
                  className="flex items-start gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                  key={`${bullet}-${index}`}
                >
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[var(--radius-full)] bg-[var(--color-success)]" />
                  <span className="min-w-0 whitespace-pre-wrap break-words">{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 8. Rewrite comparisons */}
        {result.rewrites.length > 0 ? (
          <section aria-labelledby="rewrite-suggestions-heading">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Actionable edits</p>
              <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]" id="rewrite-suggestions-heading">
                Rewrite suggestions
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Compare the original wording with a clearer, more outcome-oriented version.
              </p>
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
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
                          {rewrite.original}
                        </p>
                      </div>
                    ) : null}
                    <div className={rewrite.original ? 'space-y-4 bg-[var(--color-bg-soft)] p-4' : 'space-y-4 bg-[var(--color-bg-soft)] p-4 lg:col-span-2'}>
                      {rewrite.suggestedVi ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested · Vietnamese</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">
                            {rewrite.suggestedVi}
                          </p>
                        </div>
                      ) : null}
                      {rewrite.suggestedEn ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested · English</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">
                            {rewrite.suggestedEn}
                          </p>
                        </div>
                      ) : null}
                      {!rewrite.suggestedVi && !rewrite.suggestedEn ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Suggested rewrite</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">
                            {rewrite.suggested}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {rewrite.reason ? (
                    <p className="border-t border-[var(--color-border)] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      Why: {rewrite.reason}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* 9. Company-model feedback (rendered once) */}
        {result.aiComment ? <AiCommentCard comment={result.aiComment} /> : null}

        {result.fallbackText ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Additional result note</p>
            <div className="mt-2">
              <AiRichText text={result.fallbackText} />
            </div>
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

        {/* 10. Supported next actions */}
        {showNextActions ? <AiNextActions sourceCvId={sourceCvId} /> : null}

        {/* 11. Collapsed technical details */}
        <footer className="border-t border-[var(--color-border)] pt-4">
          <details
            aria-label="Technical details and advisory disclaimer"
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] px-4 py-3 text-xs text-[var(--color-text-secondary)]"
          >
            <summary className="cursor-pointer font-semibold text-[var(--color-teal)]">
              Technical details
            </summary>
            <div className="mt-3 space-y-2">
              <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Provider</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-primary)]">
                    {result.meta?.source ? formatLabel(result.meta.source) : 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Model</dt>
                  <dd className="mt-0.5 break-all font-semibold text-[var(--color-text-primary)]">
                    {result.meta?.model || 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Confidence</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-primary)]">
                    {confidence || 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Language</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-primary)]">
                    {result.meta?.language ? result.meta.language.toUpperCase() : 'Not recorded'}
                  </dd>
                </div>
              </dl>
              <p className="border-t border-[var(--color-border)] pt-2 leading-relaxed text-[var(--color-text-muted)]">
                {disclaimerText}
              </p>
            </div>
          </details>
        </footer>
      </CardContent>
    </Card>
  )
}
