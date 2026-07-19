import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CameraIcon, EditIcon, EyeIcon, TrashIcon } from '@/components/ui/icons'
import type { PortfolioGalleryImage } from './portfolioGalleryModel'

interface PortfolioImageCardProps {
  image: PortfolioGalleryImage
  ownerMode?: boolean
  deleting?: boolean
  onDelete?: (momentId: string) => void
  onPreview: () => void
}

export function PortfolioImageCard({
  image,
  ownerMode = false,
  deleting = false,
  onDelete,
  onPreview,
}: PortfolioImageCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="w-full grow-0 shrink-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-soft)]">
        <button
          aria-label={`Preview ${image.alt}`}
          className="group h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-teal)]"
          onClick={onPreview}
          type="button"
        >
          {imageFailed ? (
            <span className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-sm text-[var(--color-text-secondary)]" role="img" aria-label={`${image.alt} unavailable`}>
              <CameraIcon className="h-9 w-9 text-[var(--color-teal)]" />
              <span className="mt-2">Image unavailable</span>
            </span>
          ) : (
            <img
              alt={image.alt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={image.url}
            />
          )}
          {!imageFailed ? (
            <span className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-navy)_38%,transparent)] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-white)] px-3 py-1.5 text-xs font-semibold text-[var(--color-navy)]">
                <EyeIcon className="h-4 w-4" /> Preview
              </span>
            </span>
          ) : null}
        </button>

        {ownerMode && !image.isPublicReady ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-navy)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-white)] shadow-[var(--shadow-sm)]">
            Owner only
          </span>
        ) : null}
      </div>

      {(image.caption || (ownerMode && image.isPrimary)) ? (
        <div className="flex min-h-16 items-center gap-2 px-3 py-2.5">
          <p className="line-clamp-2 min-w-0 flex-1 text-sm text-[var(--color-text-secondary)]">
            {image.caption || 'Untitled image moment'}
          </p>
          {ownerMode && image.isPrimary ? (
            <div className="flex shrink-0 items-center gap-1">
              <Link
                aria-label={`Edit ${image.caption || 'image moment'}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
                to={`/portfolio/moments/${image.momentId}`}
              >
                <EditIcon className="h-4 w-4" />
              </Link>
              <Button
                aria-label={`Delete ${image.caption || 'image moment'}`}
                loading={deleting}
                onClick={() => onDelete?.(image.momentId)}
                size="sm"
                title="Delete moment and all attached media"
                type="button"
                variant="ghost"
              >
                {!deleting ? <TrashIcon className="h-4 w-4 text-[var(--color-error)]" /> : null}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
