import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAdminMetricsErrorMessage, getAdminMetricsOverview } from './adminApi'
import {
  beginAdminMetricsLoad,
  initialAdminMetricsState,
  rejectAdminMetricsLoad,
  resolveAdminMetricsLoad,
  type AdminMetricsOverview,
  type AdminMetricsViewState,
} from './adminMetricsModel'

interface MetricCardProps {
  label: string
  value: number
  description: string
}

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <CardContent className="p-5 sm:p-6">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
        <p className="mt-3 text-3xl font-bold tabular-nums text-[var(--color-navy)]">{value.toLocaleString()}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
      </CardContent>
    </Card>
  )
}

function LoadingGrid() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => (
        <Card className="animate-pulse" key={index}>
          <CardContent className="p-5 sm:p-6">
            <div className="h-4 w-24 rounded bg-[var(--color-gray-200)]" />
            <div className="mt-4 h-9 w-16 rounded bg-[var(--color-gray-200)]" />
            <div className="mt-3 h-4 w-full rounded bg-[var(--color-gray-100)]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatGeneratedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function MetricsGrid({ metrics }: { metrics: AdminMetricsOverview }) {
  const cards = [
    { label: 'Applicants', value: metrics.applicants, description: 'Registered applicant accounts' },
    { label: 'Companies', value: metrics.companies, description: 'Registered company accounts' },
    { label: 'Active users', value: metrics.activeUsers, description: 'Accounts currently marked active' },
    { label: 'New users (7 days)', value: metrics.newUsersLast7Days, description: 'Accounts created in the last 7 days' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((metric) => <MetricCard key={metric.label} {...metric} />)}
    </div>
  )
}

interface AdminMetricsDashboardViewProps {
  state: AdminMetricsViewState
  onRefresh: () => void
}

export function AdminMetricsDashboardView({ state, onRefresh }: AdminMetricsDashboardViewProps) {
  const isLoading = state.status === 'loading'

  return (
    <main
      aria-busy={isLoading}
      aria-labelledby="admin-dashboard-title"
      className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-navy)] sm:text-4xl" id="admin-dashboard-title">User Overview</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            Monitor CVBuddy user accounts and activity. Total users excludes admin accounts.
          </p>
        </div>
        <Button loading={isLoading} onClick={onRefresh} type="button" variant="outline">
          {isLoading ? 'Refreshing' : 'Refresh metrics'}
        </Button>
      </div>

      <div aria-live="polite" className="mt-8">
        {isLoading && (
          <>
            <p className="sr-only">Loading admin user metrics.</p>
            <Card className="mb-4 animate-pulse overflow-hidden">
              <CardContent className="bg-[var(--color-bg-soft)] p-6 sm:p-8">
                <div className="h-4 w-32 rounded bg-[var(--color-gray-200)]" />
                <div className="mt-4 h-12 w-24 rounded bg-[var(--color-gray-200)]" />
              </CardContent>
            </Card>
            <LoadingGrid />
          </>
        )}

        {state.status === 'error' && (
          <Card className="border-[var(--color-error)]">
            <CardContent className="p-6 text-center sm:p-10">
              <h2 className="text-xl font-semibold text-[var(--color-navy)]">Metrics are unavailable</h2>
              <p className="mt-3 text-[var(--color-error)]" role="alert">{state.error}</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">No previously loaded totals are shown while the data may be out of date.</p>
              <Button className="mt-6" onClick={onRefresh} type="button">Try again</Button>
            </CardContent>
          </Card>
        )}

        {(state.status === 'ready' || state.status === 'empty') && (
          <>
            <div className="grid gap-4 xl:grid-cols-5">
              <Card className="overflow-hidden border-[var(--color-teal)] shadow-[var(--shadow-md)] xl:col-span-2">
                <CardContent className="flex h-full flex-col justify-between bg-[var(--color-bg-soft)] p-6 sm:p-8">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">Total users</p>
                    <p className="mt-2 text-5xl font-bold tabular-nums text-[var(--color-navy)]">{state.data.totalUsers.toLocaleString()}</p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Applicants and companies; admin accounts are excluded.</p>
                  </div>
                  <p className="mt-8 text-sm text-[var(--color-text-muted)]">
                    Updated <time dateTime={state.data.generatedAt}>{formatGeneratedAt(state.data.generatedAt)}</time>
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-2">
                <MetricsGrid metrics={state.data} />
              </div>
            </div>

            {state.status === 'empty' && (
              <Card className="mt-4 border-dashed">
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-[var(--color-navy)]">No users yet</h2>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">The metrics service is working, but there are no applicant or company accounts to count.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function Home() {
  const [state, setState] = useState(initialAdminMetricsState)
  const requestIdRef = useRef(0)

  const loadMetrics = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setState(beginAdminMetricsLoad())

    try {
      const metrics = await getAdminMetricsOverview()
      if (requestId === requestIdRef.current) setState(resolveAdminMetricsLoad(metrics))
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setState(rejectAdminMetricsLoad(getAdminMetricsErrorMessage(error)))
      }
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMetrics(), 0)

    return () => {
      window.clearTimeout(timer)
      requestIdRef.current += 1
    }
  }, [loadMetrics])

  return <AdminMetricsDashboardView onRefresh={() => void loadMetrics()} state={state} />
}
