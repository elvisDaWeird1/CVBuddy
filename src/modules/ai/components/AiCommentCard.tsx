import { useId } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AiCommentCardProps {
  comment?: string
}

export function AiCommentCard({ comment }: AiCommentCardProps) {
  const headingId = useId()

  return (
    <section aria-atomic="true" aria-labelledby={headingId} aria-live="polite">
      <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
        <CardHeader>
          <CardTitle className="text-xl" id={headingId}>
            Nhận xét của AI về CV vừa được chấm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comment ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {comment}
            </p>
          ) : (
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              AI chưa trả về nhận xét cho lần chấm này.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
