export const EXPERIENCE_TYPES = [
  'event',
  'project',
  'job',
  'internship',
  'volunteer',
  'competition',
  'workshop',
  'course',
  'club',
  'personal-project',
  'other',
] as const

export const EXPERIENCE_STATUSES = ['draft', 'published', 'archived'] as const
export const EXPERIENCE_VISIBILITIES = ['private', 'portfolio'] as const
export const MOMENT_STATUSES = ['draft', 'ready'] as const
export const EVIDENCE_TYPES = ['file', 'certificate', 'github', 'website', 'article', 'video', 'other'] as const
export const VERIFICATION_STATUSES = ['unverified', 'document-provided'] as const

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]
export type ExperienceStatus = (typeof EXPERIENCE_STATUSES)[number]
export type ExperienceVisibility = (typeof EXPERIENCE_VISIBILITIES)[number]
export type MomentStatus = (typeof MOMENT_STATUSES)[number]
export type EvidenceType = (typeof EVIDENCE_TYPES)[number]
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PortfolioAsset {
  id: string
  assetType: 'image' | 'video' | 'document' | 'certificate' | 'other'
  usage?: 'moment-media' | 'experience-cover' | 'experience-evidence'
  secureUrl: string
  originalFilename: string
  mimeType: string
  format: string | null
  bytes: number | null
  createdAt: string
}

export interface Portfolio {
  id: string
  headline: string
  about: string
  desiredRole: string
  slug: string
  isPublic: boolean
  skills: string[]
  socialLinks: Record<string, string>
  featuredExperienceIds: string[]
  createdAt: string
  updatedAt: string
  applicantId?: string
}

export interface PortfolioExperience {
  id: string
  applicantId?: string
  type: ExperienceType
  title: string
  organization: string
  role: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  location: string
  description: string
  responsibilities: string[]
  achievements: string[]
  skills: string[]
  coverAssetId?: string | null
  coverAsset: PortfolioAsset | null
  status: ExperienceStatus
  visibility: ExperienceVisibility
  createdAt: string
  updatedAt: string
}

export interface PortfolioMoment {
  id: string
  experienceId: string | null
  caption: string
  capturedAt: string
  location: string
  skills: string[]
  mediaAssetIds?: string[]
  mediaAssets: PortfolioAsset[]
  status: MomentStatus
  visibility: ExperienceVisibility
  createdAt: string
  updatedAt: string
  applicantId?: string
  portfolioId?: string
  imageUrl?: string
}

export interface PortfolioEvidence {
  id: string
  experienceId: string
  type: EvidenceType
  title: string
  description: string
  url: string | null
  assetId?: string | null
  asset: PortfolioAsset | null
  verificationStatus: VerificationStatus
  createdAt: string
  updatedAt: string
  applicantId?: string
}

export interface PublicPortfolio {
  id: string
  title?: string
  description?: string
  coverImageUrl?: string
  visibility?: 'PRIVATE' | 'PUBLIC'
  publicUrl?: string
  publishedAt?: string | null
  headline?: string
  about?: string
  desiredRole?: string
  slug: string
  skills?: string[]
  socialLinks?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export type PublicPortfolioExperience = Omit<PortfolioExperience, 'applicantId' | 'coverAssetId' | 'status' | 'visibility'> & {
  status?: ExperienceStatus
  visibility?: ExperienceVisibility
}

export type PublicPortfolioMoment = Omit<PortfolioMoment, 'applicantId' | 'mediaAssetIds' | 'status' | 'visibility'> & {
  status?: MomentStatus
  visibility?: ExperienceVisibility
}

export type PublicPortfolioEvidence = Omit<PortfolioEvidence, 'applicantId' | 'assetId' | 'verificationStatus'> & {
  verificationStatus?: VerificationStatus
}

export interface MomentsByExperience {
  experienceId: string | null
  moments: PortfolioMoment[]
}

export interface PublicPortfolioResponse {
  portfolio: PublicPortfolio
  featuredExperiences?: PublicPortfolioExperience[]
  experiences: PublicPortfolioExperience[]
  moments: PublicPortfolioMoment[]
  momentsByExperience?: Array<{ experienceId: string | null; moments: PublicPortfolioMoment[] }>
  evidence?: PublicPortfolioEvidence[]
}

export interface PortfolioProfileInput {
  headline?: string
  about?: string
  desiredRole?: string
  slug?: string
  skills?: string[]
  socialLinks?: Record<string, string>
}

export interface ExperienceInput {
  type: ExperienceType
  title: string
  organization?: string
  role?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  location?: string
  description?: string
  responsibilities?: string[]
  achievements?: string[]
  skills?: string[]
  visibility?: ExperienceVisibility
}

export interface MomentInput {
  caption?: string
  capturedAt: string
  experienceId?: string | null
  location?: string
  skills?: string[]
  status?: MomentStatus
  visibility?: ExperienceVisibility
}

export interface MomentFilters {
  page?: number
  limit?: number
  experienceId?: string
  status?: MomentStatus
  visibility?: ExperienceVisibility
}

export interface ExperienceFilters {
  page?: number
  limit?: number
  status?: ExperienceStatus
  type?: ExperienceType
  search?: string
}

export interface EvidenceInput {
  type: EvidenceType
  title: string
  description?: string
  url?: string
  verificationStatus?: VerificationStatus
}

export interface ApiErrorItem {
  field?: string
  code?: string
  message?: string
}

export interface BackendApiResponse<TData = unknown> {
  success: boolean
  message: string
  code?: string
  data?: TData
  errors?: ApiErrorItem[]
  pagination?: PaginationMeta
}
