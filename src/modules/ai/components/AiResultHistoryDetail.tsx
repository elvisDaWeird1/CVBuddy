import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type AiResultRecord } from '@/modules/ai/aiApi'
import { formatCareerContext } from '@/modules/ai/aiCareerCatalog'
import {
  adaptFeedbackResult,
  adaptScoreResult,
  adaptTranslationResult,
  hasStructuredAnalysisResult,
} from '@/modules/ai/aiResultAdapter'
import { adaptAiHistory, type AiHistoryItemViewModel } from '@/modules/ai/aiHistoryAdapter'
import { AiCommentCard } from './AiCommentCard'
import { FeedbackPanel } from './FeedbackPanel'
import { AiNextActions, SafeRouterLink, ScoreOverview } from './ScoreOverview'
import { TranslationPanel } from './TranslationPanel'

export interface AiResultHistoryDetailProps {
  item?: AiHistoryItemViewModel | null
  record: AiResultRecord | null
  loading: boolean
  error?: string | null
  errorStatus?: number
  sourceCvId?: string | null
  onRetry: () => void
  onBack?: () => void
}

function statusBadgeClass(status: AiHistoryItemViewModel['status']) {
  if (status === 'completed') {
    return 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
  }
  if (status === 'failed') {
    return 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
  }
  if (status === 'processing') {
    return 'bg-[var(--color-bg-soft)] text-[var(--color-teal)]'
  }
  return 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)]'
}

function HistoryHeader({
  item,
  onBack,
}: {
  item: AiHistoryItemViewModel
  onBack?: () => void
}) {
  const careerContext = formatCareerContext(item.industrySlug, item.verticalSlug, item.targetRole)
    || [item.targetRole, item.industrySlug?.replace(/_/g, ' ')].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Saved AI result</p>
          <span className={`rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
            {item.statusLabel}
          </span>
        </div>
        <h2 className="mt-1 truncate text-lg font-semibold text-[var(--color-text-primary)]" id="ai-history-detail-heading">
          {item.typeLabel}
        </h2>
        <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
          {item.cvName} · {item.createdAtLabel}
        </p>
        {careerContext ? (
          <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{careerContext}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onBack ? (
          <Button onClick={onBack} size="sm" type="button" variant="ghost">
            Back to CV Analysis
          </Button>
        ) : (
          <SafeRouterLink
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-teal)]"
            to="/ai/history"
          >
            View history
          </SafeRouterLink>
        )}
      </div>
    </div>
  )
}

export function AiResultHistoryDetail({
  item,
  record,
  loading,
  error,
  errorStatus,
  sourceCvId = null,
  onRetry,
  onBack,
}: AiResultHistoryDetailProps) {
  const resolvedItem = item ?? (record ? adaptAiHistory([record], [])[0] : null)
  const effectiveType = resolvedItem?.type ?? 'unknown'
  const analysisResult = record && (
    effectiveType === 'score'
    || (effectiveType === 'feedback' && hasStructuredAnalysisResult(record))
  ) ? adaptScoreResult(record) : null
  const feedbackResult = record && effectiveType === 'feedback' && !hasStructuredAnalysisResult(record)
    ? adaptFeedbackResult(record)
    : null
  const effectiveStatus = record?.status === 'FAILED'
    ? 'failed'
    : record?.status === 'PENDING'
      ? 'processing'
      : (resolvedItem?.status ?? 'unknown')

  return (
    <section aria-labelledby={resolvedItem ? 'ai-history-detail-heading' : undefined} className="space-y-4">
      {resolvedItem ? <HistoryHeader item={resolvedItem} onBack={onBack} /> : null}

      {loading ? (
        <Card aria-live="polite" role="status">
          <CardHeader><CardTitle>Loading saved result</CardTitle></CardHeader>
          <CardContent><div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-main)]" /></CardContent>
        </Card>
      ) : errorStatus === 403 ? (
        <Card role="alert">
          <CardHeader><CardTitle>Access denied</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]">
              {error || 'You do not have permission to view this AI result.'}
            </p>
            <AiNextActions includeTranslate={false} sourceCvId={null} />
          </CardContent>
        </Card>
      ) : errorStatus === 404 ? (
        <Card role="alert">
          <CardHeader><CardTitle>AI result not found</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)]">
              {error || 'This saved AI result does not exist or is no longer available.'}
            </p>
            <AiNextActions includeTranslate={false} sourceCvId={null} />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="space-y-3 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm" role="alert">
          <p className="font-semibold text-[var(--color-error)]">We could not open this saved result.</p>
          <p className="leading-relaxed text-[var(--color-text-primary)]">{error}</p>
          <Button onClick={onRetry} size="sm" type="button" variant="secondary">Try again</Button>
        </div>
      ) : !record ? (
        <div className="space-y-4">
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm" role="status">
            This saved result is not available anymore.
          </p>
          <AiNextActions includeTranslate={false} sourceCvId={null} />
        </div>
      ) : effectiveStatus === 'failed' ? (
        <Card>
          <CardHeader><CardTitle>AI result failed</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]" role="alert">
              {record.errorMessage || 'This AI task could not be completed.'}
            </p>
            {record.errorCode ? <p className="text-xs text-[var(--color-text-muted)]">Reference: {record.errorCode}</p> : null}
            <Button onClick={onRetry} size="sm" type="button" variant="secondary">Refresh detail</Button>
            <AiNextActions sourceCvId={sourceCvId} />
          </CardContent>
        </Card>
      ) : effectiveStatus === 'processing' ? (
        <Card aria-live="polite" role="status">
          <CardHeader><CardTitle>AI result is still processing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              This task was saved as pending. Refresh its detail to check whether processing finished.
            </p>
            <Button onClick={onRetry} size="sm" type="button" variant="secondary">Refresh status</Button>
          </CardContent>
        </Card>
      ) : analysisResult ? (
        <ScoreOverview result={analysisResult} sourceCvId={sourceCvId} />
      ) : feedbackResult ? (
        <div className="space-y-4">
          {feedbackResult.aiComment ? <AiCommentCard comment={feedbackResult.aiComment} /> : null}
          <FeedbackPanel result={feedbackResult} />
          <AiNextActions sourceCvId={sourceCvId} />
        </div>
      ) : effectiveType === 'translation' ? (
        <div className="space-y-4">
          <TranslationPanel readOnly result={adaptTranslationResult(record)} />
          <AiNextActions includeTranslate={false} sourceCvId={sourceCvId} />
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Saved AI result</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              This result type is not supported by the current screen.
            </p>
            <AiNextActions sourceCvId={sourceCvId} />
          </CardContent>
        </Card>
      )}
    </section>
  )
}
