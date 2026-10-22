export const MAX_CAMERA_FRAME_EDGE = 1600
export const CAMERA_JPEG_QUALITY = 0.82

export interface CaptureDimensions {
  width: number
  height: number
}

export function calculateCaptureDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxEdge = MAX_CAMERA_FRAME_EDGE,
): CaptureDimensions {
  if (sourceWidth <= 0 || sourceHeight <= 0 || maxEdge <= 0) {
    throw new Error('A camera frame is not ready to capture.')
  }
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight))
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  }
}

export function getCameraSupportError({
  secureContext,
  hostname,
  hasGetUserMedia,
}: {
  secureContext: boolean
  hostname: string
  hasGetUserMedia: boolean
}) {
  const localHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  if (!secureContext && !localHost) return 'Live camera needs a secure page. Open CVBuddy over HTTPS or localhost.'
  if (!hasGetUserMedia) return 'Live camera is not supported in this browser. Use device camera or choose files instead.'
  return undefined
}

export function getCameraErrorMessage(error: unknown) {
  const name = error instanceof Error
    ? error.name
    : typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: unknown }).name ?? '')
      : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access was not allowed. Check this site’s camera permission, then try again or choose files.'
  }
  if (name === 'NotFoundError') return 'No camera was found. Connect a camera or choose files instead.'
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'The camera could not start. Close other apps using it, then try again or choose files.'
  }
  if (name === 'OverconstrainedError') return 'That camera is unavailable. Choose another camera or try again.'
  return 'The camera could not be opened. Try again or choose files instead.'
}

export function createCameraFile(blob: Blob, capturedAt = Date.now()) {
  const safeTimestamp = new Date(capturedAt).toISOString().replace(/[:.]/g, '-')
  return new File([blob], `camera-moment-${safeTimestamp}.jpg`, {
    type: 'image/jpeg',
    lastModified: capturedAt,
  })
}

export function stopCameraStream(
  stream: Pick<MediaStream, 'getTracks'> | null,
  video?: Pick<HTMLVideoElement, 'srcObject'> | null,
) {
  if (stream) stream.getTracks().forEach((track) => track.stop())
  if (video) video.srcObject = null
}

export async function captureVideoFrame(video: HTMLVideoElement, capturedAt = Date.now()) {
  const dimensions = calculateCaptureDimensions(video.videoWidth, video.videoHeight)
  const canvas = document.createElement('canvas')
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  const context = canvas.getContext('2d')
  if (!context || typeof canvas.toBlob !== 'function') {
    throw new Error('This browser cannot capture an image. Use device camera or choose files instead.')
  }

  context.drawImage(video, 0, 0, dimensions.width, dimensions.height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', CAMERA_JPEG_QUALITY)
  })
  if (!blob || blob.size === 0) {
    throw new Error('The camera image could not be created. Please try again or choose files instead.')
  }
  return createCameraFile(blob, capturedAt)
}

export function toLocalDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}
