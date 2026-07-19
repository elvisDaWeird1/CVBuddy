import axios from 'axios'
import type { AxiosProgressEvent } from 'axios'
import { httpClient } from '@/apis'
import type {
  BackendApiResponse,
  EvidenceInput,
  ExperienceFilters,
  ExperienceInput,
  MomentFilters,
  MomentInput,
  Portfolio,
  PortfolioEvidence,
  PortfolioExperience,
  PortfolioMoment,
  PortfolioProfileInput,
  PublicPortfolioResponse,
} from './portfolioTypes'

type Wrapped<T, K extends string> = { [P in K]: T }

interface EvidenceListResponse {
  evidence: PortfolioEvidence[]
}

export interface PortfolioApiError {
  status?: number
  code?: string
  message: string
  errors: Array<{ field?: string; code?: string; message?: string }>
}

function toApiError(error: unknown, fallback: string): PortfolioApiError {
  const responseContainer = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { status?: number; data?: BackendApiResponse } }).response
    : undefined
  if (axios.isAxiosError(error) || responseContainer) {
    const response = responseContainer?.data ?? (axios.isAxiosError(error) ? error.response?.data as BackendApiResponse | undefined : undefined)
    return {
      status: responseContainer?.status ?? (axios.isAxiosError(error) ? error.response?.status : undefined),
      code: response?.code,
      message: typeof response?.message === 'string' && response.message
        ? response.message
        : axios.isAxiosError(error) && error.message
          ? error.message
          : fallback,
      errors: Array.isArray(response?.errors) ? response.errors : [],
    }
  }

  return {
    message: error instanceof Error && error.message ? error.message : fallback,
    errors: [],
  }
}

async function request<T>(call: () => Promise<{ data: BackendApiResponse<T> }>, fallback: string) {
  try {
    const response = await call()
    if (!response.data.success) {
      throw { response: { data: response.data } }
    }
    return response.data
  } catch (error) {
    throw toApiError(error, fallback)
  }
}

export function getPortfolioErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export function getPortfolioErrorStatus(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error
    ? (error as { status?: number }).status
    : undefined
}

export function getPortfolioErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: string }).code
    : undefined
}

export function getPortfolioFieldError(error: unknown, field: string) {
  if (typeof error !== 'object' || error === null || !('errors' in error)) return undefined
  const errors = (error as PortfolioApiError).errors
  return errors.find((item) => item.field === field)?.message
}

export async function getPortfolio() {
  const response = await request<Wrapped<Portfolio, 'portfolio'>>(
    () => httpClient.get('/portfolio/me'),
    'Unable to load your portfolio.',
  )
  return response.data?.portfolio ?? null
}

export async function updatePortfolio(payload: PortfolioProfileInput) {
  const response = await request<Wrapped<Portfolio, 'portfolio'>>(
    () => httpClient.put('/portfolio/me', payload),
    'Unable to save your portfolio.',
  )
  return response.data?.portfolio
}

export async function publishPortfolio() {
  const response = await request<Wrapped<Portfolio, 'portfolio'>>(
    () => httpClient.patch('/portfolio/me/publish'),
    'Unable to publish your portfolio.',
  )
  return response.data?.portfolio
}

export async function unpublishPortfolio() {
  const response = await request<Wrapped<Portfolio, 'portfolio'>>(
    () => httpClient.patch('/portfolio/me/unpublish'),
    'Unable to unpublish your portfolio.',
  )
  return response.data?.portfolio
}

export async function updateFeaturedExperiences(featuredExperienceIds: string[]) {
  const response = await request<Wrapped<Portfolio, 'portfolio'>>(
    () => httpClient.put('/portfolio/me/featured-experiences', { featuredExperienceIds }),
    'Unable to update featured experiences.',
  )
  return response.data?.portfolio
}

export async function getPublicPortfolio(slug: string) {
  const response = await request<PublicPortfolioResponse>(
    () => httpClient.get(`/portfolio/public/${encodeURIComponent(slug)}`),
    'Unable to load this public portfolio.',
  )
  return response.data
}

export async function createExperience(payload: ExperienceInput) {
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.post('/portfolio/experiences', cleanPayload(payload)),
    'Unable to create experience.',
  )
  return response.data?.experience
}

export async function getExperiences(filters: ExperienceFilters = {}) {
  const response = await request<PortfolioExperience[]>(
    () => httpClient.get('/portfolio/experiences', { params: compactParams(filters) }),
    'Unable to load experiences.',
  )
  return { items: response.data ?? [], pagination: response.pagination }
}

export async function getExperience(id: string) {
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.get(`/portfolio/experiences/${id}`),
    'Unable to load experience.',
  )
  return response.data?.experience
}

export async function updateExperience(id: string, payload: Partial<ExperienceInput>) {
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.patch(`/portfolio/experiences/${id}`, cleanPayload(payload)),
    'Unable to save experience.',
  )
  return response.data?.experience
}

export async function deleteExperience(id: string) {
  await request<undefined>(() => httpClient.delete(`/portfolio/experiences/${id}`), 'Unable to delete experience.')
}

export async function publishExperience(id: string) {
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.patch(`/portfolio/experiences/${id}/publish`),
    'Unable to publish experience.',
  )
  return response.data?.experience
}

export async function archiveExperience(id: string) {
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.patch(`/portfolio/experiences/${id}/archive`),
    'Unable to archive experience.',
  )
  return response.data?.experience
}

export async function updateExperienceCover(id: string, file: File) {
  const formData = new FormData()
  formData.append('cover', file)
  const response = await request<Wrapped<PortfolioExperience, 'experience'>>(
    () => httpClient.patch(`/portfolio/experiences/${id}/cover`, formData),
    'Unable to update experience cover.',
  )
  return response.data?.experience
}

export interface PortfolioUploadOptions {
  onUploadProgress?: (event: AxiosProgressEvent) => void
}

export async function createMoment(
  fileList: File[],
  payload: MomentInput,
  options: PortfolioUploadOptions = {},
) {
  const formData = new FormData()
  fileList.forEach((file) => formData.append('media', file))
  Object.entries({
    ...payload,
    skills: payload.skills?.length ? JSON.stringify(payload.skills) : undefined,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, String(value))
  })

  const response = await request<Wrapped<PortfolioMoment, 'moment'>>(
    () => httpClient.post('/portfolio/moments', formData, {
      onUploadProgress: options.onUploadProgress,
    }),
    'Unable to upload moment.',
  )
  return response.data?.moment
}

export async function getMoments(filters: MomentFilters = {}) {
  const response = await request<PortfolioMoment[]>(
    () => httpClient.get('/portfolio/moments', { params: compactParams(filters) }),
    'Unable to load moments.',
  )
  return { items: response.data ?? [], pagination: response.pagination }
}

export async function getAllMoments(filters: Omit<MomentFilters, 'page' | 'limit'> = {}) {
  const items: PortfolioMoment[] = []
  let page = 1

  while (true) {
    const result = await getMoments({ ...filters, page, limit: 100 })
    items.push(...result.items)
    if (!result.pagination || page >= result.pagination.totalPages) break
    page += 1
  }

  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

export async function getMoment(id: string) {
  const response = await request<Wrapped<PortfolioMoment, 'moment'>>(
    () => httpClient.get(`/portfolio/moments/${id}`),
    'Unable to load moment.',
  )
  return response.data?.moment
}

export async function updateMoment(id: string, payload: Partial<MomentInput>) {
  const response = await request<Wrapped<PortfolioMoment, 'moment'>>(
    () => httpClient.patch(`/portfolio/moments/${id}`, cleanPayload(payload)),
    'Unable to update moment.',
  )
  return response.data?.moment
}

export async function deleteMoment(id: string) {
  await request<undefined>(() => httpClient.delete(`/portfolio/moments/${id}`), 'Unable to delete moment.')
}

export async function assignMoment(id: string, experienceId: string) {
  const response = await request<Wrapped<PortfolioMoment, 'moment'>>(
    () => httpClient.patch(`/portfolio/moments/${id}/assign-experience`, { experienceId }),
    'Unable to assign moment.',
  )
  return response.data?.moment
}

export async function unassignMoment(id: string) {
  const response = await request<Wrapped<PortfolioMoment, 'moment'>>(
    () => httpClient.patch(`/portfolio/moments/${id}/unassign-experience`),
    'Unable to unassign moment.',
  )
  return response.data?.moment
}

export async function getEvidence(experienceId: string) {
  const response = await request<EvidenceListResponse>(
    () => httpClient.get(`/portfolio/experiences/${experienceId}/evidence`),
    'Unable to load evidence.',
  )
  return response.data?.evidence ?? []
}

export async function createEvidence(experienceId: string, payload: EvidenceInput, file?: File) {
  if (!file) {
    const response = await request<Wrapped<PortfolioEvidence, 'evidence'>>(
      () => httpClient.post(`/portfolio/experiences/${experienceId}/evidence`, payload),
      'Unable to add evidence.',
    )
    return response.data?.evidence
  }

  const formData = new FormData()
  formData.append('file', file)
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, String(value))
  })
  const response = await request<Wrapped<PortfolioEvidence, 'evidence'>>(
    () => httpClient.post(`/portfolio/experiences/${experienceId}/evidence`, formData),
    'Unable to upload evidence.',
  )
  return response.data?.evidence
}

export async function updateEvidence(id: string, payload: Partial<EvidenceInput>, file?: File) {
  if (!file) {
    const response = await request<Wrapped<PortfolioEvidence, 'evidence'>>(
      () => httpClient.patch(`/portfolio/evidence/${id}`, payload),
      'Unable to update evidence.',
    )
    return response.data?.evidence
  }

  const formData = new FormData()
  formData.append('file', file)
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, String(value))
  })
  const response = await request<Wrapped<PortfolioEvidence, 'evidence'>>(
    () => httpClient.patch(`/portfolio/evidence/${id}`, formData),
    'Unable to update evidence.',
  )
  return response.data?.evidence
}

export async function deleteEvidence(id: string) {
  await request<undefined>(() => httpClient.delete(`/portfolio/evidence/${id}`), 'Unable to delete evidence.')
}

function compactParams(params: object) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
}

function cleanPayload<T extends object>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
}
