import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { CameraIcon, ChevronDownIcon, XIcon } from '@/components/ui/icons'
import type { PortfolioGalleryImage } from './portfolioGalleryModel'

interface ImagePreviewModalProps {
  images: PortfolioGalleryImage[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

export function ImagePreviewModal({ images, index, onChange, onClose }: ImagePreviewModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const current = images[index]

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [current?.url])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (images.length > 1 && event.key === 'ArrowLeft') {
        onChange((index - 1 + images.length) % images.length)
      }
      if (images.length > 1 && event.key === 'ArrowRight') {
        onChange((index + 1) % images.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, index, onChange, onClose])

  if (!current || typeof document === 'undefined') return null

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-navy)_88%,transparent)] p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
      role="dialog"
    >
      <div className="relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-white)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[var(--color-navy)]" id={titleId}>
              {current.caption || current.filename}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">Image {index + 1} of {images.length}</p>
          </div>
          <Button
            aria-label="Close image preview"
            onClick={onClose}
            ref={closeButtonRef}
            size="sm"
            type="button"
            variant="ghost"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[var(--color-navy)] p-3 sm:p-6">
          {imageFailed ? (
            <div className="flex min-h-72 w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-center text-[var(--color-text-secondary)]">
              <CameraIcon className="h-12 w-12 text-[var(--color-teal)]" />
              <p className="mt-3 font-medium">This image could not be displayed.</p>
            </div>
          ) : (
            <img
              alt={current.alt}
              className="max-h-[75vh] max-w-full object-contain"
              onError={() => setImageFailed(true)}
              src={current.url}
            />
          )}

          {images.length > 1 ? (
            <>
              <Button
                aria-label="Previous image"
                className="absolute left-3 rotate-90 bg-[var(--color-white)] sm:left-5"
                onClick={() => onChange((index - 1 + images.length) % images.length)}
                size="sm"
                type="button"
                variant="outline"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </Button>
              <Button
                aria-label="Next image"
                className="absolute right-3 -rotate-90 bg-[var(--color-white)] sm:right-5"
                onClick={() => onChange((index + 1) % images.length)}
                size="sm"
                type="button"
                variant="outline"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
