import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DownloadIcon, EyeIcon, FileTextIcon, TrashIcon, UploadIcon } from '@/components/ui/icons'
import { Select } from '@/components/ui/select'
import { UploadProgress } from '@/components/ui/upload-progress'
import { cn } from '@/utils/cn'
import { getAuthApiErrorCode, getAuthApiErrorMessage } from '@/modules/auth/authApi'
import { getAuthToken } from '@/modules/auth/authStorage'
import {
  deleteCv,
  downloadCv,
  getMyCvs,
  previewCv,
  uploadCv,
  type CvDocument,
  type CvLanguage,
} from './cvApi'

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_CV_MIME_BY_EXTENSION: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword', 'application/octet-stream'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
}
const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const languageOptions = [
  { value: 'VI', label: 'Vietnamese' },
  { value: 'EN', label: 'English' },
]

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : ''
}

function validateCvFile(file: File | null) {
  if (!file || file.size <= 0) return 'Choose a valid CV file before uploading.'

  const extension = getFileExtension(file.name)
  const allowedMimeTypes = ALLOWED_CV_MIME_BY_EXTENSION[extension]
  const hasAllowedMime = file.type ? allowedMimeTypes?.includes(file.type) : true

  if (!allowedMimeTypes || !hasAllowedMime) {
    return 'Only PDF, DOC and DOCX CV files are supported.'
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return 'CV file size must not exceed 5 MB.'
  }

  return undefined
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return 'Size unavailable'
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value?: string) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatFileType(cv: CvDocument) {
  const value = `${cv.fileType} ${cv.mimeType} ${cv.originalName}`.toLowerCase()
  if (value.includes('pdf')) return 'PDF'
  if (value.includes('docx') || value.includes('wordprocessingml')) return 'DOCX'
  if (value.includes('doc') || value.includes('msword')) return 'DOC'
  return cv.fileType?.toUpperCase() || 'FILE'
}

function isPdf(cv: CvDocument) {
  return formatFileType(cv) === 'PDF'
}

function getDownloadName(cv: CvDocument) {
  if (cv.originalName) return cv.originalName
  const type = formatFileType(cv)
  const extension = type === 'PDF' ? '.pdf' : type === 'DOCX' ? '.docx' : type === 'DOC' ? '.doc' : ''
  return getFileExtension(cv.title) ? cv.title : `${cv.title || 'cv'}${extension}`
}

function Notice({ children, tone }: { children: ReactNode; tone: 'error' | 'success' }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] px-4 py-3 text-sm font-medium',
        tone === 'error'
          ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
          : 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

function CvActionButton({
  children,
  label,
  disabled,
  loading,
  onClick,
}: {
  children: ReactNode
  label: string
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}) {
  const className = cn(
    'inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2',
    disabled
      ? 'cursor-not-allowed border-[var(--color-border)] bg-[var(--color-gray-100)] text-[var(--color-text-muted)] opacity-60'
      : 'border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-text-secondary)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]',
  )

  return (
    <button
      aria-label={label}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function CvListItem({
  cv,
  busyAction,
  deleting,
  onDownload,
  onDelete,
  onPreview,
}: {
  cv: CvDocument
  busyAction: 'preview' | 'download' | null
  deleting: boolean
  onDownload: (cv: CvDocument) => void
  onDelete: (cv: CvDocument) => void
  onPreview: (cv: CvDocument) => void
}) {
  const type = formatFileType(cv)
  const status = cv.status?.trim() || 'Available'

  return (
    <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
          <FileTextIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[var(--color-text-primary)]">{cv.title || 'Untitled CV'}</h3>
            <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-teal)]">{status}</span>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {cv.language} · {type} · {formatFileSize(cv.fileSize)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Uploaded {formatDate(cv.uploadedAt || cv.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CvActionButton
            disabled={cv.previewAvailable === false || !isPdf(cv)}
            label={isPdf(cv) ? `Preview ${cv.title}` : `Preview is unavailable for ${type} files`}
            loading={busyAction === 'preview'}
            onClick={() => onPreview(cv)}
          >
            <EyeIcon className="h-4 w-4" />
          </CvActionButton>
          <CvActionButton
            disabled={cv.downloadAvailable === false}
            label={`Download ${cv.title}`}
            loading={busyAction === 'download'}
            onClick={() => onDownload(cv)}
          >
            <DownloadIcon className="h-4 w-4" />
          </CvActionButton>
          <Button
            aria-label={`Delete ${cv.title}`}
            className="h-9 w-9 px-0"
            disabled={deleting}
            loading={deleting}
            onClick={() => onDelete(cv)}
            size="sm"
            title={`Delete ${cv.title}`}
            type="button"
            variant="ghost"
          >
            {!deleting ? <TrashIcon className="h-4 w-4 text-[var(--color-error)]" /> : null}
          </Button>
        </div>
      </div>
    </li>
  )
}

export default function CvPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const requestId = useRef(0)
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [language, setLanguage] = useState<CvLanguage>('VI')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busyCvAction, setBusyCvAction] = useState<{ id: string; type: 'preview' | 'download' } | null>(null)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const loadCvs = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoadingCvs(true)
    setListError(null)

    try {
      const nextCvs = await getMyCvs()
      if (currentRequest === requestId.current) setCvs(nextCvs)
    } catch (error) {
      if (currentRequest === requestId.current) {
        setListError(getAuthApiErrorMessage(error, 'Unable to load your CV documents.'))
      }
    } finally {
      if (currentRequest === requestId.current) setLoadingCvs(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCvs() }, 0)
    return () => {
      window.clearTimeout(timer)
      requestId.current += 1
    }
  }, [loadCvs])

  const selectFile = (file: File | null) => {
    if (isUploading) return
    setMessage(null)
    setUploadProgress(0)
    const validationError = validateCvFile(file)
    setFileError(validationError ?? null)

    if (validationError) {
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0] ?? null)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (!isUploading) selectFile(event.dataTransfer.files?.[0] ?? null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isUploading) return
    setMessage(null)

    if (!getAuthToken()) {
      navigate('/login', { replace: true, state: { authMessage: 'Please sign in before uploading a CV.' } })
      return
    }

    const validationError = validateCvFile(selectedFile)
    setFileError(validationError ?? null)
    if (validationError || !selectedFile || !language) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const cv = await uploadCv(
        {
          file: selectedFile,
          language,
        },
        {
          onUploadProgress: (progressEvent) => {
            const value = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : (progressEvent.progress ?? 0) * 100
            setUploadProgress(Math.min(99, Math.round(value)))
          },
        },
      )

      setUploadProgress(100)
      setCvs((current) => [cv, ...current.filter((item) => item.id !== cv.id)])
      setSelectedFile(null)
      setFileError(null)
      setMessage({ tone: 'success', text: `${cv.title} uploaded successfully.` })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      setMessage({ tone: 'error', text: getAuthApiErrorMessage(error, 'Unable to upload your CV.') })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (cv: CvDocument) => {
    if (deletingId || !window.confirm(`Delete "${cv.title}"? This action cannot be undone.`)) return
    setDeletingId(cv.id)
    setMessage(null)

    try {
      await deleteCv(cv.id)
      setCvs((current) => current.filter((item) => item.id !== cv.id))
      setMessage({ tone: 'success', text: `${cv.title} was deleted.` })
    } catch (error) {
      const text = getAuthApiErrorCode(error) === 'CV_IN_USE'
        ? 'This CV is used by one or more AI results and cannot be deleted.'
        : getAuthApiErrorMessage(error, 'Unable to delete this CV.')
      setMessage({ tone: 'error', text })
    } finally {
      setDeletingId(null)
    }
  }

  const handlePreview = async (cv: CvDocument) => {
    if (busyCvAction || !isPdf(cv) || cv.previewAvailable === false) return
    const previewWindow = window.open('', '_blank')
    if (!previewWindow) {
      setMessage({ tone: 'error', text: 'Allow pop-ups to preview this PDF.' })
      return
    }

    setBusyCvAction({ id: cv.id, type: 'preview' })
    setMessage(null)
    try {
      const blob = await previewCv(cv.id)
      const objectUrl = URL.createObjectURL(blob)
      previewWindow.opener = null
      previewWindow.location.href = objectUrl
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
      previewWindow.close()
      setMessage({ tone: 'error', text: getAuthApiErrorMessage(error, 'Unable to preview this CV.') })
    } finally {
      setBusyCvAction(null)
    }
  }

  const handleDownload = async (cv: CvDocument) => {
    if (busyCvAction || cv.downloadAvailable === false) return
    setBusyCvAction({ id: cv.id, type: 'download' })
    setMessage(null)
    try {
      const { blob, fileName } = await downloadCv(cv.id)
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName || getDownloadName(cv)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      setMessage({ tone: 'error', text: getAuthApiErrorMessage(error, 'Unable to download this CV.') })
    } finally {
      setBusyCvAction(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <nav className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
          <Link className="hover:text-[var(--color-teal)]" to="/profile">Profile</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">My CVs</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--color-text-primary)] sm:text-4xl">My CVs</h1>
      </header>

      <Card className="mb-8 overflow-hidden shadow-[var(--shadow-md)]">
        <CardHeader className="sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UploadIcon className="h-5 w-5 text-[var(--color-teal)]" />
              Upload a CV
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">PDF, DOC or DOCX · up to 5 MB · the file name becomes the CV title.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
              <div>
                <div
                  className={cn(
                    'flex min-h-28 items-center gap-4 rounded-[var(--radius-lg)] border-2 border-dashed p-4 transition-colors',
                    isDragging
                      ? 'border-[var(--color-teal)] bg-[var(--color-bg-soft)]'
                      : 'border-[var(--color-border-hover)] bg-[var(--color-bg-main)]',
                    isUploading && 'cursor-not-allowed opacity-60',
                  )}
                  onDragEnter={(event) => { event.preventDefault(); if (!isUploading) setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {selectedFile?.name || 'Drop a CV here or choose a file'}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {selectedFile ? formatFileSize(selectedFile.size) : 'PDF, DOC and DOCX only'}
                    </p>
                    <button
                      className="mt-2 text-sm font-semibold text-[var(--color-teal)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      {selectedFile ? 'Choose another file' : 'Browse files'}
                    </button>
                    <input
                      accept={CV_ACCEPT}
                      className="sr-only"
                      disabled={isUploading}
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      type="file"
                    />
                  </div>
                </div>
                {fileError ? <p className="mt-2 text-xs text-[var(--color-error)]" role="alert">{fileError}</p> : null}
              </div>

              <Select
                disabled={isUploading}
                label="Language"
                onChange={(event) => setLanguage(event.target.value as CvLanguage)}
                options={languageOptions}
                value={language}
              />

              <Button
                className="w-full lg:w-auto"
                disabled={!selectedFile || Boolean(fileError) || isUploading}
                iconLeft={<UploadIcon className="h-4 w-4" />}
                loading={isUploading}
                type="submit"
              >
                Upload CV
              </Button>
            </div>

            {isUploading ? <UploadProgress label="Uploading CV" value={uploadProgress} /> : null}
            {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="cv-list-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold" id="cv-list-heading">Saved CVs</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Preview PDFs, download source files, or remove records you no longer need.</p>
          </div>
          {!loadingCvs && !listError ? <span className="text-sm font-medium text-[var(--color-text-secondary)]">{cvs.length} CV{cvs.length === 1 ? '' : 's'}</span> : null}
        </div>

        {loadingCvs ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <span className="sr-only">Loading CV documents</span>
            {[1, 2, 3].map((item) => <div className="h-28 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-gray-100)]" key={item} />)}
          </div>
        ) : listError ? (
          <Card>
            <CardContent className="space-y-4 py-8">
              <Notice tone="error">{listError}</Notice>
              <Button onClick={() => void loadCvs()} size="sm" type="button" variant="secondary">Try again</Button>
            </CardContent>
          </Card>
        ) : cvs.length ? (
          <ul className="space-y-3">
            {cvs.map((cv) => (
              <CvListItem
                busyAction={busyCvAction?.id === cv.id ? busyCvAction.type : null}
                cv={cv}
                deleting={deletingId === cv.id}
                key={cv.id}
                onDelete={(item) => void handleDelete(item)}
                onDownload={(item) => void handleDownload(item)}
                onPreview={(item) => void handlePreview(item)}
              />
            ))}
          </ul>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <FileTextIcon className="mx-auto h-10 w-10 text-[var(--color-teal)]" />
              <h3 className="mt-3 text-lg font-semibold">No CVs yet</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Use the upload panel above to add your first CV.</p>
              <Button className="mt-4" onClick={() => fileInputRef.current?.click()} size="sm" type="button">Choose a CV</Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}
