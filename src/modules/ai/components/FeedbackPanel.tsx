import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type AiFeedbackViewModel } from '@/modules/ai/aiResultAdapter'
import { AiRichText } from './AiRichText'

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
      <h4 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {items.map((item) => <li className="flex gap-2" key={item}><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal)]" />{item}</li>)}
      </ul>
    </section>
  )
}

export function FeedbackPanel({ result }: { result: AiFeedbackViewModel }) {
  const hasStructuredContent = Boolean(
    result.summary
    || result.strengths.length
    || result.improvements.length
    || result.rewrites.length
    || result.missingSections.length
    || result.targetRoleFit
    || result.dimensions.length,
  )

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
      <CardHeader>
        <CardTitle className="text-xl">Focused feedback</CardTitle>
        <CardDescription>Readable suggestions grouped from the AI result. Empty sections stay hidden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.summary ? (
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Overall feedback</p>
            <div className="mt-2"><AiRichText text={result.summary} /></div>
          </div>
        ) : null}

        <FeedbackList items={result.strengths} title="Strengths" />
        <FeedbackList items={result.improvements} title="Areas to improve" />

        {result.rewrites.length > 0 ? (
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Rewrite suggestions</h4>
            <div className="mt-3 space-y-3">
              {result.rewrites.map((rewrite, index) => (
                <article className="rounded-[var(--radius-md)] bg-[var(--color-bg-main)] p-3 text-sm" key={`${rewrite.suggested}-${index}`}>
                  {rewrite.original ? <p className="leading-relaxed text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-text-primary)]">Original: </span>{rewrite.original}</p> : null}
                  <p className="mt-2 leading-relaxed text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-text-primary)]">Suggested: </span>{rewrite.suggested}</p>
                  {rewrite.reason ? <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">Why: {rewrite.reason}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <FeedbackList items={result.missingSections} title="Missing CV sections" />

        {result.targetRoleFit ? (
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Target-role fit</h4>
            <div className="mt-2"><AiRichText text={result.targetRoleFit} /></div>
          </section>
        ) : null}

        {result.dimensions.length > 0 ? (
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Analysis notes</h4>
            <div className="mt-3 space-y-3">
              {result.dimensions.map((dimension) => (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4" key={dimension.key}>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{dimension.label}</p>
                  <div className="sm:max-w-[70%] sm:text-right">
                    {dimension.score !== null ? <p className="text-sm font-semibold text-[var(--color-teal)]">{dimension.score}/100</p> : null}
                    {dimension.description ? <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{dimension.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result.fallbackText ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">AI feedback</p>
            <div className="mt-2"><AiRichText text={result.fallbackText} /></div>
          </div>
        ) : null}

        {result.malformed && !result.fallbackText ? (
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)]" role="status">
            The result was created but cannot be displayed fully. You can try analyzing again.
          </p>
        ) : result.partial && hasStructuredContent ? (
          <p className="text-sm text-[var(--color-text-muted)]" role="status">
            This is a partial result; some feedback groups were not returned.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
