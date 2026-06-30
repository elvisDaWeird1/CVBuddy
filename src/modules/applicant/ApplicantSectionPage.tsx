import { Link } from 'react-router-dom'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'

interface ApplicantSectionPageProps {
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

export function ApplicantSectionPage({
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
}: ApplicantSectionPageProps) {
  return (
    <ApplicantShell>
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[960px] items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-[var(--radius-xl)] bg-[var(--color-white)] p-8 shadow-[var(--shadow-lg)]">
          <p className="text-sm font-semibold uppercase tracking-normal text-[var(--color-teal)]">Applicant workspace</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-5 text-sm font-semibold text-[var(--color-text-on-teal)] transition-colors hover:brightness-95"
              to={primaryTo}
            >
              {primaryLabel}
            </Link>

            {secondaryLabel && secondaryTo ? (
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-soft)]"
                to={secondaryTo}
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </ApplicantShell>
  )
}