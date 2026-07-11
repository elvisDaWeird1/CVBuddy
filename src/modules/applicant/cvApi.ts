import { httpClient } from '@/apis'
import { type BackendApiResponse } from '@/modules/auth/authApi'

export type CvLanguage = 'VI' | 'EN'

export interface CvDocument {
  id: string
  applicantProfileId?: string
  title: string
  fileUrl: string
  filePublicId?: string
  fileResourceType?: string
  fileType: string
  fileSize: number
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
  title: string
  language: CvLanguage
}

export async function uploadCv({ file, title, language }: UploadCvPayload) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('language', language)

  const response = await httpClient.post<BackendApiResponse<UploadCvData>>('/cvs', formData)

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
