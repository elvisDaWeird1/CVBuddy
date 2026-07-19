import { httpClient } from '@/apis'
import type { AxiosProgressEvent } from 'axios'

import { type BackendApiResponse, getAuthApiErrorMessage } from '@/modules/auth/authApi'

export interface ApplicantProfileApiModel {
  fullName?: string
  phone?: string | null
  university?: string | null
  major?: string | null
  location?: string | null
  headline?: string | null
  summary?: string | null
  careerGoal?: string | null
  avatarUrl?: string | null
  full_name?: string
  career_goal?: string | null
  avatar_url?: string | null
}

export interface ApplicantProfilePayload {
  fullName: string
  phone: string
  university: string
  major: string
  location: string
  headline: string
  summary: string
  careerGoal: string
}

export interface ApplicantProfile extends ApplicantProfilePayload {
  avatarUrl: string
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export function normalizeApplicantProfile(profile: unknown): ApplicantProfile {
  const source = typeof profile === 'object' && profile !== null ? (profile as ApplicantProfileApiModel) : {}

  return {
    fullName: normalizeNullableString(source.fullName ?? source.full_name),
    phone: normalizeNullableString(source.phone),
    university: normalizeNullableString(source.university),
    major: normalizeNullableString(source.major),
    location: normalizeNullableString(source.location),
    headline: normalizeNullableString(source.headline),
    summary: normalizeNullableString(source.summary),
    careerGoal: normalizeNullableString(source.careerGoal ?? source.career_goal),
    avatarUrl: normalizeNullableString(source.avatarUrl ?? source.avatar_url),
  }
}

function unwrapApplicantProfileResponse(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const responseData = data as {
    data?: unknown
    applicantProfile?: unknown
    profile?: unknown
  }

  return responseData.data ?? responseData.applicantProfile ?? responseData.profile ?? data
}

export async function getApplicantProfile() {
  const response = await httpClient.get<BackendApiResponse<unknown>>('/applicant-profile/me')

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to load applicant profile.')
  }

  return normalizeApplicantProfile(unwrapApplicantProfileResponse(response.data.data))
}

export async function updateApplicantProfile(payload: ApplicantProfilePayload) {
  const response = await httpClient.patch<BackendApiResponse<unknown>>('/applicant-profile/me', payload)

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to update applicant profile.')
  }

  return normalizeApplicantProfile(unwrapApplicantProfileResponse(response.data.data) ?? payload)
}

interface AvatarUploadData {
  applicantProfile: ApplicantProfileApiModel
}

export async function uploadApplicantAvatar(
  file: File,
  onUploadProgress?: (event: AxiosProgressEvent) => void,
) {
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await httpClient.patch<BackendApiResponse<AvatarUploadData>>(
    '/applicant-profile/me/avatar',
    formData,
    { onUploadProgress },
  )

  if (!response.data.success || !response.data.data?.applicantProfile) {
    throw new Error(response.data.message || 'Unable to update avatar.')
  }

  return normalizeApplicantProfile(response.data.data.applicantProfile)
}

export { getAuthApiErrorMessage }
