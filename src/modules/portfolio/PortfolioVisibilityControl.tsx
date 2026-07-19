import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon, LinkIcon } from '@/components/ui/icons'
import { Notice, StatusBadge } from './PortfolioShared'

interface PortfolioVisibilityControlProps {
  isPublic: boolean
  publicUrl: string
  busy: boolean
  onChange: (isPublic: boolean) => void
}

function fallbackCopy(value: string) {
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.className = 'fixed left-[-9999px] top-0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('Copy command was rejected')
}

export function PortfolioVisibilityControl({
  isPublic,
  publicUrl,
  busy,
  onChange,
}: PortfolioVisibilityControlProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const copyPublicUrl = async () => {
    setCopyMessage(null)
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(publicUrl)
      else fallbackCopy(publicUrl)
      setCopyMessage('Public link copied to your clipboard.')
    } catch {
      setCopyMessage('Could not copy automatically. Select the link and copy it manually.')
    }
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]" aria-labelledby="portfolio-visibility-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[var(--color-navy)]" id="portfolio-visibility-title">Portfolio visibility</h2>
            <StatusBadge tone={isPublic ? 'success' : 'warning'}>{isPublic ? 'Public' : 'Private'}</StatusBadge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {isPublic
              ? 'Anyone with the public link can view published Portfolio content.'
              : 'Only you can view and manage this Portfolio.'}
          </p>
        </div>
        <Button
          aria-checked={isPublic}
          iconLeft={isPublic ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
          loading={busy}
          onClick={() => onChange(!isPublic)}
          role="switch"
          type="button"
          variant={isPublic ? 'secondary' : 'primary'}
        >
          {busy ? 'Saving' : isPublic ? 'Make private' : 'Make public'}
        </Button>
      </div>

      {isPublic ? (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Shareable URL</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <a
              className="min-w-0 flex-1 break-all rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm font-medium text-[var(--color-teal)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
              href={publicUrl}
              id="portfolio-public-url"
              rel="noreferrer"
              target="_blank"
            >
              {publicUrl}
            </a>
            <Button iconLeft={<LinkIcon className="h-4 w-4" />} onClick={() => void copyPublicUrl()} type="button" variant="outline">
              Copy link
            </Button>
          </div>
          {copyMessage ? <div className="mt-3" aria-live="polite"><Notice kind={copyMessage.startsWith('Public') ? 'success' : 'error'}>{copyMessage}</Notice></div> : null}
        </div>
      ) : null}
    </section>
  )
}
