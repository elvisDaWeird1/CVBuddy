export const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export interface ImageValidationOptions {
  maxBytes: number
}

export interface ImageCompressionOptions {
  maxDimension?: number
  quality?: number
}

export function validateImageFile(file: File | null | undefined, { maxBytes }: ImageValidationOptions) {
  if (!file || file.size <= 0) {
    return 'Choose a valid image file.'
  }

  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number])) {
    return 'Only JPEG, PNG and WebP images are supported.'
  }

  if (file.size > maxBytes) {
    return `Image size must not exceed ${Math.round(maxBytes / (1024 * 1024))} MB.`
  }

  return undefined
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be decoded.'))
    image.src = url
  })
}

export async function compressImageFile(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: ImageCompressionOptions = {},
) {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('This browser cannot prepare images for upload.')
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const largestDimension = Math.max(image.naturalWidth, image.naturalHeight)
    const scale = largestDimension > maxDimension ? maxDimension / largestDimension : 1
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context || typeof canvas.toBlob !== 'function') {
      throw new Error('This browser cannot compress images before upload.')
    }

    context.drawImage(image, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, quality)
    })

    if (!blob || blob.size <= 0) {
      throw new Error('The image could not be compressed. Please choose another file.')
    }

    if (scale === 1 && blob.size >= file.size) {
      return file
    }

    return new File([blob], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
