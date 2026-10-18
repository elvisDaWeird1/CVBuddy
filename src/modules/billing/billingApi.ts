import axios from 'axios'
import { httpClient } from '@/apis'
import { BILLING_PATHS, parseBillingOrder, parseBillingOverview, parseUsageSummary } from './billingModel'
import { BillingApiError, type BillingOrder, type BillingOverview, type BillingPlanCode, type UsageSummary } from './billingTypes'

type ApiEnvelope = { success?: unknown; message?: unknown; code?: unknown; data?: unknown }

function apiError(error: unknown, fallback: string): BillingApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiEnvelope | undefined
    return new BillingApiError(typeof body?.code === 'string' ? body.code : undefined, typeof body?.message === 'string' ? body.message : fallback, error.response?.status)
  }
  return new BillingApiError(undefined, error instanceof Error ? error.message : fallback)
}

function dataFrom(response: ApiEnvelope, key: string) {
  if (!response.success || !response.data || typeof response.data !== 'object' || !(key in response.data)) throw new Error(typeof response.message === 'string' ? response.message : 'Unexpected server response')
  return (response.data as Record<string, unknown>)[key]
}

export async function getMyBilling(): Promise<BillingOverview> {
  try { const response = await httpClient.get<ApiEnvelope>(BILLING_PATHS.me); return parseBillingOverview(dataFrom(response.data, 'billing')) } catch (error) { throw apiError(error, 'Unable to load billing details.') }
}

export async function getMyUsage(): Promise<UsageSummary> {
  try { const response = await httpClient.get<ApiEnvelope>(BILLING_PATHS.usage); return parseUsageSummary(dataFrom(response.data, 'usage')) } catch (error) { throw apiError(error, 'Unable to load credit usage.') }
}

export async function getBillingOrder(orderId: string): Promise<BillingOrder> {
  try { const response = await httpClient.get<ApiEnvelope>(BILLING_PATHS.order(orderId)); return parseBillingOrder(dataFrom(response.data, 'order')) } catch (error) { throw apiError(error, 'Unable to load payment status.') }
}

export async function createCheckout(planCode: Extract<BillingPlanCode, 'PRO_30D'>, idempotencyKey: string): Promise<BillingOrder> {
  try {
    const response = await httpClient.post<ApiEnvelope>(BILLING_PATHS.checkout, { planCode }, { headers: { 'Idempotency-Key': idempotencyKey } })
    return parseBillingOrder(dataFrom(response.data, 'order'))
  } catch (error) { throw apiError(error, 'Unable to start checkout.') }
}

export function getBillingErrorMessage(error: unknown) {
  if (error instanceof BillingApiError) {
    if (error.code === 'BILLING_DISABLED') return 'Payments are not available yet. You can still view the current plans and credit costs.'
    if (error.code === 'BILLING_CHECKOUT_RETRY_REQUIRED') return 'That checkout is no longer available. Start a new checkout when you are ready.'
    return error.message
  }
  return 'Unable to complete that billing request. Please try again.'
}
