import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRightIcon, CameraIcon, MapPinIcon } from '@/components/ui/icons'
import { getPublicPortfolio, getPortfolioErrorMessage, getPortfolioErrorStatus } from './portfolioApi'
import type { PublicPortfolioResponse } from './portfolioTypes'
import { EmptyState, LoadingState, PageShell, TagList } from './PortfolioShared'
import { formatDate } from './portfolioFormat'

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
        setLoading(false)
        return
      }
      void getPublicPortfolio(slug)
        .then((result) => {
          if (active && result) setData(result)
        })
        .catch((loadError) => {
          if (!active) return
          setError(getPortfolioErrorStatus(loadError) === 404
            ? 'This portfolio is private or no longer exists.'
            : getPortfolioErrorMessage(loadError, 'Unable to load this portfolio.'))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [slug])

  if (loading) return <main className="min-h-screen bg-[var(--color-bg-main)] py-12"><PageShell><LoadingState label="Loading public portfolio..." /></PageShell></main>
  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-main)] py-12">
        <PageShell>
          <EmptyState
            action={<Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]" to="/">Back to CVBuddy <ArrowRightIcon className="h-4 w-4" /></Link>}
            description={error || 'This portfolio could not be found.'}
            title="Portfolio unavailable"
          />
        </PageShell>
      </main>
    )
  }

  const { portfolio } = data
  const experiences = data.experiences ?? []
  const moments = data.moments ?? []
  const title = portfolio.title || portfolio.headline || 'Professional Portfolio'
  const description = portfolio.description || portfolio.about || 'A collection of real work, projects, and experiences.'

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-white)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="text-lg font-bold text-[var(--color-teal)]" to="/">CVBuddy</Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Public portfolio</span>
        </div>
      </header>
      <PageShell>
        <section className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-navy)] text-white shadow-[var(--shadow-lg)]">
          {portfolio.coverImageUrl ? <img alt="" className="h-64 w-full object-cover opacity-80" src={portfolio.coverImageUrl} /> : null}
          <div className="p-7 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">{portfolio.desiredRole || 'Selected work'}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-white/75">{description}</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Moments</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Visual proof from projects, events, and creative work.</p>
          {moments.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moments.map((moment) => {
                const imageUrl = moment.imageUrl || moment.mediaAssets?.[0]?.secureUrl
                return (
                  <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]" key={moment.id}>
                    {imageUrl ? <img alt={moment.caption || 'Portfolio moment'} className="aspect-[4/3] w-full object-cover" loading="lazy" src={imageUrl} /> : <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-bg-soft)]"><CameraIcon className="h-9 w-9 text-[var(--color-teal)]" /></div>}
                    <div className="p-4">
                      <p className="font-medium">{moment.caption || 'Portfolio moment'}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{formatDate(moment.capturedAt)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : <div className="mt-5"><EmptyState title="No public moments" description="Public moments will appear here when they are ready." /></div>}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Experiences</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Published experiences connected to this portfolio.</p>
          {experiences.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {experiences.map((experience) => (
                <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]" key={experience.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">{experience.type}</p>
                  <h3 className="mt-2 text-xl font-semibold">{experience.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{experience.role || experience.organization || 'Professional experience'}</p>
                  {experience.location ? <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]"><MapPinIcon className="h-4 w-4 text-[var(--color-teal)]" />{experience.location}</p> : null}
                  {experience.description ? <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{experience.description}</p> : null}
                  <TagList items={experience.skills || []} />
                </article>
              ))}
            </div>
          ) : <div className="mt-5"><EmptyState title="No public experiences" description="There are no public experience chapters to show yet." /></div>}
        </section>
      </PageShell>
    </main>
  )
}
