import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { axiosConfig } from './axios.config'

export const httpClient = axios.create(axiosConfig)

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => config,
  (error: AxiosError) => Promise.reject(error),
)

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        console.error('[HttpClient] Unauthorized')
      }
    }
    return Promise.reject(error)
  },
)
