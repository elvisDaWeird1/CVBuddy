import { httpClient } from '@/apis'
import { type BackendApiResponse } from '@/modules/auth/authApi'
import type { AxiosProgressEvent } from 'axios'

export type CvLanguage = 'VI' | 'EN'

export interface CvDocument {
  id: string
  applicantProfileId?: string
  title: string
  originalName?: string
  fileUrl?: string
  filePublicId?: string
  fileResourceType?: string
  fileType: string
  mimeType?: string
  fileSize: number
  previewAvailable?: boolean
  downloadAvailable?: boolean
  language: CvLanguage | string
  status: string
  uploadedAt: string
  createdAt?: string
  updatedAt?: string
  extractedText?: string
}

interface UploadCvData {
  cv: CvDocument
}

interface CvListData {
  cvs: CvDocument[]
}

export interface UploadCvPayload {
  file: File
  language: CvLanguage
}

export interface UploadCvOptions {
  onUploadProgress?: (event: AxiosProgressEvent) => void
}

export async function uploadCv(
  { file, language }: UploadCvPayload,
  options: UploadCvOptions = {},
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)

  const response = await httpClient.post<BackendApiResponse<UploadCvData>>('/cvs', formData, {
    onUploadProgress: options.onUploadProgress,
  })

  if (!response.data.success || !response.data.data?.cv) {
    throw new Error(response.data.message || 'Unable to upload CV.')
  }

  return response.data.data.cv
}

export async function getMyCvs() {
  const response = await httpClient.get<BackendApiResponse<CvListData>>('/cvs')

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to load CV documents.')
  }

  return response.data.data?.cvs ?? []
}

export async function deleteCv(cvId: string) {
  const response = await httpClient.delete<BackendApiResponse<null>>(`/cvs/${encodeURIComponent(cvId)}`)

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to delete CV.')
  }
}

export async function previewCv(cvId: string) {
  const response = await httpClient.get<Blob>(`/cvs/${encodeURIComponent(cvId)}/preview`, {
    responseType: 'blob',
  })
  return response.data
}

function readDownloadFileName(contentDisposition: string | undefined) {
  if (!contentDisposition) return undefined
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const fallbackMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  return fallbackMatch?.[1]
}

export async function downloadCv(cvId: string) {
  const response = await httpClient.get<Blob>(`/cvs/${encodeURIComponent(cvId)}/download`, {
    responseType: 'blob',
  })
  return {
    blob: response.data,
    fileName: readDownloadFileName(response.headers['content-disposition']),
  }
}
