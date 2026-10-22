import type { MomentInput } from './portfolioTypes'

export function buildMomentFormData(fileList: File[], payload: MomentInput) {
  const formData = new FormData()
  fileList.forEach((file) => formData.append('media', file))
  Object.entries({
    ...payload,
    skills: payload.skills?.length ? JSON.stringify(payload.skills) : undefined,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') formData.append(key, String(value))
  })
  return formData
}
