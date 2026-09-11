import { httpClient } from '@/apis'
import {
  ADMIN_METRICS_OVERVIEW_PATH,
  parseAdminMetricsOverview,
  type AdminMetricsOverview,
} from './adminMetricsModel'

interface AdminMetricsApiResponse {
  success: boolean
  message: string
  data?: AdminMetricsOverview
}

export async function getAdminMetricsOverview() {
  const response = await httpClient.get<AdminMetricsApiResponse>(ADMIN_METRICS_OVERVIEW_PATH)

  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Unable to load admin metrics.')
  }

  return parseAdminMetricsOverview(response.data.data)
}

export function getAdminMetricsErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data

    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message
    }
  }

  return error instanceof Error && error.message
    ? error.message
    : 'Unable to load user metrics. Please try again.'
}
