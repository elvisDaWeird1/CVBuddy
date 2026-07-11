import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileTextIcon, UploadIcon } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { getAuthApiErrorMessage } from '@/modules/auth/authApi'
import { getAuthToken } from '@/modules/auth/authStorage'
import { getMyCvs, uploadCv, type CvDocument, type CvLanguage } from './cvApi'

const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_CV_EXTENSIONS = ['.pdf', '.docx']
const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const languageOptions = [
  { value: 'VI', label: 'Vietnamese' },
  { value: 'EN', label: 'English' },
]

const fieldClass =
  'border-[var(--color-border-hover)] bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]'

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : ''
}

function validateCvFile(file: File | null) {
  if (!file) {
    return 'Choose a CV file before uploading.'
  }

  const extension = getFileExtension(file.name)

  if (!ALLOWED_CV_EXTENSIONS.includes(extension)) {
    return 'Only PDF and DOCX CV files are allowed.'
  }

  if (file.type && !ALLOWED_CV_MIME_TYPES.includes(file.type)) {
    return 'Only PDF and DOCX CV files are allowed.'
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return 'CV file must be 10MB or smaller.'
  }

  return null
}

function titleFromFile(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '').trim().slice(0, 150)
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return 'Unknown size'
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value?: string) {
  if (!value) {
    return 'Recently uploaded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently uploaded'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function AlertMessage({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'error' | 'success'
}) {
  return (
    <p
      className={cn(
        'rounded-[var(--radius-lg)] px-4 py-3 text-sm font-medium',
        tone === 'error'
          ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
          : 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}

function CvListItem({ cv }: { cv: CvDocument }) {
  return (
    <li className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
          <FileTextIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-normal text-[var(--color-text-primary)]">
            {cv.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {cv.fileType.toUpperCase()} - {formatFileSize(cv.fileSize)} - {cv.language}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDate(cv.uploadedAt)}</p>
        </div>
        <a
          className="shrink-0 text-sm font-semibold text-[var(--color-teal)] hover:underline"
          href={cv.fileUrl}
          rel="noreferrer"
          target="_blank"
        >
          View
        </a>
      </div>
    </li>
  )
}

export default function CvPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cvs, setCvs] = useState<CvDocument[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [language, setLanguage] = useState<CvLanguage>('VI')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formMessage, setFormMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [uploadedCv, setUploadedCv] = useState<CvDocument | null>(null)

  useEffect(() => {
    let active = true

    async function loadCvs() {
      setLoadingCvs(true)
      setListError(null)

      try {
        const nextCvs = await getMyCvs()

        if (active) {
          setCvs(nextCvs)
        }
      } catch (error) {
        if (active) {
          setListError(getAuthApiErrorMessage(error, 'Unable to load your CV documents.'))
        }
      } finally {
        if (active) {
          setLoadingCvs(false)
        }
      }
    }

    void loadCvs()

    return () => {
      active = false
    }
  }, [navigate])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setUploadedCv(null)
    setFormMessage(null)

    const nextFileError = validateCvFile(file)
    setFileError(nextFileError)

    if (file && !title.trim()) {
      setTitle(titleFromFile(file.name))
      setTitleError(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormMessage(null)

    if (!getAuthToken()) {
      navigate('/login', {
        replace: true,
        state: { authMessage: 'Please sign in before uploading a CV.' },
      })
      return
    }

    const trimmedTitle = title.trim()
    const nextTitleError = !trimmedTitle
      ? 'CV title is required.'
      : trimmedTitle.length > 150
        ? 'CV title must be 150 characters or fewer.'
        : null
    const nextFileError = validateCvFile(selectedFile)

    setTitleError(nextTitleError)
    setFileError(nextFileError)

    if (nextTitleError || nextFileError || !selectedFile) {
      return
    }

    setIsUploading(true)

    try {
      const cv = await uploadCv({
        file: selectedFile,
        title: trimmedTitle,
        language,
      })

      setUploadedCv(cv)
      setCvs((currentCvs) => [cv, ...currentCvs.filter((item) => item.id !== cv.id)])
      setFormMessage({ tone: 'success', text: 'CV uploaded successfully.' })
      setTitle('')
      setSelectedFile(null)
      setFileError(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setFormMessage({
        tone: 'error',
        text: getAuthApiErrorMessage(error, 'Unable to upload your CV.'),
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <Link className="hover:text-[var(--color-teal)]" to="/profile">
            Profile
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">CV</span>
        </nav>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">CV</h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
              Upload a PDF or DOCX CV to keep your applicant workspace current.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UploadIcon className="h-5 w-5 text-[var(--color-teal)]" />
              Upload CV
            </CardTitle>
            <CardDescription>PDF or DOCX, max 10MB.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-5">
              <Input
                className={fieldClass}
                error={titleError ?? undefined}
                label="CV title"
                maxLength={150}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setTitleError(null)
                  setFormMessage(null)
                }}
                placeholder="My Backend Developer CV"
                size="lg"
                state={titleError ? 'error' : 'default'}
                value={title}
              />

              <Select
                className={fieldClass}
                label="Language"
                onChange={(event) => setLanguage(event.target.value as CvLanguage)}
                options={languageOptions}
                size="lg"
                value={language}
              />

              <Input
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className={fieldClass}
                error={fileError ?? undefined}
                helperText="PDF or DOCX, max 10MB."
                label="CV file"
                onChange={handleFileChange}
                ref={fileInputRef}
                size="lg"
                state={fileError ? 'error' : 'default'}
                type="file"
              />

              {selectedFile ? (
                <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-main)] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : null}

              {formMessage ? <AlertMessage tone={formMessage.tone}>{formMessage.text}</AlertMessage> : null}

              {uploadedCv ? (
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[var(--color-success-bg)] p-4">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{uploadedCv.title}</p>
                  <a
                    className="mt-2 inline-flex text-sm font-semibold text-[var(--color-teal)] hover:underline"
                    href={uploadedCv.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View uploaded CV
                  </a>
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">Saved through backend CV management.</p>
              <Button
                className="h-10 rounded-[var(--radius-md)] px-5 text-sm font-semibold"
                iconLeft={<UploadIcon className="h-4 w-4" />}
                loading={isUploading}
                type="submit"
              >
                Upload CV
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileTextIcon className="h-5 w-5 text-[var(--color-teal)]" />
              Uploaded CVs
            </CardTitle>
            <CardDescription>Current CV records.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCvs ? (
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] px-4 py-6 text-sm text-[var(--color-text-secondary)]">
                Loading CV documents...
              </div>
            ) : listError ? (
              <div className="space-y-3">
                <AlertMessage tone="error">{listError}</AlertMessage>
                <Button type="button" variant="secondary" size="sm" onClick={() => navigate(0)}>
                  Retry
                </Button>
              </div>
            ) : cvs.length > 0 ? (
              <ul className="space-y-3">
                {cvs.map((cv) => (
                  <CvListItem cv={cv} key={cv.id} />
                ))}
              </ul>
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] px-4 py-8 text-center">
                <FileTextIcon className="mx-auto h-8 w-8 text-[var(--color-teal)]" />
                <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">No CV uploaded yet.</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Your first uploaded CV will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
