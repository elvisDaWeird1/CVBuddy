import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { axiosConfig } from './axios.config'
import { clearAuthSession, getAuthToken, setAuthMessage } from '@/modules/auth/authStorage'

export const httpClient = axios.create(axiosConfig)

const AUTH_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
const PUBLIC_AUTH_ENDPOINTS = ['/auth/login', '/auth/register/applicant', '/auth/logout']
const PUBLIC_API_PATHS = ['/portfolio/public/']
const PUBLIC_ROUTES = ['/', '/login', '/register', '/home', '/about-us', '/project', '/ai-buddy', '/form', '/coming-soon', '/p']
let isRedirectingToLogin = false

function isPublicAuthRequest(error: AxiosError) {
  const requestUrl = error.config?.url ?? ''

  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => requestUrl === endpoint || requestUrl.endsWith(endpoint))
}

function isPublicApiRequest(error: AxiosError) {
  const requestUrl = error.config?.url ?? ''

  return PUBLIC_API_PATHS.some((path) => requestUrl.includes(path))
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)))
}

function handleUnauthorized() {
  clearAuthSession()
  setAuthMessage(AUTH_EXPIRED_MESSAGE)

  if (!isRedirectingToLogin && !isPublicRoute(window.location.pathname)) {
    isRedirectingToLogin = true
    window.location.replace('/login')
  }
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAuthToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isPublicAuthRequest(error) && !isPublicApiRequest(error)) {
      handleUnauthorized()
    }

    return Promise.reject(error)
  },
)
