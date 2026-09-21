export const MAX_PORTFOLIO_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_MOMENT_MEDIA_COUNT = 5

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
const momentMimeTypes = [...imageMimeTypes, 'video/mp4'] as const
const evidenceMimeTypes = [
  ...momentMimeTypes,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const momentMediaAccept = momentMimeTypes.join(',')
export const experienceCoverAccept = imageMimeTypes.join(',')
export const evidenceFileAccept = [
  '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.mp4',
  ...evidenceMimeTypes,
].join(',')

export type PortfolioUploadUseCase = 'moment' | 'cover' | 'evidence'

export interface PortfolioUploadCandidate {
  name: string
  size: number
  type: string
}

const acceptedMimeTypes: Record<PortfolioUploadUseCase, readonly string[]> = {
  moment: momentMimeTypes,
  cover: imageMimeTypes,
  evidence: evidenceMimeTypes,
}

const labels: Record<PortfolioUploadUseCase, string> = {
  moment: 'JPG, JPEG, PNG, WEBP, or MP4',
  cover: 'JPG, JPEG, PNG, or WEBP image',
  evidence: 'JPG, JPEG, PNG, WEBP, MP4, PDF, DOC, or DOCX',
}

const mimeTypesByExtension: Record<string, readonly string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.mp4': ['video/mp4'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

function getExtension(name: string) {
  const index = name.lastIndexOf('.')
  return index >= 0 ? name.slice(index).toLowerCase() : ''
}

export function validatePortfolioUploadFile(file: PortfolioUploadCandidate | null | undefined, useCase: PortfolioUploadUseCase) {
  if (!file || file.size <= 0) return 'Choose a non-empty file before uploading.'
  const expectedMimeTypes = mimeTypesByExtension[getExtension(file.name)]
  if (!expectedMimeTypes || !expectedMimeTypes.includes(file.type) || !acceptedMimeTypes[useCase].includes(file.type)) {
    return `${file.name} is not supported. Use ${labels[useCase]}.`
  }
  if (file.size > MAX_PORTFOLIO_FILE_SIZE_BYTES) return `${file.name} must be 5 MB or smaller.`
  return undefined
}

export function validateMomentMediaFiles(files: PortfolioUploadCandidate[]) {
  if (!files.length) return 'Choose at least one image or video.'
  if (files.length > MAX_MOMENT_MEDIA_COUNT) return `A moment can contain at most ${MAX_MOMENT_MEDIA_COUNT} media files.`
  return files.map((file) => validatePortfolioUploadFile(file, 'moment')).find(Boolean)
}
