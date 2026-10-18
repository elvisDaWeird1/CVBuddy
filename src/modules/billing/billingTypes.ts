export type BillingPlanCode = 'FREE' | 'PRO_30D'
export type BillingOrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'FAILED'

export interface BillingPlan {
  code: BillingPlanCode
  creditsGranted: number
  durationDays: number | null
  priceVnd: number
}

export interface FeatureCosts {
  CV_EVALUATION: number
  CV_TRANSLATION: number
  TRANSLATE_AND_EVALUATE: number
  TARGETED_REVIEW: number
}

export interface EntitlementSummary {
  planCode: BillingPlanCode
  creditsGranted: number
  creditsConsumed: number
  creditsRemaining: number
  startsAt?: string | null
  endsAt?: string | null
}

export interface BillingOrder {
  id: string
  planCode: BillingPlanCode
  amountVnd: number
  status: BillingOrderStatus
  checkoutUrl: string | null
  expiresAt?: string | null
  expiredAt?: string | null
  paidAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface BillingOverview {
  enabled: boolean
  catalogVersion: string
  plans: Record<BillingPlanCode, BillingPlan>
  featureCosts: FeatureCosts
  entitlement: EntitlementSummary
  orders: BillingOrder[]
}

export interface UsageSummary extends EntitlementSummary {
  featureCosts: FeatureCosts
}

export class BillingApiError extends Error {
  readonly code: string | undefined
  readonly status: number | undefined

  constructor(code: string | undefined, message: string, status?: number) {
    super(message)
    this.name = 'BillingApiError'
    this.code = code
    this.status = status
  }
}
