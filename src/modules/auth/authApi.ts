import { httpClient } from '@/apis'
import { extractGoogleLinkChallenge, type GoogleLinkChallenge } from './authPolicy'

export { extractGoogleLinkChallenge, type GoogleLinkChallenge }

export interface BackendApiResponse<TData = unknown> {
  success: boolean
  message: string
  data?: TData
  errors?: Array<{ field?: string; code?: string; message?: string }>
  code?: string
  requestId?: string
  requireLink?: boolean
  email?: string
  linkToken?: string
}

export interface AuthAccount {
  id?: string
  _id?: string
  email?: string
  fullName?: string
  companyName?: string
  avatarUrl?: string
  role?: string
  authMethods?: string[]
  isComplete?: boolean
  needsProfileCompletion?: boolean
  [key: string]: unknown
}

export interface GoogleAuthProfileData {
  id?: string
  fullName?: string
  companyName?: string
  avatarUrl?: string
  isComplete?: boolean
  [key: string]: unknown
}

export interface AuthSessionData {
  token?: string
  account?: AuthAccount
  needsProfileCompletion?: boolean
  profile?: GoogleAuthProfileData | null
}

export interface GoogleAuthResponseData extends AuthSessionData {
  requireLink?: boolean
  email?: string
  linkToken?: string
  isNewAccount?: boolean
}

export interface CurrentAuthSessionData {
  needsProfileCompletion?: boolean
  account: AuthAccount
  profile?: Record<string, unknown> | null
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

export interface GoogleAuthPayload {
  idToken: string
}

export interface GoogleLinkPayload {
  idToken: string
  password: string
  linkToken: string
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

export async function authenticateWithGoogle(payload: GoogleAuthPayload) {
  const response = await httpClient.post<BackendApiResponse<GoogleAuthResponseData>>('/auth/google', payload)
  return response.data
}

export async function linkGoogleAccount(payload: GoogleLinkPayload) {
  const response = await httpClient.post<BackendApiResponse<GoogleAuthResponseData>>('/auth/google/link', payload)
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

export async function getCurrentAuthSession() {
  const response = await httpClient.get<BackendApiResponse<CurrentAuthSessionData>>('/auth/me')
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

export function getAuthApiErrorStatus(error: unknown) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined
  const status = (error as { response?: { status?: unknown } }).response?.status
  return typeof status === 'number' ? status : undefined
}
