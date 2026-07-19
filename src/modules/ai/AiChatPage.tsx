import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
  getAiApiErrorMessage,
  getAiApiErrorStatus,
  getAiResultById,
  getAiResults,
  reviewCv,
  translateAndScoreCv,
  type AiRequestPayload,
  type AiResultRecord,
  type AiResultType,
  type AiTranslateAndScoreWorkflow,
  type AiWorkflowStep,
} from './aiApi'
import { adaptAiHistory, type AiHistoryItemViewModel } from './aiHistoryAdapter'
import {
  adaptFeedbackResult,
  adaptScoreResult,
  adaptTranslationResult,
} from './aiResultAdapter'
import { AiCommentCard } from './components/AiCommentCard'
import { AiProcessingState } from './components/AiProcessingState'
import { AiResultHistory } from './components/AiResultHistory'
import { AiResultHistoryDetail } from './components/AiResultHistoryDetail'
import { FeedbackPanel } from './components/FeedbackPanel'
import { ScoreOverview } from './components/ScoreOverview'
import { TranslationPanel } from './components/TranslationPanel'

const INDUSTRY_OPTIONS = [
  { value: 'ai_software', label: 'AI & Software' },
  { value: 'business_administration', label: 'Business Administration' },
  { value: 'computer_science', label: 'Information Technology' },
  { value: 'language', label: 'Language' },
  { value: 'law', label: 'Law' },
  { value: 'marketing', label: 'Marketing' },
]

type FormErrors = {
  cv?: string
  industry?: string
  targetRole?: string
  action?: string
}

type AiAction = 'translate-score' | 'review'

const AI_ACTION_OPTIONS: Array<{ value: AiAction; title: string; description: string }> = [
  {
    value: 'translate-score',
    title: 'Translate and Score',
    description: 'Translate your CV into English, then score the translated content for your career target.',
  },
  {
    value: 'review',
    title: 'Review CV',
    description: 'Receive structured feedback and practical improvement suggestions.',
  },
]

type RequestError = {
  text: string
  status?: number
}

function workflowStepToRecord(
  workflow: AiTranslateAndScoreWorkflow,
  step: AiWorkflowStep,
  aiType: AiResultType,
): AiResultRecord {
  return {
    id: step.resultId,
    accountId: '',
    cvDocumentId: workflow.cvId,
    aiType,
    status: step.status,
    score: null,
    createdAt: new Date().toISOString(),
    result: step.result,
    errorCode: step.errorCode,
    errorMessage: step.errorMessage,
    industrySlug: workflow.industrySlug,
    targetRole: workflow.targetRole,
    workflowId: workflow.id,
  }
}

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

function isCvAvailable(cv: CvDocument) {
  const status = cv.status?.trim().toLowerCase()
  return !status || status === 'active' || status === 'available'
}

function formatStatus(status?: string) {
  if (!status) return 'Available'
  return status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function ErrorMessage({ error }: { error: RequestError }) {
  return (
    <div className="space-y-2 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm" role="alert">
      <p className="font-semibold text-[var(--color-error)]">We could not complete this AI task.</p>
      <p className="leading-relaxed text-[var(--color-text-primary)]">{error.text}</p>
      {error.status === 409 || error.status === 413 || error.status === 415 ? (
        <Link className="inline-flex items-center gap-1 font-semibold text-[var(--color-teal)] hover:underline" to="/cv">
          Open CV workspace
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
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
          Upload a CV first, then return here to use AI Assistant.
        </p>
        <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] hover:underline" to="/cv">
          Open CV workspace
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
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

export default function AiChatPage() {
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedCvId, setSelectedCvId] = useState('')
  const [industrySlug, setIndustrySlug] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [selectedAction, setSelectedAction] = useState<AiAction | ''>('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isScorePending, setIsScorePending] = useState(false)
  const [isFeedbackPending, setIsFeedbackPending] = useState(false)
  const [scoreError, setScoreError] = useState<RequestError | null>(null)
  const [feedbackError, setFeedbackError] = useState<RequestError | null>(null)
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof adaptScoreResult> | null>(null)
  const [feedbackResult, setFeedbackResult] = useState<ReturnType<typeof adaptFeedbackResult> | null>(null)
  const [translationResult, setTranslationResult] = useState<ReturnType<typeof adaptTranslationResult> | null>(null)
  const [translationError, setTranslationError] = useState<RequestError | null>(null)
  const [isTranslationPending, setIsTranslationPending] = useState(false)
  const [historyRecords, setHistoryRecords] = useState<AiResultRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [historyDetail, setHistoryDetail] = useState<AiResultRecord | null>(null)
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false)
  const [historyDetailError, setHistoryDetailError] = useState<string | null>(null)
  const [activeResultSource, setActiveResultSource] = useState<'current' | 'history'>('current')

  const isProcessing = isScorePending || isFeedbackPending
  const isAnyAiPending = isProcessing || isTranslationPending
  const selectedCv = useMemo(() => cvs.find((cv) => cv.id === selectedCvId), [cvs, selectedCvId])
  const history = useMemo(() => adaptAiHistory(historyRecords, cvs), [historyRecords, cvs])
  const selectedHistoryItem = useMemo(
    () => history.find((item) => item.id === selectedHistoryId) || null,
    [history, selectedHistoryId],
  )
  const currentAiComment = scoreResult?.aiComment || feedbackResult?.aiComment
  const hasCurrentAnalysisOutcome = !isProcessing && Boolean(
    scoreResult || feedbackResult || scoreError || feedbackError,
  )

  useEffect(() => {
    let active = true

    async function loadCvs() {
      setLoadingCvs(true)
      setListError(null)

      try {
        const nextCvs = await getMyCvs()
        if (active) {
          setCvs(nextCvs)
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
  }, [])

  useEffect(() => {
    let active = true

    async function loadHistory() {
      setLoadingHistory(true)
      setHistoryError(null)

      try {
        const records = await getAiResults()
        if (active) {
          setHistoryRecords(records)
        }
      } catch (error) {
        if (active) {
          setHistoryError(getAiApiErrorMessage(error, 'Unable to load recent AI results. Please try again.'))
        }
      } finally {
        if (active) {
          setLoadingHistory(false)
        }
      }
    }

    void loadHistory()
    return () => {
      active = false
    }
  }, [])

  const retryLoadCvs = async () => {
    setLoadingCvs(true)
    setListError(null)

    try {
      setCvs(await getMyCvs())
    } catch (error) {
      setListError(getAiApiErrorMessage(error, 'Unable to load your CV documents. Please try again.'))
    } finally {
      setLoadingCvs(false)
    }
  }

  const refreshHistory = async () => {
    setLoadingHistory(true)
    setHistoryError(null)

    try {
      setHistoryRecords(await getAiResults())
    } catch (error) {
      setHistoryError(getAiApiErrorMessage(error, 'Unable to load recent AI results. Please try again.'))
    } finally {
      setLoadingHistory(false)
    }
  }

  const retryLoadHistory = () => {
    void refreshHistory()
  }

  const handleCvSelect = (cvId: string) => {
    setSelectedCvId(cvId)
    setFormErrors((current) => ({ ...current, cv: undefined }))
    setActiveResultSource('current')
    setSelectedHistoryId(null)
    setHistoryDetail(null)
    setHistoryDetailError(null)
    setScoreError(null)
    setFeedbackError(null)
    setScoreResult(null)
    setFeedbackResult(null)
    setTranslationError(null)
    setTranslationResult(null)
  }

  const handleHistorySelect = async (item: AiHistoryItemViewModel) => {
    setSelectedHistoryId(item.id)
    setActiveResultSource('history')
    setHistoryDetail(null)
    setHistoryDetailError(null)
    setHistoryDetailLoading(true)

    try {
      setHistoryDetail(await getAiResultById(item.id))
    } catch (error) {
      setHistoryDetailError(getAiApiErrorMessage(error, 'Unable to open this saved AI result. Please try again.'))
    } finally {
      setHistoryDetailLoading(false)
    }
  }

  const handleHistoryRetry = () => {
    if (selectedHistoryItem) {
      void handleHistorySelect(selectedHistoryItem)
    }
  }

  const handleBackToCurrent = () => {
    setActiveResultSource('current')
    setSelectedHistoryId(null)
    setHistoryDetail(null)
    setHistoryDetailError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedRole = targetRole.trim()
    const nextErrors: FormErrors = {
      cv: !selectedCv || !isCvAvailable(selectedCv) ? 'Choose an available CV before analyzing.' : undefined,
      industry: !industrySlug ? 'Choose an industry before analyzing.' : undefined,
      targetRole: !trimmedRole
        ? 'Target role is required.'
        : trimmedRole.length < 2
          ? 'Target role must contain at least 2 characters.'
        : trimmedRole.length > 150
          ? 'Target role must be 150 characters or fewer.'
          : undefined,
      action: !selectedAction ? 'Choose one AI action before continuing.' : undefined,
    }
    setFormErrors(nextErrors)

    if (nextErrors.cv || nextErrors.industry || nextErrors.targetRole || nextErrors.action || !selectedCv || !selectedAction || isAnyAiPending) {
      return
    }

    const payload: AiRequestPayload = { industrySlug, targetRole: trimmedRole }

    setActiveResultSource('current')
    setSelectedHistoryId(null)
    setHistoryDetail(null)
    setHistoryDetailError(null)
    setScoreError(null)
    setFeedbackError(null)
    setTranslationError(null)
    setScoreResult(null)
    setFeedbackResult(null)
    setTranslationResult(null)
    let succeeded = false

    if (selectedAction === 'translate-score') {
      setIsScorePending(true)
      setIsTranslationPending(true)
      try {
        const workflow = await translateAndScoreCv(selectedCv.id, payload)
        const translationStep = workflow.steps.translation
        const scoringStep = workflow.steps.scoring

        if (translationStep.status === 'COMPLETED') {
          setTranslationResult(adaptTranslationResult(
            workflowStepToRecord(workflow, translationStep, 'CV_TRANSLATION'),
          ))
          succeeded = true
        } else {
          setTranslationError({
            text: translationStep.errorMessage || 'The CV translation step failed.',
          })
        }

        if (scoringStep.status === 'COMPLETED') {
          setScoreResult(adaptScoreResult(
            workflowStepToRecord(workflow, scoringStep, 'CV_SCORING'),
          ))
          succeeded = true
        } else {
          setScoreError({
            text: scoringStep.errorMessage || 'The CV scoring step failed.',
          })
        }
      } catch (error) {
        setScoreError({
          text: getAiApiErrorMessage(error, 'Unable to translate and score this CV. Please try again.'),
          status: getAiApiErrorStatus(error),
        })
      } finally {
        setIsScorePending(false)
        setIsTranslationPending(false)
      }
    }

    if (selectedAction === 'review') {
      setIsFeedbackPending(true)
      try {
        setFeedbackResult(adaptFeedbackResult(await reviewCv(selectedCv.id, payload)))
        succeeded = true
      } catch (error) {
        setFeedbackError({
          text: getAiApiErrorMessage(error, 'Unable to generate CV feedback. Please try again.'),
          status: getAiApiErrorStatus(error),
        })
      } finally {
        setIsFeedbackPending(false)
      }
    }

    if (succeeded) void refreshHistory()
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
          <Link className="hover:text-[var(--color-teal)]" to="/profile">Profile</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">AI Chatting</span>
        </nav>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">AI workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">AI CV Analysis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Choose one verified AI task and review the saved result in the same workspace.
            </p>
          </div>
          <Link className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] px-4 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]" to="/cv">
            Manage CVs
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>

        <ol className="grid gap-2 sm:grid-cols-4" aria-label="AI analysis steps">
          {[
            ['1', 'Select CV', Boolean(selectedCv)],
            ['2', 'Career target', Boolean(industrySlug && targetRole.trim())],
            ['3', 'Choose action', Boolean(selectedAction)],
            ['4', 'Result', Boolean(scoreResult || feedbackResult || translationResult || selectedHistoryId)],
          ].map(([number, label, complete]) => (
            <li
              className={complete
                ? 'flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-teal)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-teal)]'
                : 'flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)]'}
              key={label as string}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-white)] text-xs font-bold">{number as string}</span>
              {label as string}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="min-w-0 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">AI CV Analysis</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Complete the steps below before starting an AI request.</p>
          </div>
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
                <div className="space-y-3" role="status" aria-live="polite">
                  <span className="sr-only">Loading your CV documents...</span>
                  {[1, 2, 3].map((item) => <div className="h-[86px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-main)]" key={item} />)}
                </div>
              ) : listError ? (
                <div className="space-y-3" role="alert">
                  <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-error)]">{listError}</p>
                  <Button onClick={() => void retryLoadCvs()} size="sm" type="button" variant="secondary">Try again</Button>
                </div>
              ) : (
                <CvSelectionList
                  cvs={cvs}
                  disabled={isAnyAiPending}
                  error={formErrors.cv}
                  onSelect={handleCvSelect}
                  selectedCvId={selectedCvId}
                />
              )}
            </CardContent>
          </Card>

          {cvs.length > 0 && !loadingCvs && !listError ? (
            <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
              <CardHeader>
                <CardTitle className="text-xl">Step 2 · Career Target</CardTitle>
                <CardDescription>Industry and target role are required before you can continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Select
                        aria-describedby={formErrors.industry ? 'ai-industry-error' : undefined}
                        error={formErrors.industry}
                        id="ai-industry"
                        label="Industry"
                        onChange={(event) => {
                          setIndustrySlug(event.target.value)
                          setFormErrors((current) => ({ ...current, industry: undefined }))
                        }}
                        options={INDUSTRY_OPTIONS}
                        placeholder="Select an industry"
                        value={industrySlug}
                      />
                      {formErrors.industry ? <span className="sr-only" id="ai-industry-error">{formErrors.industry}</span> : null}
                    </div>
                    <Input
                      error={formErrors.targetRole}
                      id="ai-target-role"
                      label="Target role"
                      maxLength={150}
                      onChange={(event) => {
                        setTargetRole(event.target.value)
                        setFormErrors((current) => ({ ...current, targetRole: undefined }))
                      }}
                      placeholder="Marketing Intern, Frontend Developer, Event Coordinator"
                      value={targetRole}
                    />
                  </div>

                  <fieldset aria-describedby={formErrors.action ? 'ai-action-error' : undefined}>
                    <legend className="text-sm font-medium text-[var(--color-navy)]">Step 3 · Choose AI Action</legend>
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
                                  setSelectedAction(option.value)
                                  setFormErrors((current) => ({ ...current, action: undefined }))
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

                  <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Selected CV</p>
                      <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text-primary)]">{selectedCv?.title || 'Choose a CV above'}</p>
                    </div>
                    <Button
                      className="w-full shrink-0 sm:w-auto"
                      disabled={!selectedCv || !industrySlug || !targetRole.trim() || !selectedAction || isAnyAiPending}
                      iconRight={<ArrowRightIcon className="h-4 w-4" />}
                      loading={isAnyAiPending}
                      type="submit"
                    >
                      Start AI action
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          ) : null}

          {isAnyAiPending ? <AiProcessingState /> : null}

          <div className="border-t border-[var(--color-border)] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Step 4</p>
            <h2 className="mt-1 text-2xl font-semibold">Result</h2>
          </div>

          {activeResultSource === 'history' && selectedHistoryItem ? (
            <AiResultHistoryDetail
              error={historyDetailError}
              item={selectedHistoryItem}
              loading={historyDetailLoading}
              onBack={handleBackToCurrent}
              onRetry={handleHistoryRetry}
              record={historyDetail}
            />
          ) : (
            <>
              {scoreError ? <ErrorMessage error={scoreError} /> : null}
              {feedbackError ? <ErrorMessage error={feedbackError} /> : null}
              {translationError ? <ErrorMessage error={translationError} /> : null}

              {scoreResult ? <ScoreOverview result={scoreResult} /> : null}
              {hasCurrentAnalysisOutcome ? <AiCommentCard comment={currentAiComment} /> : null}
              {feedbackResult ? <FeedbackPanel result={feedbackResult} /> : null}

              {translationResult ? <TranslationPanel result={translationResult} /> : null}
              {!scoreResult && !feedbackResult && !translationResult && !scoreError && !feedbackError && !translationError && !isAnyAiPending ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                    Your completed AI result will appear here. Saved results remain available in AI Results.
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-6">
          <div>
            <h2 className="text-2xl font-semibold">AI Results</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Open completed, pending, or failed tasks without starting a new request.</p>
          </div>
          <AiResultHistory
            error={historyError}
            items={history}
            loading={loadingHistory}
            onRetry={retryLoadHistory}
            onSelect={(item) => void handleHistorySelect(item)}
            selectedId={selectedHistoryId}
          />
        </aside>
      </div>
    </div>
  )
}
