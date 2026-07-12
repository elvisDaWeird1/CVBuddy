import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CheckIcon, MapPinIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { PortfolioExperience, PortfolioMoment } from './portfolioTypes'
import { formatDateRange } from './portfolioFormat'

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10', className)}>{children}</div>
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-teal)]">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]',
    success: 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-text-primary)]',
    info: 'border-[var(--color-cyan)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]',
  }
  return <div className={cn('rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-medium', styles[kind])} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]"><span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-teal)] border-t-transparent align-[-2px]" />{label}</div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-white)] px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-teal)]"><CheckIcon className="h-6 w-6" /></div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'info' }) {
  const styles = {
    neutral: 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-text-primary)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-text-primary)]',
    info: 'bg-[var(--color-bg-soft)] text-[var(--color-teal)]',
  }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', styles[tone])}>{children}</span>
}

export function TagList({ items, empty = 'No items yet.' }: { items: string[]; empty?: string }) {
  if (!items.length) return <span className="text-sm text-[var(--color-text-muted)]">{empty}</span>
  return <div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full border border-[var(--color-cyan)] bg-[var(--color-bg-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-teal)]">{item}</span>)}</div>
}

export function MediaPreview({ moment, className }: { moment: Pick<PortfolioMoment, 'mediaAssets' | 'caption'>; className?: string }) {
  const first = moment.mediaAssets[0]
  if (!first) return <div className={cn('flex aspect-[4/3] items-center justify-center bg-[var(--color-gray-100)] text-sm text-[var(--color-text-muted)]', className)}>No media</div>
  if (first.assetType === 'video' || first.mimeType.startsWith('video/')) {
    return <video className={cn('aspect-[4/3] w-full object-cover', className)} src={first.secureUrl} controls preload="metadata" aria-label={moment.caption || 'Moment video'} />
  }
  return <img className={cn('aspect-[4/3] w-full object-cover', className)} src={first.secureUrl} alt={moment.caption || 'Portfolio moment'} />
}

export function ExperienceCard({ experience }: { experience: PortfolioExperience }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      {experience.coverAsset ? <img className="h-40 w-full object-cover" src={experience.coverAsset.secureUrl} alt={`${experience.title} cover`} /> : <div className="flex h-20 items-end bg-[var(--color-bg-soft)] px-5 pb-3 text-sm font-semibold text-[var(--color-teal)]">{experience.type}</div>}
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="font-semibold text-[var(--color-text-primary)]">{experience.title}</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{experience.role || experience.organization || 'Professional experience'}</p></div>
          <StatusBadge tone={experience.status === 'published' ? 'success' : experience.status === 'archived' ? 'neutral' : 'warning'}>{experience.status}</StatusBadge>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">{formatDateRange(experience)}</p>
        {experience.location && <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]"><MapPinIcon className="h-4 w-4 text-[var(--color-teal)]" />{experience.location}</p>}
        <TagList items={experience.skills} />
        <Link to={`/portfolio/experiences/${experience.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] hover:text-[var(--color-cyan)]">View experience <ArrowRightIcon className="h-4 w-4" /></Link>
      </div>
    </article>
  )
}

export function ConfirmButton({ label, message, onConfirm, loading = false, variant = 'danger' }: { label: string; message: string; onConfirm: () => void | Promise<void>; loading?: boolean; variant?: 'danger' | 'secondary' }) {
  return <Button type="button" variant={variant} loading={loading} onClick={() => { if (window.confirm(message)) void onConfirm() }}>{label}</Button>
}
