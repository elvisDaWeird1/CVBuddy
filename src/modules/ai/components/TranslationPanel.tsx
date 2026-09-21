import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckIcon, FileTextIcon } from '@/components/ui/icons'
import { type AiTranslationViewModel } from '@/modules/ai/aiResultAdapter'

type CopyState = 'idle' | 'copied' | 'unavailable' | 'failed'

interface TranslationPanelProps {
  result: AiTranslationViewModel | null
  pending?: boolean
  error?: string
  onTranslate?: () => void
  disabled?: boolean
  readOnly?: boolean
}

function getCopyText(result: AiTranslationViewModel) {
  if (result.text) {
    return result.text
  }

  return result.sections
    .map((section) => section.heading ? section.heading + '\n' + section.content : section.content)
    .join('\n\n')
    .trim()
}

export function TranslationPanel({
  result,
  pending = false,
  error,
  onTranslate,
  disabled = false,
  readOnly = false,
}: TranslationPanelProps) {
  const [copyFeedback, setCopyFeedback] = useState<{ text: string; state: CopyState }>({ text: '', state: 'idle' })
  const copyText = useMemo(() => result ? getCopyText(result) : '', [result])
  const copyState = copyFeedback.text === copyText ? copyFeedback.state : 'idle'

  const handleCopy = async () => {
    if (!copyText) {
      return
    }

    if (!navigator.clipboard?.writeText) {
      setCopyFeedback({ text: copyText, state: 'unavailable' })
      return
    }

    try {
      await navigator.clipboard.writeText(copyText)
      setCopyFeedback({ text: copyText, state: 'copied' })
    } catch {
      setCopyFeedback({ text: copyText, state: 'failed' })
    }
  }

  const hasVisibleResult = Boolean(result && (result.text || result.sections.length))

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{readOnly ? 'English translation' : 'Translate your CV'}</CardTitle>
            <CardDescription>
              {readOnly
                ? 'Read-only result from your saved AI history.'
                : 'Create an English version for review without changing your original CV.'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {result?.source ? (
              <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)]">
                Source {result.source.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </span>
            ) : null}
            {hasVisibleResult ? (
              <Button
                aria-label="Copy translation"
                disabled={!copyText}
                iconLeft={copyState === 'copied' ? <CheckIcon className="h-4 w-4" /> : <FileTextIcon className="h-4 w-4" />}
                onClick={() => void handleCopy()}
                size="sm"
                type="button"
                variant="secondary"
              >
                {copyState === 'copied' ? 'Copied' : 'Copy translation'}
              </Button>
            ) : null}
          </div>
        </div>
        {result?.model ? (
          <details className="mt-3 text-xs text-[var(--color-text-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--color-teal)]">Technical details</summary>
            <p className="mt-1 break-all">
              Model {result.model}{result.language ? ` · Language ${result.language.toUpperCase()}` : ''}
            </p>
          </details>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {!readOnly ? (
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Your source CV will stay unchanged. Translation is only shown here for review and copying.
          </p>
        ) : null}

        {pending ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-focus)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm" role="status" aria-live="polite">
            <p className="font-semibold text-[var(--color-text-primary)]">Preparing the English version of your CV.</p>
            <p className="mt-1 text-[var(--color-text-secondary)]">The original CV will not be changed.</p>
          </div>
        ) : null}

        {error ? (
          <div className="space-y-3 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm" role="alert">
            <p className="font-semibold text-[var(--color-error)]">We could not translate this CV.</p>
            <p className="leading-relaxed text-[var(--color-text-primary)]">{error}</p>
            {!readOnly && onTranslate ? (
              <Button onClick={onTranslate} size="sm" type="button" variant="secondary">Try again</Button>
            ) : null}
          </div>
        ) : null}

        {!pending && !error && !result && !readOnly && onTranslate ? (
          <Button
            className="w-full sm:w-auto"
            disabled={disabled}
            loading={pending}
            onClick={onTranslate}
            type="button"
            variant="secondary"
          >
            Translate CV to English
          </Button>
        ) : null}

        {result && !result.malformed && result.sections.length > 0 ? (
          <div className="space-y-3">
            {result.sections.map((section, index) => (
              <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4" key={(section.heading || 'translation-section') + '-' + index}>
                {section.heading ? <h4 className="text-base font-semibold text-[var(--color-text-primary)]">{section.heading}</h4> : null}
                <p className={section.heading ? 'mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]' : 'whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]'}>
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        ) : result && !result.malformed && result.text ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">{result.text}</p>
          </div>
        ) : null}

        {result?.notes.length ? (
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Review notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {result.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        ) : null}

        {result?.malformed ? (
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)]" role="status">
            The translation was created but cannot be displayed fully. Please try again.
          </p>
        ) : result?.partial ? (
          <p className="text-sm text-[var(--color-text-muted)]" role="status">
            This translation is partial; some sections were not returned.
          </p>
        ) : null}

        {copyState === 'unavailable' ? (
          <p className="text-sm text-[var(--color-error)]" role="status">Copying is not available in this browser.</p>
        ) : copyState === 'failed' ? (
          <p className="text-sm text-[var(--color-error)]" role="status">We could not copy the translation. Please select and copy it manually.</p>
        ) : null}
        <span aria-live="polite" className="sr-only" role="status">
          {copyState === 'copied' ? 'Translation copied to the clipboard.' : ''}
        </span>
      </CardContent>
    </Card>
  )
}
