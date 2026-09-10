import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EditIcon, PlusIcon, UploadIcon } from '@/components/ui/icons'
import { PortfolioGallery } from './PortfolioGallery'
import { PortfolioVisibilityControl } from './PortfolioVisibilityControl'
import { getPortfolioGalleryImages } from './portfolioGalleryModel'
import { EmptyState, LoadingState, Notice, PageHeading, PageShell, TagList } from './PortfolioShared'
import { usePortfolioWorkspace } from './usePortfolioWorkspace'

export default function PortfolioPage() {
  const {
    portfolio,
    moments,
    loading,
    galleryLoading,
    pageError,
    galleryError,
    notice,
    visibilityBusy,
    deletingMomentId,
    load,
    changeVisibility,
    removeMoment,
  } = usePortfolioWorkspace()
  const images = useMemo(() => getPortfolioGalleryImages(moments), [moments])

  if (loading) {
    return <PageShell><LoadingState label="Loading your Portfolio..." /></PageShell>
  }

  if (pageError) {
    return (
      <PageShell>
        <PageHeading eyebrow="Portfolio workspace" title="My Portfolio" description="Manage the single Portfolio connected to your applicant account." />
        <Notice>{pageError}</Notice>
        <div className="mt-4"><Button onClick={() => void load()} type="button" variant="secondary">Try again</Button></div>
      </PageShell>
    )
  }

  if (!portfolio) {
    return (
      <PageShell>
        <PageHeading eyebrow="Portfolio workspace" title="My Portfolio" description="Create one focused Portfolio to present your work, images, and experience." />
        <EmptyState
          action={<Link to="/portfolio/edit"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>Create Portfolio</Button></Link>}
          description="You have not created your Portfolio yet. Start with a profile and a shareable URL; it stays private until you publish it."
          title="Your Portfolio is ready to begin"
        />
      </PageShell>
    )
  }

  const publicUrl = `${window.location.origin}/p/${portfolio.slug}`
  const title = portfolio.headline || portfolio.desiredRole || 'My Portfolio'

  const requestDelete = (momentId: string) => {
    const moment = moments.find((item) => item.id === momentId)
    const imageCount = Math.max(1, moment?.mediaAssets.length ?? 0)
    const message = imageCount > 1
      ? `Delete this moment and all ${imageCount} attached media files? This cannot be undone.`
      : 'Delete this image moment? This cannot be undone.'
    if (window.confirm(message)) void removeMoment(momentId)
  }

  return (
    <PageShell>
      <PageHeading
        actions={(
          <>
            <Link to="/portfolio/edit"><Button iconLeft={<EditIcon className="h-4 w-4" />} variant="secondary">Edit profile</Button></Link>
            <Link to="/portfolio/moments/new"><Button iconLeft={<UploadIcon className="h-4 w-4" />}>Add images</Button></Link>
          </>
        )}
        description={portfolio.about || 'A single place to curate the work and visual proof you want to share.'}
        eyebrow="Portfolio workspace"
        title={title}
      />

      {portfolio.skills.length ? <div className="mb-6"><TagList items={portfolio.skills} /></div> : null}
      {notice ? <div className="mb-6"><Notice kind={notice.kind}>{notice.text}</Notice></div> : null}

      <PortfolioVisibilityControl
        busy={visibilityBusy}
        isPublic={portfolio.isPublic}
        onChange={(next) => void changeVisibility(next)}
        publicUrl={publicUrl}
      />

      <section className="mt-10" aria-labelledby="portfolio-gallery-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Visual work</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-navy)]" id="portfolio-gallery-title">Portfolio images</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {images.length
                ? `${images.length} image${images.length === 1 ? '' : 's'} shown directly. Owner-only badges mark media that is not ready for public viewing.`
                : 'Add images to make your work visible at a glance.'}
            </p>
          </div>
          <Link className="text-sm font-semibold text-[var(--color-teal)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]" to="/portfolio/moments">
            Manage moment details
          </Link>
        </div>

        {galleryLoading ? <LoadingState label="Loading Portfolio images..." /> : null}
        {!galleryLoading && galleryError ? (
          <div>
            <Notice>{galleryError}</Notice>
            <div className="mt-4"><Button onClick={() => void load()} type="button" variant="secondary">Retry gallery</Button></div>
          </div>
        ) : null}
        {!galleryLoading && !galleryError && images.length ? (
          <PortfolioGallery
            deletingMomentId={deletingMomentId}
            moments={moments}
            onDeleteMoment={requestDelete}
            ownerMode
          />
        ) : null}
        {!galleryLoading && !galleryError && !images.length ? (
          <EmptyState
            action={<Link to="/portfolio/moments/new"><Button iconLeft={<UploadIcon className="h-4 w-4" />}>Add your first images</Button></Link>}
            description="Upload one to five images in a moment. They will appear directly in this gallery without an extra album step."
            title="No Portfolio images yet"
          />
        ) : null}
      </section>
    </PageShell>
  )
}
