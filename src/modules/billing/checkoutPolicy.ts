export function createCheckoutIdempotencyKey() {
  return crypto.randomUUID()
}

// A timeout or lost response is ambiguous: reuse the key so the backend can replay the same order.
export function shouldRetainCheckoutKey(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined
  return !['BILLING_CHECKOUT_RETRY_REQUIRED', 'IDEMPOTENCY_CONFLICT', 'INVALID_IDEMPOTENCY_KEY'].includes(code ?? '')
}
