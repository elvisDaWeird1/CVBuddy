import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CameraIcon, XIcon } from '@/components/ui/icons'
import { captureVideoFrame } from './cameraUtils'
import { useCameraSession } from './useCameraSession'

interface CameraDialogProps {
  onClose: () => void
  onUsePhoto: (file: File, capturedAt: number) => Promise<boolean>
  onChooseDeviceCamera: () => void
}

export function CameraDialog({ onClose, onUsePhoto, onChooseDeviceCamera }: CameraDialogProps) {
  const {
    videoRef,
    stream,
    status,
    devices,
    selectedCameraId,
    errorMessage,
    infoMessage,
    startCamera,
    stopCamera,
  } = useCameraSession()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [capturedAt, setCapturedAt] = useState<number | null>(null)
  const [captureError, setCaptureError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const previewUrl = useMemo(
    () => capturedFile ? URL.createObjectURL(capturedFile) : null,
    [capturedFile],
  )

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    void startCamera()
  }, [startCamera])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  const capture = async () => {
    const video = videoRef.current
    if (!video) return
    const time = Date.now()
    setCaptureError(null)
    try {
      const file = await captureVideoFrame(video, time)
      setCapturedFile(file)
      setCapturedAt(time)
      stopCamera()
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : 'The camera image could not be captured. Try again or choose files.')
    }
  }

  const retake = () => {
    setCapturedFile(null)
    setCapturedAt(null)
    setCaptureError(null)
    void startCamera(selectedCameraId || undefined)
  }

  const handleUsePhoto = async () => {
    if (!capturedFile || capturedAt === null || processing) return
    setProcessing(true)
    try {
      const accepted = await onUsePhoto(capturedFile, capturedAt)
      if (accepted) onClose()
    } finally {
      setProcessing(false)
    }
  }

  const statusMessage = status === 'requesting'
    ? 'Requesting camera access…'
    : status === 'live'
      ? 'Camera is ready. Frame the moment, then capture a photo.'
      : null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-end justify-center bg-[var(--color-navy)]/70 p-0 sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        className="flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-xl)] sm:rounded-[var(--radius-xl)] sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moment-camera-title"
        aria-describedby="moment-camera-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="moment-camera-title" className="text-xl font-semibold">Use your camera</h2>
            <p id="moment-camera-description" className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Take a photo, review it, then add it to this Moment.
            </p>
          </div>
          <Button ref={closeButtonRef} type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close camera">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-navy)]">
          {capturedFile && previewUrl ? (
            <img className="max-h-[58dvh] min-h-48 w-full object-contain" src={previewUrl} alt="Captured photo preview" />
          ) : stream ? (
            <video
              ref={videoRef}
              className="max-h-[58dvh] min-h-48 w-full object-contain"
              autoPlay
              muted
              playsInline
              aria-label="Live camera preview"
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center px-6 text-center text-sm text-white/80" role="status" aria-live="polite">
              {status === 'requesting' ? 'Starting your camera…' : 'Live preview is unavailable.'}
            </div>
          )}
        </div>

        {statusMessage && <p className="mt-3 text-sm text-[var(--color-text-secondary)]" role="status" aria-live="polite">{statusMessage}</p>}
        {infoMessage && <p className="mt-3 text-sm text-[var(--color-text-secondary)]" role="status">{infoMessage}</p>}
        {errorMessage && <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]" role="alert">{errorMessage}</p>}
        {captureError && <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]" role="alert">{captureError}</p>}

        {devices.length > 1 && !capturedFile && (
          <label className="mt-4 grid gap-1 text-sm font-medium" htmlFor="moment-camera-device">
            Camera
            <select
              id="moment-camera-device"
              className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] px-3"
              value={selectedCameraId}
              disabled={status === 'requesting'}
              onChange={(event) => void startCamera(event.target.value)}
            >
              {devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}
            </select>
          </label>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          {!capturedFile && status === 'live' && (
            <Button type="button" onClick={() => void capture()} iconLeft={<CameraIcon className="h-4 w-4" />}>
              Capture photo
            </Button>
          )}
          {!capturedFile && status !== 'live' && status !== 'requesting' && (
            <Button type="button" variant="secondary" onClick={() => void startCamera(selectedCameraId || undefined)}>
              Start camera
            </Button>
          )}
          {capturedFile && (
            <>
              <Button type="button" variant="secondary" disabled={processing} onClick={retake}>Retake</Button>
              <Button type="button" loading={processing} disabled={processing} onClick={() => void handleUsePhoto()}>Use photo</Button>
            </>
          )}
          <Button type="button" variant="outline" onClick={onChooseDeviceCamera}>Use device camera</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
