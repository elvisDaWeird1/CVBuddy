import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraIcon, TrashIcon, UploadIcon, XIcon } from '@/components/ui/icons'
import { MAX_MOMENT_MEDIA_COUNT, momentMediaAccept } from './portfolioUploadPolicy'
import { CameraDialog } from './CameraDialog'

interface MomentMediaPickerProps {
  files: File[]
  previews: Array<{ file: File; url: string }>
  disabled: boolean
  preparing: boolean
  onAddFiles: (files: File[]) => Promise<boolean>
  onUsePhoto: (file: File, capturedAt: number) => Promise<boolean>
  onRemoveFile: (index: number) => void
  onClear: () => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MomentMediaPicker({
  files,
  previews,
  disabled,
  preparing,
  onAddFiles,
  onUsePhoto,
  onRemoveFile,
  onClear,
}: MomentMediaPickerProps) {
  const [cameraOpen, setCameraOpen] = useState(false)
  const cameraButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deviceCameraInputRef = useRef<HTMLInputElement>(null)
  const full = files.length >= MAX_MOMENT_MEDIA_COUNT
  const unavailable = disabled || full

  const closeCamera = useCallback(() => setCameraOpen(false), [])
  const useDeviceCamera = useCallback(() => {
    if (disabled || full) {
      setCameraOpen(false)
      return
    }
    deviceCameraInputRef.current?.click()
    setCameraOpen(false)
  }, [disabled, full])

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (next.length) void onAddFiles(next)
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Media</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div
            aria-busy={preparing}
            className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-teal)] bg-[var(--color-bg-soft)] p-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (!disabled && event.dataTransfer.files.length) void onAddFiles(Array.from(event.dataTransfer.files))
            }}
          >
            <CameraIcon className="mx-auto h-10 w-10 text-[var(--color-teal)]" />
            <p className="mt-3 font-semibold text-[var(--color-text-primary)]">
              {preparing ? 'Preparing images…' : 'Capture, choose, or drop media'}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">JPG, PNG, WEBP or MP4 · up to {MAX_MOMENT_MEDIA_COUNT} files · 5 MB each</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button ref={cameraButtonRef} type="button" disabled={unavailable} onClick={() => setCameraOpen(true)} iconLeft={<CameraIcon className="h-4 w-4" />}>
                Live camera
              </Button>
              <Button type="button" variant="secondary" disabled={unavailable} onClick={() => deviceCameraInputRef.current?.click()} iconLeft={<CameraIcon className="h-4 w-4" />}>
                Use device camera
              </Button>
              <Button type="button" variant="outline" disabled={unavailable} onClick={() => fileInputRef.current?.click()} iconLeft={<UploadIcon className="h-4 w-4" />}>
                Choose files
              </Button>
              <input ref={deviceCameraInputRef} className="sr-only" aria-label="Capture a photo with your device camera" type="file" accept={momentMediaAccept} capture="environment" disabled={unavailable} onChange={handleFiles} />
              <input ref={fileInputRef} className="sr-only" aria-label="Choose Moment media files" type="file" accept={momentMediaAccept} multiple disabled={unavailable} onChange={handleFiles} />
            </div>
          </div>

          {full && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)]" role="status">
              This Moment already has 5 media files. Remove one before adding another.
            </p>
          )}
          {preparing && (
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-teal)]" role="status" aria-live="polite">
              Resizing and compressing images. You can keep editing the rest of the page.
            </div>
          )}

          {files.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map(({ file, url }, index) => (
                  <div key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                    <div className="relative aspect-square bg-[var(--color-gray-100)]">
                      {file.type.startsWith('video/')
                        ? <video className="h-full w-full object-cover" src={url} controls />
                        : <img className="h-full w-full object-cover" src={url} alt={file.name} />}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium">{file.name}</p>
                      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{file.type} · {formatBytes(file.size)}</p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-error)] disabled:opacity-50"
                        disabled={disabled}
                        onClick={() => onRemoveFile(index)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <XIcon className="h-3.5 w-3.5" />Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" disabled={disabled} onClick={onClear} iconLeft={<TrashIcon className="h-4 w-4" />}>
                Clear selection
              </Button>
            </>
          ) : (
            <p className="text-center text-sm text-[var(--color-text-muted)]">Your media preview will appear here before upload.</p>
          )}
        </CardContent>
      </Card>

      {cameraOpen && (
        <CameraDialog
          onClose={closeCamera}
          onUsePhoto={onUsePhoto}
          onChooseDeviceCamera={useDeviceCamera}
        />
      )}
    </>
  )
}
