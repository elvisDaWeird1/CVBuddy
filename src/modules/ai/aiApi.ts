import axios from 'axios'
import { httpClient } from '@/apis'
import { type BackendApiResponse } from '@/modules/auth/authApi'

export interface AiRequestPayload {
  industrySlug: string
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
  updatedAt?: string
  inputText?: string
  resultText?: string
  result?: unknown
  errorCode?: string | null
  errorMessage?: string | null
  industrySlug?: string
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

export interface AiResultsQuery {
  aiType?: AiResultType
  status?: AiResultStatus
}

function normalizePayload(payload: AiRequestPayload): AiRequestPayload {
  return {
    industrySlug: payload.industrySlug.trim(),
    targetRole: payload.targetRole.trim(),
  }
}

async function runAiAction(path: string, body: unknown) {
  const response = await httpClient.post<BackendApiResponse<AiActionData>>(path, body)

  if (!response.data.success || !response.data.data?.aiResult) {
    throw new Error(response.data.message || 'The AI result was not returned.')
  }

  return response.data.data.aiResult
}

export function scoreCv(cvId: string, payload: AiRequestPayload) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/score`, normalizePayload(payload))
}

export function getFeedback(cvId: string, payload: AiRequestPayload) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/feedback`, normalizePayload(payload))
}

export function translateCv(cvId: string) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/translate-to-english`, {})
}

export async function translateAndScoreCv(cvId: string, payload: AiRequestPayload) {
  const response = await httpClient.post<BackendApiResponse<AiWorkflowData>>(
    `/ai/cvs/${encodeURIComponent(cvId)}/translate-and-score`,
    normalizePayload(payload),
  )

  if (!response.data.success || !response.data.data?.workflow) {
    throw new Error(response.data.message || 'The translate and score workflow was not returned.')
  }

  return response.data.data.workflow
}

export function reviewCv(cvId: string, payload: AiRequestPayload) {
  return runAiAction(`/ai/cvs/${encodeURIComponent(cvId)}/review`, normalizePayload(payload))
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

export function getAiApiErrorMessage(error: unknown, fallback: string) {
  const status = getAiApiErrorStatus(error)

  switch (status) {
    case 400:
      return 'The AI request data is invalid. Please check your selections and try again.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 404:
      return 'This CV is no longer available or you do not have access to it.'
    case 409:
      return 'The saved CV file is no longer available. Upload a current CV to continue.'
    case 413:
    case 415:
      return 'Use a PDF or DOCX file within the allowed file size.'
    case 429:
      return 'You are sending requests too quickly or have reached the usage limit. Please try again later.'
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
