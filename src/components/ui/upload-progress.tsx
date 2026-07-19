import { cn } from '@/utils/cn'

interface UploadProgressProps {
  value: number
  label?: string
  className?: string
}

export function UploadProgress({ value, label = 'Uploading', className }: UploadProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={cn('space-y-2', className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--color-text-secondary)]">
        <span>{label}</span>
        <span>{normalizedValue}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        className="h-2 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-gray-200)]"
        role="progressbar"
      >
        <div
          className="h-full rounded-[var(--radius-full)] bg-[var(--color-teal)] transition-[width] duration-200"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  )
}
