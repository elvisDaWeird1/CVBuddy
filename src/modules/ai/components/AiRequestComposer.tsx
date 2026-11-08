import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRightIcon, FileTextIcon } from '@/components/ui/icons'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getMyCvs, type CvDocument } from '@/modules/applicant/cvApi'
import {
  createAiIdempotencyKey,
  getAiApiErrorCode,
  getAiApiErrorMessage,
  getAiApiErrorStatus,
  scoreCv,
  translateCv,
  type AiRequestPayload,
  type AiResultRecord,
} from '@/modules/ai/aiApi'
import {
  isCvAvailable,
  resolveAiComposerPrefill,
  type AiAction,
} from '@/modules/ai/aiHistoryAdapter'
import { canRetryAiRequest, shouldReuseAiIdempotencyKey } from '@/modules/ai/aiRetryPolicy'
import { CAREER_CATALOG, getIndustry, getVertical } from '@/modules/ai/aiCareerCatalog'
import { AiProcessingState } from './AiProcessingState'
import { SafeRouterLink } from './ScoreOverview'

type FormErrors = {
  cv?: string
  industry?: string
  vertical?: string
  targetRole?: string
  action?: string
}

type RequestError = {
  text: string
  status?: number
  code?: string
}

type SubmittedRequest = {
  action: AiAction
  cvId: string
  cvTitle: string
  idempotencyKey: string
  industrySlug?: string
  industryLabel?: string
  verticalSlug?: string
  verticalLabel?: string
  targetRole?: string
}

const AI_ACTION_OPTIONS: Array<{ value: AiAction; title: string; description: string }> = [
  {
    value: 'analyze',
    title: 'Chấm điểm và review CV',
    description: 'Đánh giá ATS, ngôn ngữ, từ khóa, độ phù hợp với vị trí và nhận gợi ý viết lại.',
  },
  {
    value: 'translate',
    title: 'Dịch CV sang tiếng Anh',
    description: 'Dịch nội dung theo văn phong CV và nhận ghi chú để rà soát bản dịch.',
  },
]

function formatFileType(fileType?: string) {
  const normalized = fileType?.toLowerCase() || ''
  if (normalized.includes('pdf')) return 'PDF'
  if (normalized.includes('docx') || normalized.includes('word')) return 'DOCX'
  if (normalized.includes('doc')) return 'DOC'
  return fileType?.toUpperCase() || 'File'
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return 'Unknown size'
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value?: string) {
  if (!value) return 'Upload date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Upload date unavailable'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatStatus(status?: string) {
  if (!status) return 'Available'
  return status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function ErrorMessage({ error, onRetry }: { error: RequestError; onRetry: () => void }) {
  const canRetry = canRetryAiRequest(error)

  return (
    <div className="space-y-2 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm" role="alert">
      <p className="font-semibold text-[var(--color-error)]">We could not complete this AI task.</p>
      <p className="leading-relaxed text-[var(--color-text-primary)]">{error.text}</p>
      {error.status === 409 || error.status === 413 || error.status === 415 ? (
        <SafeRouterLink className="inline-flex items-center gap-1 font-semibold text-[var(--color-teal)] hover:underline" to="/cv">
          Open CV workspace
          <ArrowRightIcon className="h-4 w-4" />
        </SafeRouterLink>
      ) : null}
      {canRetry ? (
        <Button onClick={onRetry} size="sm" type="button" variant="secondary">
          Run this task again
        </Button>
      ) : null}
    </div>
  )
}

function CvSelectionList({
  cvs,
  selectedCvId,
  disabled,
  error,
  onSelect,
}: {
  cvs: CvDocument[]
  selectedCvId: string
  disabled: boolean
  error?: string
  onSelect: (cvId: string) => void
}) {
  if (cvs.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] px-5 py-8 text-center">
        <FileTextIcon className="mx-auto h-9 w-9 text-[var(--color-teal)]" />
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">You do not have a CV to analyze yet.</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Upload a CV first, then return here to run CV Analysis.
        </p>
        <SafeRouterLink className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] hover:underline" to="/cv">
          Open CV workspace
          <ArrowRightIcon className="h-4 w-4" />
        </SafeRouterLink>
      </div>
    )
  }

  return (
    <fieldset aria-describedby={error ? 'ai-cv-error' : undefined}>
      <legend className="sr-only">Choose a CV</legend>
      <div className="space-y-3">
        {cvs.map((cv) => {
          const available = isCvAvailable(cv)
          const selected = selectedCvId === cv.id

          return (
            <div
              className={`rounded-[var(--radius-lg)] border p-4 transition-colors ${selected
                ? 'border-[var(--color-teal)] bg-[var(--color-bg-soft)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg-main)]'} ${available ? '' : 'opacity-70'}`}
              key={cv.id}
            >
              <div className="flex items-start gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    aria-label={`Select ${cv.title}`}
                    checked={selected}
                    className="mt-1 h-4 w-4 accent-[var(--color-teal)]"
                    disabled={disabled || !available}
                    name="ai-cv"
                    onChange={() => onSelect(cv.id)}
                    type="radio"
                    value={cv.id}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--color-text-primary)]">{cv.title || 'Untitled CV'}</span>
                    <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">
                      {formatFileType(cv.fileType)} · {formatFileSize(cv.fileSize)} · Uploaded {formatDate(cv.uploadedAt)}
                    </span>
                  </span>
                </label>
                <span className={`shrink-0 rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold ${available
                  ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                  : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'}`}>
                  {available ? 'Available' : formatStatus(cv.status)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--color-error)]" id="ai-cv-error">{error}</p> : null}
    </fieldset>
  )
}

export interface AiRequestComposerProps {
  initialCvId?: string | null
  initialAction?: string | null
  onResultCreated: (result: AiResultRecord) => void
}

export function AiRequestComposer({
  initialCvId = null,
  initialAction = null,
  onResultCreated,
}: AiRequestComposerProps) {
  const actionFormRef = useRef<HTMLFormElement>(null)
  const userTouchedCvRef = useRef(false)
  const userTouchedActionRef = useRef(false)
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedCvId, setSelectedCvId] = useState('')
  const [industrySlug, setIndustrySlug] = useState('')
  const [verticalSlug, setVerticalSlug] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [customTargetRole, setCustomTargetRole] = useState('')
  const [selectedAction, setSelectedAction] = useState<AiAction | ''>(() =>
    resolveAiComposerPrefill([], { action: initialAction }).selectedAction,
  )
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isScorePending, setIsScorePending] = useState(false)
  const [scoreError, setScoreError] = useState<RequestError | null>(null)
  const [translationError, setTranslationError] = useState<RequestError | null>(null)
  const [isTranslationPending, setIsTranslationPending] = useState(false)
  const [lastRequest, setLastRequest] = useState<SubmittedRequest | null>(null)

  const isAnyAiPending = isScorePending || isTranslationPending
  const selectedCv = useMemo(
    () => cvs.find((cv) => cv.id === selectedCvId && isCvAvailable(cv)),
    [cvs, selectedCvId],
  )
  const requiresCareerTarget = selectedAction === 'analyze'
  const selectedVertical = getVertical(industrySlug, verticalSlug)
  const isOtherRole = targetRole === '__other__'
  const resolvedTargetRole = isOtherRole ? customTargetRole.trim() : targetRole
  const hasCareerTarget = Boolean(industrySlug && verticalSlug && resolvedTargetRole)
  const canSubmit = Boolean(
    selectedCv
    && selectedAction
    && (!requiresCareerTarget || hasCareerTarget),
  )

  useEffect(() => {
    let active = true

    async function loadCvs() {
      setLoadingCvs(true)
      setListError(null)

      try {
        const nextCvs = await getMyCvs()
        if (!active) return
        setCvs(nextCvs)
        const prefill = resolveAiComposerPrefill(nextCvs, {
          cvId: initialCvId,
          action: initialAction,
        })
        if (!userTouchedCvRef.current && prefill.selectedCvId) {
          setSelectedCvId(prefill.selectedCvId)
        }
        if (!userTouchedActionRef.current && prefill.selectedAction) {
          setSelectedAction(prefill.selectedAction)
        }
      } catch (error) {
        if (active) {
          setListError(getAiApiErrorMessage(error, 'Unable to load your CV documents. Please try again.'))
        }
      } finally {
        if (active) {
          setLoadingCvs(false)
        }
      }
    }

    void loadCvs()
    return () => {
      active = false
    }
  }, [initialAction, initialCvId])

  const retryLoadCvs = async () => {
    setLoadingCvs(true)
    setListError(null)

    try {
      const nextCvs = await getMyCvs()
      setCvs(nextCvs)
      const prefill = resolveAiComposerPrefill(nextCvs, {
        cvId: initialCvId,
        action: initialAction,
      })
      if (!userTouchedCvRef.current && prefill.selectedCvId) {
        setSelectedCvId(prefill.selectedCvId)
      }
    } catch (error) {
      setListError(getAiApiErrorMessage(error, 'Unable to load your CV documents. Please try again.'))
    } finally {
      setLoadingCvs(false)
    }
  }

  const handleCvSelect = (cvId: string) => {
    userTouchedCvRef.current = true
    setSelectedCvId(cvId)
    setFormErrors((current) => ({ ...current, cv: undefined }))
    setScoreError(null)
    setTranslationError(null)
    setLastRequest(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedRole = resolvedTargetRole
    const nextErrors: FormErrors = {
      cv: !selectedCv || !isCvAvailable(selectedCv) ? 'Choose an available CV before analyzing.' : undefined,
      industry: requiresCareerTarget && !industrySlug ? 'Choose an industry before analyzing.' : undefined,
      vertical: requiresCareerTarget && !verticalSlug ? 'Choose a specialization before analyzing.' : undefined,
      targetRole: requiresCareerTarget
        ? !trimmedRole
          ? 'Target role is required.'
          : trimmedRole.length < 2
            ? 'Target role must contain at least 2 characters.'
            : trimmedRole.length > 150
              ? 'Target role must be 150 characters or fewer.'
              : undefined
        : undefined,
      action: !selectedAction ? 'Choose one AI action before continuing.' : undefined,
    }
    setFormErrors(nextErrors)

    if (nextErrors.cv || nextErrors.industry || nextErrors.vertical || nextErrors.targetRole || nextErrors.action || !selectedCv || !selectedAction || isAnyAiPending) {
      return
    }

    setScoreError(null)
    setTranslationError(null)
    const retryError = selectedAction === 'analyze' ? scoreError : translationError
    const canReuseIdempotencyKey = Boolean(
      retryError
      && lastRequest
      && lastRequest.action === selectedAction
      && lastRequest.cvId === selectedCv.id
      && lastRequest.industrySlug === (industrySlug || undefined)
      && lastRequest.verticalSlug === (verticalSlug || undefined)
      && lastRequest.targetRole === (trimmedRole || undefined)
      && shouldReuseAiIdempotencyKey(retryError),
    )
    const idempotencyKey = canReuseIdempotencyKey && lastRequest
      ? lastRequest.idempotencyKey
      : createAiIdempotencyKey()

    setLastRequest({
      action: selectedAction,
      cvId: selectedCv.id,
      cvTitle: selectedCv.title || 'Untitled CV',
      idempotencyKey,
      industrySlug: industrySlug || undefined,
      industryLabel: getIndustry(industrySlug)?.label,
      verticalSlug: verticalSlug || undefined,
      verticalLabel: selectedVertical?.label,
      targetRole: trimmedRole || undefined,
    })

    if (selectedAction === 'analyze') {
      const payload: AiRequestPayload = { industrySlug, verticalSlug, targetRole: trimmedRole }
      setIsScorePending(true)
      try {
        const resultRecord = await scoreCv(selectedCv.id, payload, idempotencyKey)
        onResultCreated(resultRecord)
      } catch (error) {
        setScoreError({
          text: getAiApiErrorMessage(error, 'Unable to score and review this CV. Please try again.'),
          status: getAiApiErrorStatus(error),
          code: getAiApiErrorCode(error),
        })
      } finally {
        setIsScorePending(false)
      }
    }

    if (selectedAction === 'translate') {
      setIsTranslationPending(true)
      try {
        const resultRecord = await translateCv(selectedCv.id, idempotencyKey)
        onResultCreated(resultRecord)
      } catch (error) {
        setTranslationError({
          text: getAiApiErrorMessage(error, 'Unable to translate this CV to English. Please try again.'),
          status: getAiApiErrorStatus(error),
          code: getAiApiErrorCode(error),
        })
      } finally {
        setIsTranslationPending(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <ol aria-label="CV analysis steps" className="grid gap-2 sm:grid-cols-3">
        {[
          ['1', 'Select CV', Boolean(selectedCv)],
          ['2', 'Choose action', Boolean(selectedAction)],
          ['3', 'Career context', Boolean(selectedAction && (!requiresCareerTarget || hasCareerTarget))],
        ].map(([number, label, complete]) => (
          <li
            className={complete
              ? 'flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-teal)]'
              : 'flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)]'}
            key={label as string}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-white)] text-xs font-bold">
              {number as string}
            </span>
            {label as string}
          </li>
        ))}
      </ol>

      <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileTextIcon className="h-5 w-5 text-[var(--color-teal)]" />
            Step 1 · Select CV
          </CardTitle>
          <CardDescription>Select an uploaded CV to use for this analysis. Your source file will not be changed.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCvs ? (
            <div aria-live="polite" className="space-y-3" role="status">
              <span className="sr-only">Loading your CV documents...</span>
              {[1, 2, 3].map((item) => (
                <div className="h-[86px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-main)]" key={item} />
              ))}
            </div>
          ) : listError ? (
            <div className="space-y-3" role="alert">
              <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]">
                {listError}
              </p>
              <Button onClick={() => void retryLoadCvs()} size="sm" type="button" variant="secondary">
                Try again
              </Button>
            </div>
          ) : (
            <CvSelectionList
              cvs={cvs}
              disabled={isAnyAiPending}
              error={formErrors.cv}
              onSelect={handleCvSelect}
              selectedCvId={selectedCv?.id || ''}
            />
          )}
        </CardContent>
      </Card>

      {cvs.length > 0 && !loadingCvs && !listError ? (
        <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle className="text-xl">Step 2 · Configure AI action</CardTitle>
            <CardDescription>Choose one action. Career context is required only when scoring and reviewing a CV.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form className="space-y-5" onSubmit={handleSubmit} ref={actionFormRef}>
              <fieldset aria-describedby={formErrors.action ? 'ai-action-error' : undefined}>
                <legend className="text-sm font-medium text-[var(--color-navy)]">Choose AI Action</legend>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {AI_ACTION_OPTIONS.map((option) => {
                    const selected = selectedAction === option.value
                    return (
                      <label
                        className={selected
                          ? 'cursor-pointer rounded-[var(--radius-lg)] border-2 border-[var(--color-teal)] bg-[var(--color-bg-soft)] p-4 transition-colors'
                          : 'cursor-pointer rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-white)] p-4 transition-colors hover:border-[var(--color-border-hover)]'}
                        key={option.value}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            checked={selected}
                            className="mt-1 h-4 w-4 accent-[var(--color-teal)]"
                            disabled={isAnyAiPending}
                            name="ai-action"
                            onChange={() => {
                              userTouchedActionRef.current = true
                              setSelectedAction(option.value)
                              setFormErrors((current) => ({
                                ...current,
                                action: undefined,
                                industry: option.value === 'translate' ? undefined : current.industry,
                                vertical: option.value === 'translate' ? undefined : current.vertical,
                                targetRole: option.value === 'translate' ? undefined : current.targetRole,
                              }))
                            }}
                            type="radio"
                            value={option.value}
                          />
                          <span>
                            <span className="block text-sm font-semibold text-[var(--color-text-primary)]">{option.title}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-secondary)]">{option.description}</span>
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {formErrors.action ? <p className="mt-2 text-sm text-[var(--color-error)]" id="ai-action-error">{formErrors.action}</p> : null}
              </fieldset>

              {selectedAction === 'analyze' ? (
                <section
                  aria-labelledby="career-context-heading"
                  className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4"
                >
                  <div>
                    <h3 className="text-base font-semibold" id="career-context-heading">Step 3 · Career context</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      Used to assess keyword coverage and target-role fit.
                    </p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <Select
                        aria-describedby={formErrors.industry ? 'ai-industry-error' : undefined}
                        error={formErrors.industry}
                        id="ai-industry"
                        label="Industry"
                        onChange={(event) => {
                          setIndustrySlug(event.target.value)
                          setVerticalSlug('')
                          setTargetRole('')
                          setCustomTargetRole('')
                          setFormErrors((current) => ({ ...current, industry: undefined, vertical: undefined, targetRole: undefined }))
                        }}
                        options={CAREER_CATALOG.map((industry) => ({ value: industry.slug, label: industry.label }))}
                        placeholder="Select an industry"
                        value={industrySlug}
                      />
                      {formErrors.industry ? <span className="sr-only" id="ai-industry-error">{formErrors.industry}</span> : null}
                    </div>
                    <div>
                      <Select
                        aria-describedby={formErrors.vertical ? 'ai-vertical-error' : undefined}
                        disabled={!industrySlug}
                        error={formErrors.vertical}
                        id="ai-vertical"
                        label="Specialization"
                        onChange={(event) => {
                          setVerticalSlug(event.target.value)
                          setTargetRole('')
                          setCustomTargetRole('')
                          setFormErrors((current) => ({ ...current, vertical: undefined, targetRole: undefined }))
                        }}
                        options={(getIndustry(industrySlug)?.verticals || []).map((item) => ({ value: item.slug, label: item.label }))}
                        placeholder="Select a specialization"
                        value={verticalSlug}
                      />
                      {formErrors.vertical ? <span className="sr-only" id="ai-vertical-error">{formErrors.vertical}</span> : null}
                    </div>
                    <Select
                      aria-describedby={formErrors.targetRole ? 'ai-target-role-error' : undefined}
                      disabled={!verticalSlug}
                      error={formErrors.targetRole}
                      id="ai-target-role"
                      label="Target role"
                      onChange={(event) => {
                        setTargetRole(event.target.value)
                        setCustomTargetRole('')
                        setFormErrors((current) => ({ ...current, targetRole: undefined }))
                      }}
                      options={(selectedVertical?.targetRoles || []).map((role) => ({ value: role.value, label: role.label }))}
                      placeholder="Select a target role"
                      value={targetRole}
                    />
                  </div>
                  {isOtherRole ? (
                    <Input
                      aria-describedby={formErrors.targetRole ? 'ai-target-role-error' : undefined}
                      error={formErrors.targetRole}
                      id="ai-custom-target-role"
                      label="Enter another target role"
                      maxLength={150}
                      onChange={(event) => {
                        setCustomTargetRole(event.target.value)
                        setFormErrors((current) => ({ ...current, targetRole: undefined }))
                      }}
                      placeholder="e.g. Junior Product Analyst"
                      value={customTargetRole}
                    />
                  ) : null}
                  {formErrors.targetRole ? <span className="sr-only" id="ai-target-role-error">{formErrors.targetRole}</span> : null}
                </section>
              ) : selectedAction === 'translate' ? (
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  The selected CV will be translated directly to English. Industry and target role are not required.
                </div>
              ) : null}

              <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Selected CV</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text-primary)]">
                    {selectedCv?.title || 'Choose a CV above'}
                  </p>
                </div>
                <Button
                  className="w-full shrink-0 sm:w-auto"
                  disabled={!canSubmit || isAnyAiPending}
                  iconRight={<ArrowRightIcon className="h-4 w-4" />}
                  loading={isAnyAiPending}
                  type="submit"
                >
                  {selectedAction === 'analyze'
                    ? 'Chấm điểm và review'
                    : selectedAction === 'translate'
                      ? 'Dịch CV'
                      : 'Start AI action'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {lastRequest && (isAnyAiPending || scoreError || translationError) ? (
        <Card className="border-[var(--color-teal)] bg-[var(--color-bg-soft)]">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Your request</p>
              <p className="mt-1 font-semibold text-[var(--color-text-primary)]">
                {lastRequest.action === 'analyze' ? 'Score and review this CV' : 'Translate this CV to English'}
              </p>
              {lastRequest.targetRole ? (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {lastRequest.industryLabel} · {lastRequest.targetRole}
                </p>
              ) : null}
            </div>
            <p className="max-w-full truncate text-sm font-medium text-[var(--color-text-secondary)] sm:max-w-[45%]">
              {lastRequest.cvTitle}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {isAnyAiPending ? <AiProcessingState mode={isTranslationPending ? 'translation' : 'analysis'} /> : null}
      {scoreError ? <ErrorMessage error={scoreError} onRetry={() => actionFormRef.current?.requestSubmit()} /> : null}
      {translationError ? <ErrorMessage error={translationError} onRetry={() => actionFormRef.current?.requestSubmit()} /> : null}
    </div>
  )
}
