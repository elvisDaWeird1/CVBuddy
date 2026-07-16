import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type AiResultRecord } from '@/modules/ai/aiApi'
import { adaptFeedbackResult, adaptScoreResult, adaptTranslationResult } from '@/modules/ai/aiResultAdapter'
import { type AiHistoryItemViewModel } from '@/modules/ai/aiHistoryAdapter'
import { AiCommentCard } from './AiCommentCard'
import { FeedbackPanel } from './FeedbackPanel'
import { ScoreOverview } from './ScoreOverview'
import { TranslationPanel } from './TranslationPanel'

interface AiResultHistoryDetailProps {
  item: AiHistoryItemViewModel
  record: AiResultRecord | null
  loading: boolean
  error?: string | null
  onRetry: () => void
  onBack: () => void
}

function HistoryHeader({ item, onBack }: { item: AiHistoryItemViewModel; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Saved AI result</p>
        <h2 className="mt-1 truncate text-lg font-semibold text-[var(--color-text-primary)]" id="ai-history-detail-heading">{item.typeLabel}</h2>
        <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{item.cvName} · {item.createdAtLabel}</p>
      </div>
      <Button onClick={onBack} size="sm" type="button" variant="ghost">Back to current result</Button>
    </div>
  )
}

export function AiResultHistoryDetail({
  item,
  record,
  loading,
  error,
  onRetry,
  onBack,
}: AiResultHistoryDetailProps) {
  const scoreResult = record && item.type === 'score' ? adaptScoreResult(record) : null
  const feedbackResult = record && item.type === 'feedback' ? adaptFeedbackResult(record) : null

  return (
    <section className="space-y-4" aria-labelledby="ai-history-detail-heading">
      <HistoryHeader item={item} onBack={onBack} />

      {loading ? (
        <Card role="status" aria-live="polite">
          <CardHeader><CardTitle>Loading saved result</CardTitle></CardHeader>
          <CardContent><div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-main)]" /></CardContent>
        </Card>
      ) : error ? (
        <div className="space-y-3 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm" role="alert">
          <p className="font-semibold text-[var(--color-error)]">We could not open this saved result.</p>
          <p className="leading-relaxed text-[var(--color-text-primary)]">{error}</p>
          <Button onClick={onRetry} size="sm" type="button" variant="secondary">Try again</Button>
        </div>
      ) : !record ? (
        <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm" role="status">
          This saved result is not available anymore.
        </p>
      ) : item.status === 'failed' ? (
        <Card>
          <CardHeader><CardTitle>AI result failed</CardTitle></CardHeader>
          <CardContent>
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]" role="alert">
              {item.errorMessage || 'This AI task could not be completed.'}
            </p>
          </CardContent>
        </Card>
      ) : item.status === 'processing' ? (
        <Card role="status" aria-live="polite">
          <CardHeader><CardTitle>AI result is still processing</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">Try opening this result again in a moment.</p></CardContent>
        </Card>
      ) : scoreResult ? (
        <div className="space-y-4">
          <ScoreOverview result={scoreResult} />
          <AiCommentCard comment={scoreResult.aiComment} />
        </div>
      ) : feedbackResult ? (
        <div className="space-y-4">
          <AiCommentCard comment={feedbackResult.aiComment} />
          <FeedbackPanel result={feedbackResult} />
        </div>
      ) : item.type === 'translation' ? (
        <div><TranslationPanel readOnly result={adaptTranslationResult(record)} /></div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Saved AI result</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">This result type is not supported by the current screen.</p></CardContent>
        </Card>
      )}
    </section>
  )
}
