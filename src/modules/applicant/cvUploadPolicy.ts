export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

export const CV_ACCEPT = [
  '.pdf',
  '.docx',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
].join(',')

const ALLOWED_CV_MIME_BY_EXTENSION: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
}

export interface CvUploadCandidate {
  name: string
  type: string
  size: number
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : ''
}

export function validateCvFile(file: CvUploadCandidate | null) {
  if (!file || file.size <= 0) return 'Choose a valid CV file before uploading.'

  const extension = getFileExtension(file.name)
  const allowedMimeTypes = ALLOWED_CV_MIME_BY_EXTENSION[extension]
  const hasAllowedMime = allowedMimeTypes?.includes(file.type)

  if (!allowedMimeTypes || !hasAllowedMime) {
    return 'Only PDF and DOCX CV files are supported.'
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return 'CV file size must not exceed 5 MB.'
  }

  return undefined
}
