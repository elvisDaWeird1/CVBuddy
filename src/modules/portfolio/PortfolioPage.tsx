import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditIcon, EyeIcon, LinkIcon, PlusIcon, UploadIcon } from '@/components/ui/icons'
import {
  getExperiences,
  getMoments,
  getPortfolio,
  getPortfolioErrorMessage,
  getPortfolioErrorStatus,
  publishPortfolio,
  unpublishPortfolio,
  updateFeaturedExperiences,
} from './portfolioApi'
import type { Portfolio, PortfolioExperience, PortfolioMoment } from './portfolioTypes'
import { ExperienceCard, EmptyState, LoadingState, MediaPreview, Notice, PageHeading, PageShell, StatusBadge, TagList } from './PortfolioShared'
import { formatDate } from './portfolioFormat'

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([])
  const [moments, setMoments] = useState<PortfolioMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>([])
  const [featureMessage, setFeatureMessage] = useState<string | null>(null)
  const [savingFeatured, setSavingFeatured] = useState(false)
  const [publishing, setPublishing] = useState(false)

  async function loadWorkspace(isActive: () => boolean) {
    setLoading(true)
    setErrorMessage(null)
    const results = await Promise.allSettled([
      getPortfolio(),
      getExperiences({ limit: 6 }),
      getMoments({ limit: 6 }),
    ])
    if (!isActive()) return
    const [portfolioResult, experiencesResult, momentsResult] = results
    if (portfolioResult.status === 'fulfilled') {
      setPortfolio(portfolioResult.value)
      setSelectedFeatured([...new Set(portfolioResult.value?.featuredExperienceIds ?? [])])
    } else if (getPortfolioErrorStatus(portfolioResult.reason) !== 404) {
      setErrorMessage(getPortfolioErrorMessage(portfolioResult.reason, 'Unable to load your portfolio.'))
    }
    if (experiencesResult.status === 'fulfilled') setExperiences(experiencesResult.value.items)
    else setErrorMessage(getPortfolioErrorMessage(experiencesResult.reason, 'Unable to load experiences.'))
    if (momentsResult.status === 'fulfilled') setMoments(momentsResult.value.items)
    else setErrorMessage(getPortfolioErrorMessage(momentsResult.reason, 'Unable to load moments.'))
    if (isActive()) setLoading(false)
  }

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => { void loadWorkspace(() => active) }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [])

  const featured = useMemo(() => {
    const byId = new Map(experiences.map((experience) => [experience.id, experience]))
    return selectedFeatured.map((id) => byId.get(id)).filter((experience): experience is PortfolioExperience => Boolean(experience))
  }, [experiences, selectedFeatured])

  const toggleFeatured = (id: string) => {
    setFeatureMessage(null)
    setSelectedFeatured((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 6) {
        setFeatureMessage('You can feature up to 6 experiences.')
        return current
      }
      return [...current, id]
    })
  }

  const moveFeatured = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= selectedFeatured.length) return
    setSelectedFeatured((current) => {
      const next = [...current]
      const [moved] = next.splice(index, 1)
      next.splice(nextIndex, 0, moved)
      return next
    })
  }

  const saveFeatured = async () => {
    if (savingFeatured) return
    setSavingFeatured(true)
    setFeatureMessage(null)
    try {
      const updated = await updateFeaturedExperiences([...new Set(selectedFeatured)])
      setPortfolio(updated ?? portfolio)
      setFeatureMessage('Featured experiences saved.')
    } catch (error) {
      setFeatureMessage(getPortfolioErrorMessage(error, 'Unable to save featured experiences.'))
    } finally {
      setSavingFeatured(false)
    }
  }

  const togglePublish = async () => {
    if (!portfolio || publishing) return
    if (!portfolio.slug) {
      setErrorMessage('Add a public slug before publishing your portfolio.')
      return
    }
    if (portfolio.isPublic && !window.confirm('Unpublish this portfolio? Its public URL will stop showing content, but your account data will remain.')) return
    setPublishing(true)
    setErrorMessage(null)
    try {
      const updated = portfolio.isPublic ? await unpublishPortfolio() : await publishPortfolio()
      setPortfolio(updated ?? portfolio)
    } catch (error) {
      setErrorMessage(getPortfolioErrorMessage(error, 'Unable to change portfolio visibility.'))
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <PageShell><LoadingState label="Loading your portfolio workspace…" /></PageShell>

  return (
    <PageShell>
      <PageHeading
        eyebrow="Professional presence"
        title="Portfolio workspace"
        description="Capture the work behind your career, shape it into experiences, and publish only what you want employers to see."
        actions={<>
          <Link to="/portfolio/moments/new"><Button variant="secondary" iconLeft={<UploadIcon className="h-4 w-4" />}>Add moment</Button></Link>
          <Link to="/portfolio/experiences/new"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>New experience</Button></Link>
        </>}
      />
      {errorMessage && <div className="mb-6"><Notice>{errorMessage}</Notice></div>}

      {!portfolio ? (
        <Card>
          <CardContent className="py-12"><EmptyState title="Create your portfolio profile" description="Start with a public-ready profile. You can keep it private while you build experiences and moments." action={<Link to="/portfolio/edit"><Button iconLeft={<EditIcon className="h-4 w-4" />}>Set up portfolio</Button></Link>} /></CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-navy)] text-[var(--color-text-on-navy)] shadow-[var(--shadow-lg)]">
            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center gap-2"><StatusBadge tone={portfolio.isPublic ? 'success' : 'warning'}>{portfolio.isPublic ? 'Public' : 'Private'}</StatusBadge><span className="text-sm text-white/70">Updated {formatDate(portfolio.updatedAt)}</span></div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">{portfolio.headline || 'Your professional story starts here.'}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-white/75">{portfolio.about || 'Add an introduction to help people understand your direction and strengths.'}</p>
                <p className="mt-4 text-sm text-white/70">{portfolio.desiredRole || 'Desired role not set'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/portfolio/edit"><Button variant="secondary" iconLeft={<EditIcon className="h-4 w-4" />}>Edit profile</Button></Link>
                {portfolio.isPublic && <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" iconLeft={<EyeIcon className="h-4 w-4" />}>View public</Button></a>}
                <Button variant={portfolio.isPublic ? 'danger' : 'cta'} loading={publishing} onClick={() => void togglePublish()}>{portfolio.isPublic ? 'Unpublish' : 'Publish portfolio'}</Button>
              </div>
            </div>
            <div className="grid gap-4 border-t border-white/15 px-6 py-5 text-sm sm:grid-cols-3 sm:px-8">
              <div><p className="text-white/55">Public URL</p>{portfolio.isPublic ? <a className="mt-1 block truncate font-medium text-white hover:text-[var(--color-cyan)]" href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">{window.location.origin}/p/{portfolio.slug}</a> : <p className="mt-1 text-white/80">Available after publishing</p>}</div>
              <div><p className="text-white/55">Experiences</p><p className="mt-1 font-semibold text-white">{experiences.length}</p></div>
              <div><p className="text-white/55">Moments</p><p className="mt-1 font-semibold text-white">{moments.length}</p></div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Featured experiences</CardTitle><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Choose up to 6 and use the arrows to control public order.</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">Public view only includes experiences that are published and have portfolio visibility.</p></div><StatusBadge tone="info">{selectedFeatured.length}/6 selected</StatusBadge></div></CardHeader>
              <CardContent className="space-y-4">
                {featureMessage && <Notice kind={featureMessage.includes('saved') ? 'success' : 'error'}>{featureMessage}</Notice>}
                {!experiences.length ? <EmptyState title="No experiences yet" description="Create an experience before choosing featured work." action={<Link to="/portfolio/experiences/new"><Button size="sm">Create experience</Button></Link>} /> : <>
                  <div className="space-y-2">{experiences.map((experience) => <label key={experience.id} className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-teal)]"><input type="checkbox" checked={selectedFeatured.includes(experience.id)} onChange={() => toggleFeatured(experience.id)} className="mt-1 h-4 w-4 accent-[var(--color-teal)]" /><span className="min-w-0 flex-1"><span className="block font-semibold text-[var(--color-text-primary)]">{experience.title}</span><span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">{experience.status} · {experience.visibility}</span></span></label>)}</div>
                  <Button size="sm" loading={savingFeatured} onClick={() => void saveFeatured()}>Save featured order</Button>
                  {featured.length > 0 && <div className="border-t border-[var(--color-border)] pt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Current order</p><div className="space-y-2">{featured.map((experience, index) => <div key={experience.id} className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-gray-50)] px-3 py-2 text-sm"><span className="w-5 text-xs text-[var(--color-text-muted)]">{index + 1}</span><span className="min-w-0 flex-1 truncate font-medium">{experience.title}</span><button type="button" className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)] disabled:opacity-40" disabled={index === 0} onClick={() => moveFeatured(index, -1)} aria-label={`Move ${experience.title} up`}>↑</button><button type="button" className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)] disabled:opacity-40" disabled={index === featured.length - 1} onClick={() => moveFeatured(index, 1)} aria-label={`Move ${experience.title} down`}>↓</button></div>)}</div></div>}
                </>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Skills & links</CardTitle></CardHeader>
              <CardContent className="space-y-5"><TagList items={portfolio.skills} empty="Add skills to make your direction clearer." /><div className="space-y-2">{Object.entries(portfolio.socialLinks).length ? Object.entries(portfolio.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-[var(--color-teal)] hover:text-[var(--color-cyan)]"><LinkIcon className="h-4 w-4" />{platform}</a>) : <p className="text-sm text-[var(--color-text-secondary)]">No social links added yet.</p>}</div></CardContent>
            </Card>
          </div>

          <section><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Recent experiences</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Build a clear record of the work you want to carry forward.</p></div><Link className="text-sm font-semibold text-[var(--color-teal)]" to="/portfolio/experiences">See all</Link></div>{experiences.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{experiences.slice(0, 3).map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}</div> : <EmptyState title="Your experience timeline is empty" description="Add a project, role, event, or learning experience to make your portfolio useful." action={<Link to="/portfolio/experiences/new"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>Add experience</Button></Link>} />}</section>

          <section><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Recent moments</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Small proof points become stronger when connected to an experience.</p></div><Link className="text-sm font-semibold text-[var(--color-teal)]" to="/portfolio/moments">See all</Link></div>{moments.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{moments.slice(0, 3).map((moment) => <Link key={moment.id} to={`/portfolio/moments/${moment.id}`} className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"><MediaPreview moment={moment} /><div className="p-4"><p className="font-medium text-[var(--color-text-primary)]">{moment.caption || 'Untitled moment'}</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{formatDate(moment.capturedAt)}</p><TagList items={moment.skills} empty="No skills tagged" /></div></Link>)}</div> : <EmptyState title="No moments captured yet" description="Upload a photo or video from your phone or computer. Camera access is optional." action={<Link to="/portfolio/moments/new"><Button iconLeft={<UploadIcon className="h-4 w-4" />}>Capture a moment</Button></Link>} />}</section>
        </div>
      )}
    </PageShell>
  )
}
