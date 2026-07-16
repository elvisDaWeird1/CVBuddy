import { Card, CardContent } from '@/components/ui/card'

export function AiProcessingState() {
  return (
    <Card className="border-[var(--color-border-focus)] bg-[var(--color-bg-soft)]" role="status" aria-live="polite">
      <CardContent className="flex items-start gap-3 py-4">
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-teal)] border-t-transparent" />
        </span>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">Analysis in progress</p>
          <ul className="mt-1 space-y-1 text-sm text-[var(--color-text-secondary)]">
            <li>Reading your CV</li>
            <li>Reviewing the content</li>
            <li>Preparing suggestions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
