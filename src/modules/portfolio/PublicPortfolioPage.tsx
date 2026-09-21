import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BriefcaseIcon, LinkIcon } from '@/components/ui/icons'
import { getPublicPortfolio, getPortfolioErrorMessage, getPortfolioErrorStatus } from './portfolioApi'
import { PortfolioGallery } from './PortfolioGallery'
import { getPortfolioGalleryImages } from './portfolioGalleryModel'
import type { PublicPortfolioResponse } from './portfolioTypes'
import { EmptyState, LoadingState, PageShell, TagList } from './PortfolioShared'
import { formatDateRange } from './portfolioFormat'

export default function PublicPortfolioPage() {
  const { slug } = useParams()
  const [data, setData] = useState<PublicPortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setData(null)
      setError(null)

      if (!slug) {
        setError('This Portfolio link is incomplete.')
        setLoading(false)
        return
      }

      void getPublicPortfolio(slug)
        .then((result) => {
          if (active) setData(result ?? null)
        })
        .catch((loadError) => {
          if (!active) return
          setError(getPortfolioErrorStatus(loadError) === 404
            ? 'This Portfolio does not exist or is currently private.'
            : getPortfolioErrorMessage(loadError, 'Unable to load this Portfolio.'))
        })
        .finally(() => { if (active) setLoading(false) })
    }, 0)

    return () => { active = false; window.clearTimeout(timer) }
  }, [slug])

  const images = useMemo(() => getPortfolioGalleryImages(data?.moments ?? []), [data?.moments])

  if (loading) return <PageShell><LoadingState label="Loading public Portfolio..." /></PageShell>

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-main)]">
        <PageShell className="max-w-[900px]">
          <Link className="text-sm font-bold text-[var(--color-teal)] hover:underline" to="/">CVBuddy</Link>
          <div className="mt-10">
            <EmptyState
              action={<Link className="text-sm font-semibold text-[var(--color-teal)] hover:underline" to="/">Return to CVBuddy</Link>}
              description={error || 'The requested Portfolio is unavailable.'}
              title="Portfolio unavailable"
            />
          </div>
        </PageShell>
      </main>
    )
  }

  const { portfolio, experiences, moments } = data
  const title = portfolio.headline || portfolio.title || 'Professional Portfolio'
  const description = portfolio.about || portfolio.description
  const socialLinks = Object.entries(portfolio.socialLinks ?? {})

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)]">
      <PageShell>
        <header className="mb-10 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <Link className="text-lg font-bold text-[var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]" to="/">CVBuddy</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Public Portfolio</span>
        </header>

        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-8 shadow-[var(--shadow-sm)] sm:px-8 sm:py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">Selected work</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-5xl">{title}</h1>
            {portfolio.desiredRole ? <p className="mt-3 text-lg font-medium text-[var(--color-teal)]">{portfolio.desiredRole}</p> : null}
            {description ? <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-7 text-[var(--color-text-secondary)]">{description}</p> : null}
            {portfolio.skills?.length ? <div className="mt-6"><TagList items={portfolio.skills} /></div> : null}
            {socialLinks.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map(([platform, url]) => (
                  <a
                    className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-teal)] hover:border-[var(--color-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
                    href={url}
                    key={platform}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon className="h-4 w-4" /> {platform}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="public-gallery-title">
          <div className="mb-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Gallery</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-navy)] sm:text-3xl" id="public-gallery-title">Portfolio images</h2>
          </div>
          {images.length ? (
            <PortfolioGallery moments={moments} />
          ) : (
            <EmptyState
              description="This public Portfolio has no published images yet."
              title="No public images"
            />
          )}
        </section>

        {experiences.length ? (
          <section className="mt-14" aria-labelledby="public-experiences-title">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-teal)]"><BriefcaseIcon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Background</p>
                <h2 className="text-2xl font-bold text-[var(--color-navy)]" id="public-experiences-title">Published experience</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {experiences.map((experience) => (
                <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]" key={experience.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">{experience.type}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--color-navy)]">{experience.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{experience.role || experience.organization || 'Professional experience'}</p>
                  <p className="mt-3 text-sm text-[var(--color-text-muted)]">{formatDateRange(experience)}</p>
                  {experience.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">{experience.description}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </PageShell>
    </main>
  )
}
