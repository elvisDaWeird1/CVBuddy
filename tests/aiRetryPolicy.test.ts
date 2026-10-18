import assert from 'node:assert/strict'
import test from 'node:test'

import { canRetryAiRequest, shouldReuseAiIdempotencyKey } from '../src/modules/ai/aiRetryPolicy.ts'

test('transport timeout retains the original AI idempotency key', () => {
  const timeout = { status: 504, code: 'AI_SERVICE_TIMEOUT' }
  assert.equal(shouldReuseAiIdempotencyKey(timeout), true)
  assert.equal(canRetryAiRequest(timeout), true)
})

test('a refunded AI request starts a new idempotency key only when the user retries', () => {
  const refunded = { status: 409, code: 'IDEMPOTENCY_RETRY_REQUIRED' }
  assert.equal(shouldReuseAiIdempotencyKey(refunded), false)
  assert.equal(canRetryAiRequest(refunded), true)
})

test('payload mismatch has a specific retry policy and generic 409 is not a CV error policy', () => {
  const mismatch = { status: 409, code: 'IDEMPOTENCY_PAYLOAD_MISMATCH' }
  assert.equal(shouldReuseAiIdempotencyKey(mismatch), false)
  assert.equal(canRetryAiRequest(mismatch), true)
  assert.equal(canRetryAiRequest({ status: 409, code: 'USAGE_STATE_CONFLICT' }), false)
})

test('completed requests do not create retry work', () => {
  assert.equal(canRetryAiRequest(null), false)
  assert.equal(shouldReuseAiIdempotencyKey(null), false)
})
