import type {
  ExperienceVisibility,
  MomentStatus,
  PortfolioAsset,
} from './portfolioTypes'

export interface GalleryMoment {
  id: string
  caption: string
  capturedAt: string
  mediaAssets: PortfolioAsset[]
  imageUrl?: string
  status?: MomentStatus
  visibility?: ExperienceVisibility
}

export interface PortfolioGalleryImage {
  id: string
  momentId: string
  url: string
  alt: string
  caption: string
  capturedAt: string
  filename: string
  isPrimary: boolean
  isPublicReady: boolean
}

function isImageAsset(asset: PortfolioAsset) {
  return asset.assetType === 'image' || asset.mimeType.startsWith('image/')
}

export function getPortfolioGalleryImages(moments: GalleryMoment[]) {
  const images = moments.flatMap((moment) => {
    const assets = moment.mediaAssets.filter((asset) => asset.secureUrl && isImageAsset(asset))
    const sources = assets.length
      ? assets.map((asset) => ({ id: asset.id, url: asset.secureUrl, filename: asset.originalFilename }))
      : moment.imageUrl
        ? [{ id: 'legacy', url: moment.imageUrl, filename: 'Portfolio image' }]
        : []

    return sources.map((source, index) => ({
      id: `${moment.id}:${source.id}`,
      momentId: moment.id,
      url: source.url,
      alt: moment.caption
        ? `${moment.caption}${sources.length > 1 ? `, image ${index + 1}` : ''}`
        : `Portfolio image ${index + 1}`,
      caption: moment.caption,
      capturedAt: moment.capturedAt,
      filename: source.filename,
      isPrimary: index === 0,
      isPublicReady: moment.status === undefined || (
        moment.status === 'ready' && moment.visibility === 'portfolio'
      ),
    }))
  })

  return images.map((image, index) => ({
    ...image,
    alt: image.caption ? image.alt : `Portfolio image ${index + 1}`,
  }))
}
