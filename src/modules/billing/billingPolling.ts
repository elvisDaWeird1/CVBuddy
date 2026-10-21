import type { BillingOrder } from './billingTypes'

export const BILLING_POLL_MAX_ATTEMPTS = 6
export const BILLING_POLL_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 12_000] as const

export function isTerminalBillingStatus(status: BillingOrder['status']) { return status !== 'PENDING' }
export function nextBillingPollDelay(attempt: number) { return BILLING_POLL_DELAYS_MS[Math.min(Math.max(attempt, 0), BILLING_POLL_DELAYS_MS.length - 1)] }
