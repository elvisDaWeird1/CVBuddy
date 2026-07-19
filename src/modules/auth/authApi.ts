import { httpClient } from '@/apis'

export interface BackendApiResponse<TData = unknown> {
  success: boolean
  message: string
  data?: TData
  errors?: Array<{ field?: string; code?: string; message?: string }>
  code?: string
}

export interface AuthAccount {
  id?: string
  _id?: string
  email?: string
  fullName?: string
  companyName?: string
  avatarUrl?: string
  role?: string
  [key: string]: unknown
}

export interface AuthSessionData {
  token?: string
  account?: AuthAccount
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterApplicantPayload {
  email: string
  password: string
  fullName: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function login(payload: LoginPayload) {
  const response = await httpClient.post<BackendApiResponse<AuthSessionData>>('/auth/login', payload)
  return response.data
}

export async function registerApplicant(payload: RegisterApplicantPayload) {
  const response = await httpClient.post<BackendApiResponse<AuthSessionData>>('/auth/register/applicant', payload)
  return response.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await httpClient.patch<BackendApiResponse<null>>('/auth/change-password', payload)
  return response.data
}

export async function logout() {
  const response = await httpClient.post<BackendApiResponse<null>>('/auth/logout')
  return response.data
}

export function getAuthApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data

    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message
    }
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export function getAuthApiErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined
  const responseData = (error as { response?: { data?: { code?: unknown } } }).response?.data
  return typeof responseData?.code === 'string' ? responseData.code : undefined
}
