import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileTextIcon } from '@/components/ui/icons'
import { Select } from '@/components/ui/select'
import { type AiHistoryItemViewModel } from '@/modules/ai/aiHistoryAdapter'

interface AiResultHistoryProps {
  items: AiHistoryItemViewModel[]
  loading: boolean
  error?: string | null
  selectedId?: string | null
  onRetry: () => void
  onSelect: (item: AiHistoryItemViewModel) => void
}

function statusClass(status: AiHistoryItemViewModel['status']) {
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

export function AiResultHistory({
  items,
  loading,
  error,
  selectedId,
  onRetry,
  onSelect,
}: AiResultHistoryProps) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const filteredItems = useMemo(
    () => items.filter((item) => (
      (typeFilter === 'all' || item.type === typeFilter)
      && (statusFilter === 'all' || item.status === statusFilter)
    )),
    [items, statusFilter, typeFilter],
  )

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-sm)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5 text-[var(--color-teal)]" />
          Recent AI results
        </CardTitle>
        <CardDescription>Open a saved score and review result, translation, or legacy feedback result.</CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !error && items.length > 0 ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Select
              aria-label="Filter AI results by type"
              onChange={(event) => setTypeFilter(event.target.value)}
              options={[
                { value: 'all', label: 'All types' },
                { value: 'translation', label: 'Translate to English' },
                { value: 'score', label: 'Score and review' },
                { value: 'feedback', label: 'Feedback' },
              ]}
              value={typeFilter}
            />
            <Select
              aria-label="Filter AI results by status"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'processing', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={statusFilter}
            />
          </div>
        ) : null}
        {loading ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <span className="sr-only">Loading recent AI results...</span>
            {[1, 2, 3].map((item) => (
              <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-main)]" key={item} />
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3" role="alert">
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]">
              {error}
            </p>
            <Button onClick={onRetry} size="sm" type="button" variant="secondary">Try again</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] px-4 py-6 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">You do not have any AI results yet.</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Select a CV and start an analysis to build your history.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] px-4 py-6 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">No results match these filters.</p>
            <button className="mt-2 text-sm font-semibold text-[var(--color-teal)] hover:underline" onClick={() => { setTypeFilter('all'); setStatusFilter('all') }} type="button">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Recent AI results">
            {filteredItems.map((item) => (
              <div key={item.id} role="listitem">
                <button
                  aria-pressed={selectedId === item.id}
                  className={selectedId === item.id
                    ? 'w-full rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-bg-soft)] p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2'
                    : 'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4 text-left transition-colors hover:border-[var(--color-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2'}
                  onClick={() => onSelect(item)}
                  type="button"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--color-text-primary)]">{item.typeLabel}</span>
                      <span className="mt-1 block truncate text-xs text-[var(--color-text-secondary)]">{item.cvName}</span>
                    </span>
                    <span className={'shrink-0 rounded-[var(--radius-full)] px-2 py-1 text-xs font-semibold ' + statusClass(item.status)}>
                      {item.statusLabel}
                    </span>
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                    <span>{item.createdAtLabel}</span>
                    {item.type === 'score' && item.score !== null ? <span className="font-semibold text-[var(--color-teal)]">Score {item.score}/100</span> : null}
                  </span>
                  {item.targetRole || item.industrySlug ? (
                    <span className="mt-2 block truncate text-xs text-[var(--color-text-secondary)]">
                      {[item.targetRole, item.industrySlug?.replace(/_/g, ' ')].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                  {item.status === 'failed' ? (
                    <span className="mt-2 block text-xs leading-relaxed text-[var(--color-error)]">Open this result to view the saved error details.</span>
                  ) : null}
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
