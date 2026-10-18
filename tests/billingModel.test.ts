import assert from 'node:assert/strict'
import test from 'node:test'
import { isSafeCheckoutUrl, isSafeInternalPath, isValidOrderId, parseBillingOrder, parseBillingOverview } from '../src/modules/billing/billingModel.ts'
import { BILLING_POLL_MAX_ATTEMPTS, isTerminalBillingStatus, nextBillingPollDelay } from '../src/modules/billing/billingPolling.ts'
import { shouldRetainCheckoutKey } from '../src/modules/billing/checkoutPolicy.ts'
import { BillingApiError } from '../src/modules/billing/billingTypes.ts'

const overview = {
  enabled: false,
  catalogVersion: '2026-10-17-draft',
  plans: {
    FREE: { code: 'FREE', creditsGranted: 4, durationDays: null, priceVnd: 0 },
    PRO_30D: { code: 'PRO_30D', creditsGranted: 60, durationDays: 30, priceVnd: 79000 },
  },
  featureCosts: { CV_EVALUATION: 2, CV_TRANSLATION: 2, TRANSLATE_AND_EVALUATE: 4, TARGETED_REVIEW: 3 },
  entitlement: { planCode: 'FREE', creditsGranted: 4, creditsConsumed: 0, creditsRemaining: 4 },
  orders: [],
}

test('parses the server-owned billing projection without client-owned values', () => {
  const result = parseBillingOverview(overview)
  assert.equal(result.enabled, false)
  assert.equal(result.plans.PRO_30D.priceVnd, 79000)
  assert.equal(result.featureCosts.CV_TRANSLATION, 2)
})

test('rejects malformed billing plan and order status payloads', () => {
  assert.throws(() => parseBillingOverview({ ...overview, plans: { ...overview.plans, FREE: { ...overview.plans.FREE, priceVnd: '0' } } }))
  assert.throws(() => parseBillingOrder({ id: 'order', planCode: 'PRO_30D', amountVnd: 1, status: 'PAID_FROM_QUERY' }))
})

test('only accepts HTTPS checkout links and Mongo-like order identifiers', () => {
  assert.equal(isSafeCheckoutUrl('https://checkout.example/pay'), true)
  assert.equal(isSafeCheckoutUrl('http://checkout.example/pay'), false)
  assert.equal(isSafeCheckoutUrl('javascript:alert(1)'), false)
  assert.equal(isValidOrderId('0123456789abcdef01234567'), true)
  assert.equal(isValidOrderId('PAID'), false)
})

test('allows only application-relative return paths', () => {
  assert.equal(isSafeInternalPath('/ai-chat'), true)
  assert.equal(isSafeInternalPath('https://attacker.example'), false)
  assert.equal(isSafeInternalPath('//attacker.example'), false)
})

test('polling stops for terminal statuses and is bounded', () => {
  assert.equal(isTerminalBillingStatus('PENDING'), false)
  assert.equal(isTerminalBillingStatus('PAID'), true)
  assert.equal(nextBillingPollDelay(0), 1000)
  assert.equal(nextBillingPollDelay(100), 12000)
  assert.equal(BILLING_POLL_MAX_ATTEMPTS, 6)
})

test('uncertain checkout transport errors retain a key while terminal retry errors require a new one', () => {
  assert.equal(shouldRetainCheckoutKey(new Error('timeout')), true)
  assert.equal(shouldRetainCheckoutKey(new BillingApiError('BILLING_CHECKOUT_RETRY_REQUIRED', 'expired', 409)), false)
})
