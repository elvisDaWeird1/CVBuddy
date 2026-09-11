export const ADMIN_METRICS_OVERVIEW_PATH = '/admin/metrics/overview'

export interface AdminMetricsOverview {
  totalUsers: number
  applicants: number
  companies: number
  activeUsers: number
  newUsersLast7Days: number
  generatedAt: string
}

export type AdminMetricsViewState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready' | 'empty'; data: AdminMetricsOverview; error: null }
  | { status: 'error'; data: null; error: string }

export const initialAdminMetricsState: AdminMetricsViewState = {
  status: 'loading',
  data: null,
  error: null,
}

function readCount(source: Record<string, unknown>, key: keyof AdminMetricsOverview) {
  const value = source[key]

  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Invalid admin metric: ${key}`)
  }

  return value as number
}

export function parseAdminMetricsOverview(value: unknown): AdminMetricsOverview {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid admin metrics response')
  }

  const source = value as Record<string, unknown>
  const generatedAt = source.generatedAt

  if (typeof generatedAt !== 'string' || Number.isNaN(Date.parse(generatedAt))) {
    throw new Error('Invalid admin metric: generatedAt')
  }

  const metrics = {
    totalUsers: readCount(source, 'totalUsers'),
    applicants: readCount(source, 'applicants'),
    companies: readCount(source, 'companies'),
    activeUsers: readCount(source, 'activeUsers'),
    newUsersLast7Days: readCount(source, 'newUsersLast7Days'),
    generatedAt,
  }

  if (
    metrics.totalUsers !== metrics.applicants + metrics.companies
    || metrics.activeUsers > metrics.totalUsers
    || metrics.newUsersLast7Days > metrics.totalUsers
  ) {
    throw new Error('Inconsistent admin metrics response')
  }

  return metrics
}

export function beginAdminMetricsLoad(): AdminMetricsViewState {
  return initialAdminMetricsState
}

export function resolveAdminMetricsLoad(data: AdminMetricsOverview): AdminMetricsViewState {
  return {
    status: data.totalUsers === 0 ? 'empty' : 'ready',
    data,
    error: null,
  }
}

export function rejectAdminMetricsLoad(message: string): AdminMetricsViewState {
  return {
    status: 'error',
    data: null,
    error: message,
  }
}
