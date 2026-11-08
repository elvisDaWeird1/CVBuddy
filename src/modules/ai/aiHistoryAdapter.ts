import { getAiApiErrorMessage, getAiApiErrorStatus, getAiResultById, type AiResultRecord } from './aiApi'
import { getMyCvs, type CvDocument } from '@/modules/applicant/cvApi'

export type AiHistoryType = 'score' | 'feedback' | 'translation' | 'unknown'
export type AiHistoryStatus = 'completed' | 'failed' | 'processing' | 'unknown'
export type AiAction = 'analyze' | 'translate'

export interface AiHistoryItemViewModel {
  id: string
  cvId: string | null
  cvName: string
  type: AiHistoryType
  typeLabel: string
  status: AiHistoryStatus
  statusLabel: string
  score: number | null
  industrySlug?: string
  verticalSlug?: string
  targetRole?: string
  createdAt: Date | null
  createdAtLabel: string
}

const TYPE_LABELS: Record<AiHistoryType, string> = {
  score: 'Chấm điểm và review CV',
  feedback: 'CV feedback',
  translation: 'Dịch CV sang tiếng Anh',
  unknown: 'AI result',
}

const STATUS_LABELS: Record<AiHistoryStatus, string> = {
  completed: 'Completed',
  failed: 'Failed',
  processing: 'Processing',
  unknown: 'Status unavailable',
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function readResultId(record: AiResultRecord) {
  const raw = record as unknown as Record<string, unknown>
  return readString(raw.id) || readString(raw._id) || 'unknown-result'
}

export function getAiResultRoute(resultId: string) {
  return `/ai/results/${encodeURIComponent(resultId)}`
}

export function isCvAvailable(cv: CvDocument) {
  const status = cv.status?.trim().toLowerCase()
  return !status || status === 'active' || status === 'available'
}

export function resolveAiComposerPrefill(
  cvs: CvDocument[],
  query: { cvId?: string | null; action?: string | null },
): { selectedCvId: string; selectedAction: AiAction | '' } {
  const rawCvId = typeof query.cvId === 'string' ? query.cvId.trim() : ''
  const matchedCv = rawCvId
    ? cvs.find((cv) => cv.id === rawCvId && isCvAvailable(cv))
    : undefined
  const rawAction = typeof query.action === 'string' ? query.action.trim().toLowerCase() : ''
  const selectedAction: AiAction | '' = rawAction === 'analyze' || rawAction === 'translate'
    ? rawAction
    : ''

  return {
    selectedCvId: matchedCv ? matchedCv.id : '',
    selectedAction,
  }
}

export function getAiResultDetailErrorMessage(error: unknown) {
  const status = getAiApiErrorStatus(error)
  if (status === 403) {
    return 'You do not have permission to view this AI result.'
  }
  if (status === 404) {
    return 'This saved AI result does not exist or is no longer available.'
  }
  return getAiApiErrorMessage(error, 'Unable to open this saved AI result. Please try again.')
}

export async function loadAiResultDetail(resultId: string) {
  const [record, cvs] = await Promise.all([
    getAiResultById(resultId),
    getMyCvs().catch((): CvDocument[] => []),
  ])
  const item = adaptAiHistory([record], cvs)[0] ?? null
  const matchedCv = item?.cvId
    ? cvs.find((cv) => cv.id === item.cvId && isCvAvailable(cv))
    : undefined

  return {
    record,
    cvs,
    item,
    sourceCvId: matchedCv ? matchedCv.id : null,
  }
}

function readCvId(record: AiResultRecord) {
  const raw = record as unknown as Record<string, unknown>
  return readString(raw.cvDocumentId) || readString(raw.cvId) || null
}

function normalizeType(value: unknown): AiHistoryType {
  switch (value) {
    case 'CV_SCORING':
      return 'score'
    case 'CV_FEEDBACK':
      return 'feedback'
    case 'CV_TRANSLATION':
      return 'translation'
    default:
      return 'unknown'
  }
}

function normalizeStatus(value: unknown): AiHistoryStatus {
  switch (value) {
    case 'COMPLETED':
      return 'completed'
    case 'FAILED':
      return 'failed'
    case 'PENDING':
      return 'processing'
    default:
      return 'unknown'
  }
}

function normalizeScore(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)
}

export function adaptAiHistory(records: AiResultRecord[], cvs: CvDocument[]): AiHistoryItemViewModel[] {
  return records.map((record) => {
    const type = normalizeType(record.aiType)
    const status = normalizeStatus(record.status)
    const cvId = readCvId(record)
    const cv = cvId ? cvs.find((item) => item.id === cvId) : undefined
    const createdAt = normalizeDate(record.createdAt)

    return {
      id: readResultId(record),
      cvId,
      cvName: cv?.title || 'CV no longer available',
      type,
      typeLabel: TYPE_LABELS[type],
      status,
      statusLabel: STATUS_LABELS[status],
      score: normalizeScore(record.score),
      industrySlug: readString(record.industrySlug),
      verticalSlug: readString(record.verticalSlug),
      targetRole: readString(record.targetRole),
      createdAt,
      createdAtLabel: formatDate(createdAt),
    }
  })
}
