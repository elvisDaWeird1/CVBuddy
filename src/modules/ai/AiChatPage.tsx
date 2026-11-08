import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import {
  getAiApiErrorMessage,
  getAiApiErrorStatus,
  type AiResultRecord,
} from './aiApi'
import {
  getAiResultDetailErrorMessage,
  getAiResultRoute,
  loadAiResultDetail,
  loadAiResultHistory,
  readResultId,
  type AiHistoryItemViewModel,
} from './aiHistoryAdapter'
import { AiRequestComposer } from './components/AiRequestComposer'
import { AiResultHistory } from './components/AiResultHistory'
import { AiResultHistoryDetail } from './components/AiResultHistoryDetail'
import { SafeRouterLink } from './components/ScoreOverview'

export default function AiChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCvId = searchParams.get('cvId')
  const initialAction = searchParams.get('action')

  const handleResultCreated = (result: AiResultRecord) => {
    const resultId = readResultId(result)
    if (resultId && resultId !== 'unknown-result') {
      navigate(getAiResultRoute(resultId))
    }
  }

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <SafeRouterLink className="hover:text-[var(--color-teal)]" to="/profile">Profile</SafeRouterLink>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">CV Analysis</span>
        </nav>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">AI workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">CV Analysis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Choose an uploaded CV, configure one AI evaluation or translation task, and review the saved result on a dedicated page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-teal)]"
              to="/ai/history"
            >
              View history
            </SafeRouterLink>
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]"
              to="/cv"
            >
              Manage CVs
              <ArrowRightIcon className="h-4 w-4" />
            </SafeRouterLink>
          </div>
        </section>
      </div>

      <AiRequestComposer
        initialAction={initialAction}
        initialCvId={initialCvId}
        onResultCreated={handleResultCreated}
      />
    </div>
  )
}

export function AiHistoryPage() {
  const [history, setHistory] = useState<AiHistoryItemViewModel[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    async function run() {
      try {
        const loaded = await loadAiResultHistory()
        if (active) {
          setHistory(loaded.items)
          setHistoryError(null)
        }
      } catch (error) {
        if (active) {
          setHistoryError(getAiApiErrorMessage(error, 'Unable to load recent AI results. Please try again.'))
        }
      } finally {
        if (active) {
          setLoadingHistory(false)
        }
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [reloadToken])

  const handleRetry = useCallback(() => {
    setLoadingHistory(true)
    setHistoryError(null)
    setReloadToken((value) => value + 1)
  }, [])

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <SafeRouterLink className="hover:text-[var(--color-teal)]" to="/profile">Profile</SafeRouterLink>
          <span aria-hidden="true">/</span>
          <SafeRouterLink className="hover:text-[var(--color-teal)]" to="/ai">CV Analysis</SafeRouterLink>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">History</span>
        </nav>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">CV Analysis</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">CV Analysis History</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Open completed, pending, or failed tasks at their permanent result link without starting a new request.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-4 text-sm font-semibold text-[var(--color-text-on-teal)] transition-colors hover:opacity-95"
              to="/ai"
            >
              Analyze a CV
              <ArrowRightIcon className="h-4 w-4" />
            </SafeRouterLink>
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-teal)]"
              to="/cv"
            >
              Manage CVs
            </SafeRouterLink>
          </div>
        </section>
      </div>

      <AiResultHistory
        error={historyError}
        items={history}
        loading={loadingHistory}
        onRetry={handleRetry}
      />
    </div>
  )
}

export function AiResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>()
  const [detailState, setDetailState] = useState<{
    key: string
    record: AiResultRecord | null
    item: AiHistoryItemViewModel | null
    sourceCvId: string | null
    error: string | null
    errorStatus?: number
  } | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const normalizedResultId = resultId?.trim() || ''
  const requestKey = `${normalizedResultId}:${reloadToken}`
  const detailLoading = Boolean(normalizedResultId) && detailState?.key !== requestKey

  useEffect(() => {
    if (!normalizedResultId) {
      return
    }

    let active = true

    async function run() {
      try {
        const loaded = await loadAiResultDetail(normalizedResultId)
        if (active) {
          setDetailState({
            key: requestKey,
            record: loaded.record,
            item: loaded.item,
            sourceCvId: loaded.sourceCvId,
            error: null,
            errorStatus: undefined,
          })
        }
      } catch (error) {
        if (active) {
          setDetailState({
            key: requestKey,
            record: null,
            item: null,
            sourceCvId: null,
            error: getAiResultDetailErrorMessage(error),
            errorStatus: getAiApiErrorStatus(error),
          })
        }
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [normalizedResultId, requestKey])

  const currentDetail = detailState?.key === requestKey ? detailState : null
  const detailError = !normalizedResultId
    ? 'This saved AI result does not exist or is no longer available.'
    : (currentDetail?.error ?? null)
  const detailErrorStatus = !normalizedResultId ? 404 : currentDetail?.errorStatus

  const handleRetry = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <SafeRouterLink className="hover:text-[var(--color-teal)]" to="/profile">Profile</SafeRouterLink>
          <span aria-hidden="true">/</span>
          <SafeRouterLink className="hover:text-[var(--color-teal)]" to="/ai">CV Analysis</SafeRouterLink>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">Result</span>
        </nav>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">CV Analysis</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">CV Analysis Result</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Review your evaluation breakdown, priority fixes, and recommended next actions. Refreshing this page loads the saved result without re-running AI.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-teal)]"
              to="/ai/history"
            >
              View history
            </SafeRouterLink>
            <SafeRouterLink
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-white)] px-4 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]"
              to="/ai"
            >
              Analyze another CV
              <ArrowRightIcon className="h-4 w-4" />
            </SafeRouterLink>
          </div>
        </section>
      </div>

      <AiResultHistoryDetail
        error={detailError}
        errorStatus={detailErrorStatus}
        item={currentDetail?.item ?? null}
        loading={detailLoading}
        onRetry={handleRetry}
        record={currentDetail?.record ?? null}
        sourceCvId={currentDetail?.sourceCvId ?? null}
      />
    </div>
  )
}
