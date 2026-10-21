export type AiRetryError = {
  status?: number
  code?: string
}

const NEW_KEY_CODES = new Set([
  'IDEMPOTENCY_RETRY_REQUIRED',
  'IDEMPOTENCY_PAYLOAD_MISMATCH',
])

export function shouldReuseAiIdempotencyKey(error?: AiRetryError | null) {
  return Boolean(error) && !NEW_KEY_CODES.has(error?.code || '')
}

export function canRetryAiRequest(error?: AiRetryError | null) {
  if (!error) return false
  if (NEW_KEY_CODES.has(error.code || '') || error.code === 'AI_REQUEST_IN_PROGRESS') return true
  return !error.status || error.status === 408 || error.status === 429 || error.status >= 500
}
