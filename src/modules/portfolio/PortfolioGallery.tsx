import { useMemo, useState } from 'react'
import { ImagePreviewModal } from './ImagePreviewModal'
import { PortfolioImageCard } from './PortfolioImageCard'
import { getPortfolioGalleryImages, type GalleryMoment } from './portfolioGalleryModel'

interface PortfolioGalleryProps {
  moments: GalleryMoment[]
  ownerMode?: boolean
  deletingMomentId?: string | null
  onDeleteMoment?: (momentId: string) => void
}

export function PortfolioGallery({
  moments,
  ownerMode = false,
  deletingMomentId,
  onDeleteMoment,
}: PortfolioGalleryProps) {
  const images = useMemo(() => getPortfolioGalleryImages(moments), [moments])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const activePreviewIndex = previewIndex !== null && previewIndex < images.length
    ? previewIndex
    : null

  return (
    <>
      <div aria-label="Portfolio image gallery" className="flex flex-wrap justify-center gap-4">
        {images.map((image, index) => (
          <PortfolioImageCard
            deleting={deletingMomentId === image.momentId}
            image={image}
            key={image.id}
            onDelete={onDeleteMoment}
            onPreview={() => setPreviewIndex(index)}
            ownerMode={ownerMode}
          />
        ))}
      </div>
      {activePreviewIndex !== null ? (
        <ImagePreviewModal
          images={images}
          index={activePreviewIndex}
          key={images[activePreviewIndex].id}
          onChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      ) : null}
    </>
  )
}
