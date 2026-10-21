import { Link } from 'react-router-dom'
import { isSafeInternalPath } from '../billingModel'

export function UpgradePrompt({ returnTo }: { returnTo?: string }) {
  const safeReturnTo = returnTo && isSafeInternalPath(returnTo) ? returnTo : '/pricing'
  return <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4" aria-label="Upgrade options"><p className="font-semibold">Need more credits?</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Compare the current server-provided plans and feature costs.</p><Link className="mt-3 inline-flex h-8 items-center rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-3 text-sm font-medium text-[var(--color-text-on-teal)]" to={safeReturnTo}>View plans</Link></aside>
}
