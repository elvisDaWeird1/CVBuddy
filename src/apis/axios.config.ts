import type { AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config'

export const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
}
