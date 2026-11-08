import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { getMyCvs, type CvDocument } from '@/modules/applicant/cvApi'
import {
  getAiApiErrorMessage,
  getAiApiErrorStatus,
  getAiResults,
  type AiResultRecord,
} from './aiApi'
import {
  adaptAiHistory,
  getAiResultDetailErrorMessage,
  getAiResultRoute,
  isCvAvailable,
  loadAiResultDetail,
  readResultId,
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
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [historyRecords, setHistoryRecords] = useState<AiResultRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    setHistoryError(null)

    try {
      const [records, nextCvs] = await Promise.all([
        getAiResults(),
        getMyCvs().catch((): CvDocument[] => []),
      ])
      setHistoryRecords(records)
      setCvs(nextCvs)
    } catch (error) {
      setHistoryError(getAiApiErrorMessage(error, 'Unable to load recent AI results. Please try again.'))
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function run() {
      setLoadingHistory(true)
      setHistoryError(null)

      try {
        const [records, nextCvs] = await Promise.all([
          getAiResults(),
          getMyCvs().catch((): CvDocument[] => []),
        ])
        if (active) {
          setHistoryRecords(records)
          setCvs(nextCvs)
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
  }, [])

  const history = useMemo(() => adaptAiHistory(historyRecords, cvs), [historyRecords, cvs])

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
        onRetry={() => void loadHistory()}
      />
    </div>
  )
}

export function AiResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>()
  const [detailRecord, setDetailRecord] = useState<AiResultRecord | null>(null)
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailErrorStatus, setDetailErrorStatus] = useState<number | undefined>(undefined)

  const fetchDetail = useCallback(async (targetId: string | undefined) => {
    if (!targetId || !targetId.trim()) {
      setDetailRecord(null)
      setDetailError('This saved AI result does not exist or is no longer available.')
      setDetailErrorStatus(404)
      setDetailLoading(false)
      return
    }

    setDetailLoading(true)
    setDetailError(null)
    setDetailErrorStatus(undefined)

    try {
      const loaded = await loadAiResultDetail(targetId)
      setDetailRecord(loaded.record)
      setCvs(loaded.cvs)
    } catch (error) {
      setDetailRecord(null)
      setDetailErrorStatus(getAiApiErrorStatus(error))
      setDetailError(getAiResultDetailErrorMessage(error))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function run() {
      if (!resultId || !resultId.trim()) {
        if (active) {
          setDetailRecord(null)
          setDetailError('This saved AI result does not exist or is no longer available.')
          setDetailErrorStatus(404)
          setDetailLoading(false)
        }
        return
      }

      setDetailLoading(true)
      setDetailError(null)
      setDetailErrorStatus(undefined)

      try {
        const loaded = await loadAiResultDetail(resultId)
        if (active) {
          setDetailRecord(loaded.record)
          setCvs(loaded.cvs)
        }
      } catch (error) {
        if (active) {
          setDetailRecord(null)
          setDetailErrorStatus(getAiApiErrorStatus(error))
          setDetailError(getAiResultDetailErrorMessage(error))
        }
      } finally {
        if (active) {
          setDetailLoading(false)
        }
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [resultId])

  const historyItem = useMemo(
    () => (detailRecord ? adaptAiHistory([detailRecord], cvs)[0] ?? null : null),
    [detailRecord, cvs],
  )
  const availableSourceCvId = useMemo(() => {
    if (!historyItem?.cvId) return null
    const matched = cvs.find((cv) => cv.id === historyItem.cvId && isCvAvailable(cv))
    return matched ? matched.id : null
  }, [cvs, historyItem])

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
        item={historyItem}
        loading={detailLoading}
        onRetry={() => void fetchDetail(resultId)}
        record={detailRecord}
        sourceCvId={availableSourceCvId}
      />
    </div>
  )
}
