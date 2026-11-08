import axios from 'axios'
import { httpClient } from '@/apis'
import { type BackendApiResponse } from '@/modules/auth/authApi'

export type AiLlmModel = 'qwen/qwen3.8-27b' | 'openai/gpt-oss-120b'

export interface AiJdExtractPayload {
  company_name?: string
  required_keywords: string[]
  preferred_keywords: string[]
  responsibilities: string[]
}

export interface AiRequestPayload {
  industrySlug?: string
  targetRole?: string
  cvText?: string
  verticalSlug?: string
  companyModel?: 'corporate' | 'startup_agency'
  language?: 'vi' | 'en' | 'both'
  jdExtract?: AiJdExtractPayload
  llmModel?: AiLlmModel
  extractionMode?: 'local' | 'ai' | 'hybrid'
  strictIndustryMatch?: boolean
  sourceLang?: string
  translationMode?: 'literal' | 'cv_native'
}

export type AiCareerTargetPayload = AiRequestPayload & {
  industrySlug: string
  verticalSlug: string
  targetRole: string
}

export type AiResultType =
  | 'CV_SCORING'
  | 'CV_FEEDBACK'
  | 'CV_TRANSLATION'
  | 'JOB_RECOMMENDATION'

export type AiResultStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface AiResultRecord {
  id: string
  accountId: string
  cvDocumentId?: string
  relatedJobId?: string
  aiType: AiResultType
  status: AiResultStatus
  score: number | null
  createdAt: string
  completedAt?: string
  inputText?: string
  resultText?: string
  result?: unknown
  errorCode?: string | null
  errorMessage?: string | null
  industrySlug?: string
  verticalSlug?: string
  targetRole?: string
  workflowId?: string
}

export interface AiWorkflowStep {
  status: AiResultStatus
  resultId: string
  errorCode: string | null
  errorMessage: string | null
  result: unknown
}

export interface AiTranslateAndScoreWorkflow {
  id: string
  status: AiResultStatus
  cvId: string
  industrySlug: string
  targetRole: string
  resultIds: {
    translation: string
    scoring: string
  }
  steps: {
    translation: AiWorkflowStep
    scoring: AiWorkflowStep
  }
}

interface AiActionData {
  aiResult: AiResultRecord
}

interface AiResultsData {
  aiResults: AiResultRecord[]
}

interface AiWorkflowData {
  workflow: AiTranslateAndScoreWorkflow
}

const AI_ACTION_TIMEOUT_MS = 130_000
const AI_WORKFLOW_TIMEOUT_MS = 190_000

export function createAiIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

export interface AiResultsQuery {
  aiType?: AiResultType
  status?: AiResultStatus
}

function normalizePayload(payload: AiRequestPayload): AiRequestPayload {
  const normalized: AiRequestPayload = {}

  if (payload.industrySlug !== undefined) normalized.industrySlug = payload.industrySlug.trim()
  if (payload.targetRole !== undefined) normalized.targetRole = payload.targetRole.trim()
  if (payload.cvText !== undefined) normalized.cvText = payload.cvText.trim()
  if (payload.verticalSlug !== undefined) normalized.verticalSlug = payload.verticalSlug.trim()
  if (payload.companyModel !== undefined) normalized.companyModel = payload.companyModel
  if (payload.language !== undefined) normalized.language = payload.language
  if (payload.jdExtract !== undefined) {
    const companyName = payload.jdExtract.company_name?.trim()
    normalized.jdExtract = {
      ...(companyName ? { company_name: companyName } : {}),
      required_keywords: [...payload.jdExtract.required_keywords],
      preferred_keywords: [...payload.jdExtract.preferred_keywords],
      responsibilities: [...payload.jdExtract.responsibilities],
    }
  }
  if (payload.llmModel !== undefined) normalized.llmModel = payload.llmModel
  if (payload.extractionMode !== undefined) normalized.extractionMode = payload.extractionMode
  if (payload.strictIndustryMatch !== undefined) normalized.strictIndustryMatch = payload.strictIndustryMatch
  if (payload.sourceLang !== undefined) normalized.sourceLang = payload.sourceLang.trim()
  if (payload.translationMode !== undefined) normalized.translationMode = payload.translationMode

  return normalized
}

async function runAiAction(path: string, body: unknown, idempotencyKey = createAiIdempotencyKey()) {
  const response = await httpClient.post<BackendApiResponse<AiActionData>>(path, body, {
    timeout: AI_ACTION_TIMEOUT_MS,
    headers: { 'Idempotency-Key': idempotencyKey },
  })

  if (!response.data.success || !response.data.data?.aiResult) {
    throw new Error(response.data.message || 'The AI result was not returned.')
  }

  return response.data.data.aiResult
}

export function scoreCv(cvId: string, payload: AiRequestPayload, idempotencyKey?: string) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/score`, normalizePayload(payload), idempotencyKey)
}

export function getFeedback(cvId: string, payload: AiRequestPayload, idempotencyKey?: string) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/feedback`, normalizePayload(payload), idempotencyKey)
}

export function translateCv(cvId: string, idempotencyKey?: string) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/translate-to-english`, {}, idempotencyKey)
}

export async function translateAndScoreCv(cvId: string, payload: AiCareerTargetPayload, idempotencyKey = createAiIdempotencyKey()) {
  const response = await httpClient.post<BackendApiResponse<AiWorkflowData>>(
    `/ai/cvs/${encodeURIComponent(cvId)}/translate-and-score`,
    normalizePayload(payload),
    {
      timeout: AI_WORKFLOW_TIMEOUT_MS,
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  )

  if (!response.data.success || !response.data.data?.workflow) {
    throw new Error(response.data.message || 'The translate and score workflow was not returned.')
  }

  return response.data.data.workflow
}

export function reviewCv(cvId: string, payload: AiCareerTargetPayload, idempotencyKey?: string) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/review`, normalizePayload(payload), idempotencyKey)
}

export async function getAiResults(query: AiResultsQuery = {}) {
  const params = new URLSearchParams()
  if (query.aiType) params.set('aiType', query.aiType)
  if (query.status) params.set('status', query.status)

  const path = params.toString() ? `/ai/results?${params.toString()}` : '/ai/results'
  const response = await httpClient.get<BackendApiResponse<AiResultsData>>(path)

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to load AI result history.')
  }

  return response.data.data?.aiResults ?? []
}

export async function getAiResultById(resultId: string) {
  const response = await httpClient.get<BackendApiResponse<AiActionData>>(
    `/ai/results/${encodeURIComponent(resultId)}`,
  )

  if (!response.data.success || !response.data.data?.aiResult) {
    throw new Error(response.data.message || 'The AI result was not returned.')
  }

  return response.data.data.aiResult
}

export function getAiApiErrorStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function getAiApiErrorCode(error: unknown) {
  if (!axios.isAxiosError(error)) return undefined
  const data = error.response?.data
  return data && typeof data === 'object' && 'code' in data && typeof data.code === 'string'
    ? data.code
    : undefined
}

export function getAiApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return 'The AI request took too long to finish. Check AI Results before retrying because the server may still complete it.'
  }

  if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
    return 'The AI service could not be reached. Check your connection and try again.'
  }

  const status = getAiApiErrorStatus(error)

  switch (status) {
    case 400:
      return 'The AI request data is invalid. Please check your selections and try again.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'Your account does not have access to this AI workspace.'
    case 404:
      return 'This CV is no longer available or you do not have access to it.'
    case 409:
      switch (getAiApiErrorCode(error)) {
        case 'IDEMPOTENCY_RETRY_REQUIRED':
          return 'The previous AI attempt failed and its credit was returned. Run the task again to start a new attempt.'
        case 'IDEMPOTENCY_PAYLOAD_MISMATCH':
          return 'This retry does not match the original AI request. Start a new attempt instead of reusing its request key.'
        case 'AI_REQUEST_IN_PROGRESS':
          return 'This AI request is still processing. Check AI Results before trying again.'
        default:
          return 'This AI request conflicts with a previous attempt. Check AI Results or start a new attempt.'
      }
    case 413:
    case 415:
      return 'Use a PDF or DOCX file within the allowed file size.'
    case 429:
      return 'You are sending requests too quickly or have reached the usage limit. Please try again later.'
    case 422:
      return 'AI could not read or validate this CV. Use a readable PDF or DOCX and check the selected career context.'
    case 502:
      return 'AI returned a result that could not be displayed safely. Please try again.'
    case 503:
      return 'AI Assistant is temporarily unavailable. Your CV was not changed.'
    case 504:
      return 'The analysis took longer than expected. Please try again.'
    default:
      return fallback
  }
}
