export interface HttpResponse<T> {
  data: T
  status: number
  message?: string
}
