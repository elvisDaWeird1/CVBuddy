// This is the public Node API base, never the private FastAPI service root.
export function resolveApiBaseUrl(value?: string) {
  const base = value?.trim().replace(/\/+$/, '') || '/api'
  const url = new URL(base, 'http://frontend.local')
  if (
    (!base.startsWith('/') && !/^https?:\/\//.test(base)) ||
    base.startsWith('//') ||
    !url.pathname.endsWith('/api') || url.search || url.hash || url.username || url.password
  ) {
    throw new Error('VITE_API_URL must point to the Node backend API base ending in /api.')
  }
  return base
}
