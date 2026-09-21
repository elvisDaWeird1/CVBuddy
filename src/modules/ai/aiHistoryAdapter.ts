import { type AiResultRecord } from './aiApi'
import { type CvDocument } from '@/modules/applicant/cvApi'

export type AiHistoryType = 'score' | 'feedback' | 'translation' | 'unknown'
export type AiHistoryStatus = 'completed' | 'failed' | 'processing' | 'unknown'

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

function readResultId(record: AiResultRecord) {
  const raw = record as unknown as Record<string, unknown>
  return readString(raw.id) || readString(raw._id) || 'unknown-result'
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
      targetRole: readString(record.targetRole),
      createdAt,
      createdAtLabel: formatDate(createdAt),
    }
  })
}
