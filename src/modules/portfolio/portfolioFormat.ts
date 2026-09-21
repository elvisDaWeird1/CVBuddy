import type { PortfolioAsset, PortfolioExperience } from './portfolioTypes'

export function formatDate(value: string | null | undefined, fallback = 'Date not provided') {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

export function formatDateRange(item: Pick<PortfolioExperience, 'startDate' | 'endDate' | 'isCurrent'>) {
  const start = item.startDate ? formatDate(item.startDate) : 'Start date not provided'
  return `${start} — ${item.isCurrent ? 'Present' : item.endDate ? formatDate(item.endDate) : 'End date not provided'}`
}

export function getAssetLabel(asset: PortfolioAsset) {
  return asset.originalFilename || asset.assetType
}

