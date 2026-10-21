import type { BillingOrder, BillingOverview, BillingPlan, BillingPlanCode, EntitlementSummary, FeatureCosts, UsageSummary } from './billingTypes'

export const BILLING_PATHS = {
  me: '/billing/me',
  usage: '/usage/me',
  checkout: '/billing/checkout',
  order: (orderId: string) => `/billing/orders/${encodeURIComponent(orderId)}`,
} as const

const planCodes: BillingPlanCode[] = ['FREE', 'PRO_30D']
const orderStatuses = new Set(['PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function string(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid billing response: ${label}`)
  return value
}

function number(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid billing response: ${label}`)
  return value
}

function nullableDate(value: unknown) {
  return typeof value === 'string' ? value : null
}

function parseFeatureCosts(value: unknown): FeatureCosts {
  if (!isRecord(value)) throw new Error('Invalid billing response: feature costs')
  return {
    CV_EVALUATION: number(value.CV_EVALUATION, 'CV_EVALUATION'),
    CV_TRANSLATION: number(value.CV_TRANSLATION, 'CV_TRANSLATION'),
    TRANSLATE_AND_EVALUATE: number(value.TRANSLATE_AND_EVALUATE, 'TRANSLATE_AND_EVALUATE'),
    TARGETED_REVIEW: number(value.TARGETED_REVIEW, 'TARGETED_REVIEW'),
  }
}

function parseEntitlement(value: unknown): EntitlementSummary {
  if (!isRecord(value)) throw new Error('Invalid billing response: entitlement')
  const planCode = string(value.planCode, 'entitlement plan') as BillingPlanCode
  if (!planCodes.includes(planCode)) throw new Error('Invalid billing response: entitlement plan')
  return {
    planCode,
    creditsGranted: number(value.creditsGranted, 'credits granted'),
    creditsConsumed: number(value.creditsConsumed, 'credits consumed'),
    creditsRemaining: number(value.creditsRemaining, 'credits remaining'),
    startsAt: nullableDate(value.startsAt),
    endsAt: nullableDate(value.endsAt),
  }
}

function parsePlan(value: unknown, code: BillingPlanCode): BillingPlan {
  if (!isRecord(value)) throw new Error(`Invalid billing response: ${code} plan`)
  if (value.code !== code) throw new Error(`Invalid billing response: ${code} code`)
  return {
    code,
    creditsGranted: number(value.creditsGranted, `${code} credits`),
    durationDays: value.durationDays === null ? null : number(value.durationDays, `${code} duration`),
    priceVnd: number(value.priceVnd, `${code} price`),
  }
}

export function parseBillingOrder(value: unknown): BillingOrder {
  if (!isRecord(value)) throw new Error('Invalid billing response: order')
  const status = string(value.status, 'order status')
  if (!orderStatuses.has(status)) throw new Error('Invalid billing response: order status')
  const planCode = string(value.planCode, 'order plan') as BillingPlanCode
  if (!planCodes.includes(planCode)) throw new Error('Invalid billing response: order plan')
  return {
    id: string(value.id, 'order id'),
    planCode,
    amountVnd: number(value.amountVnd, 'order amount'),
    status: status as BillingOrder['status'],
    checkoutUrl: typeof value.checkoutUrl === 'string' ? value.checkoutUrl : null,
    expiresAt: nullableDate(value.expiresAt), expiredAt: nullableDate(value.expiredAt),
    paidAt: nullableDate(value.paidAt), createdAt: nullableDate(value.createdAt), updatedAt: nullableDate(value.updatedAt),
  }
}

export function parseBillingOverview(value: unknown): BillingOverview {
  if (!isRecord(value) || !isRecord(value.plans) || !Array.isArray(value.orders)) throw new Error('Invalid billing response')
  return {
    enabled: value.enabled === true,
    catalogVersion: string(value.catalogVersion, 'catalog version'),
    plans: { FREE: parsePlan(value.plans.FREE, 'FREE'), PRO_30D: parsePlan(value.plans.PRO_30D, 'PRO_30D') },
    featureCosts: parseFeatureCosts(value.featureCosts),
    entitlement: parseEntitlement(value.entitlement),
    orders: value.orders.map(parseBillingOrder),
  }
}

export function parseUsageSummary(value: unknown): UsageSummary {
  const entitlement = parseEntitlement(value)
  if (!isRecord(value)) throw new Error('Invalid usage response')
  return { ...entitlement, featureCosts: parseFeatureCosts(value.featureCosts) }
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(value?: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Not available'
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

export function isSafeCheckoutUrl(value: string | null) {
  if (!value) return false
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export function isValidOrderId(value: string | null) {
  return Boolean(value && /^[a-fA-F0-9]{24}$/.test(value))
}

export function isSafeInternalPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//') && !value.includes('://'))
}
