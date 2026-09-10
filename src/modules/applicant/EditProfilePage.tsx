import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CameraIcon, GraduationCapIcon, UserIcon } from '@/components/ui/icons'
import { UploadProgress } from '@/components/ui/upload-progress'
import { cn } from '@/utils/cn'
import { compressImageFile, validateImageFile } from '@/utils/imageUpload'
import {
  getApplicantProfile,
  updateApplicantProfile,
  uploadApplicantAvatar,
  type ApplicantProfilePayload,
} from './applicantApi'
import { getAuthApiErrorMessage } from '@/modules/auth/authApi'
import { updateStoredAccount } from '@/modules/auth/authStorage'

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'

const editProfileSchema = z.object({
  fullName: z.string().trim()
    .min(2, 'Name must be between 2 and 100 characters.')
    .max(100, 'Name must be between 2 and 100 characters.'),
  headline: z.string().trim().optional(),
  phone: z.string().trim().refine((value) => !value || /^\d{10,12}$/.test(value), {
    message: 'Phone number must contain 10 to 12 digits.',
  }).optional(),
  location: z.string().trim().optional(),
  university: z.string().trim().optional(),
  major: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  careerGoal: z.string().trim().optional(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

const defaultValues: EditProfileFormValues = {
  fullName: '',
  headline: '',
  phone: '',
  location: '',
  university: '',
  major: '',
  summary: '',
  careerGoal: '',
}

const fieldClass =
  'border-[var(--color-border-hover)] bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]'

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'AP'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function FormCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <span className="text-[var(--color-teal)]">{icon}</span>
        <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function TextAreaField({
  label,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-[var(--color-navy)]" htmlFor={props.id}>{label}</label>
      <textarea
        className={cn(
          'w-full rounded-[var(--radius-lg)] border px-4 py-3 text-base leading-relaxed outline-none transition-all placeholder:text-[var(--color-gray-400)]',
          fieldClass,
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
        )}
        {...props}
      />
      {error ? <p className="text-xs text-[var(--color-error)]">{error}</p> : null}
    </div>
  )
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savedAvatarUrl, setSavedAvatarUrl] = useState('')
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null)
  const [preparingAvatar, setPreparingAvatar] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    defaultValues,
  })
  const currentName = useWatch({ control, name: 'fullName' }) ?? ''

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoadingProfile(true)
      setPageError(null)
      try {
        const profile = await getApplicantProfile()
        if (active) {
          const { avatarUrl, ...values } = profile
          reset(values)
          setSavedAvatarUrl(avatarUrl)
        }
      } catch (error) {
        if (active) setPageError(getAuthApiErrorMessage(error, 'Unable to load your profile for editing.'))
      } finally {
        if (active) setLoadingProfile(false)
      }
    }

    void loadProfile()
    return () => { active = false }
  }, [reset])

  useEffect(() => () => {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
  }, [avatarPreviewUrl])

  const clearAvatarSelection = () => {
    setAvatarFile(null)
    setAvatarPreviewUrl('')
    setAvatarError(null)
    setAvatarProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!file || uploadingAvatar) return

    setAvatarMessage(null)
    const validationError = validateImageFile(file, { maxBytes: MAX_AVATAR_SIZE_BYTES })
    if (validationError) {
      setAvatarError(validationError)
      setAvatarFile(null)
      setAvatarPreviewUrl('')
      return
    }

    setPreparingAvatar(true)
    setAvatarError(null)
    try {
      const compressed = await compressImageFile(file, { maxDimension: 1024, quality: 0.8 })
      setAvatarFile(compressed)
      setAvatarPreviewUrl(URL.createObjectURL(compressed))
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to prepare this image.')
      setAvatarFile(null)
      setAvatarPreviewUrl('')
    } finally {
      setPreparingAvatar(false)
    }
  }

  const confirmAvatarUpload = async () => {
    if (!avatarFile || uploadingAvatar) return
    setUploadingAvatar(true)
    setAvatarProgress(0)
    setAvatarError(null)
    setAvatarMessage(null)

    try {
      const profile = await uploadApplicantAvatar(avatarFile, (progressEvent) => {
        const value = progressEvent.total
          ? (progressEvent.loaded / progressEvent.total) * 100
          : (progressEvent.progress ?? 0) * 100
        setAvatarProgress(Math.min(99, Math.round(value)))
      })
      setAvatarProgress(100)
      setSavedAvatarUrl(profile.avatarUrl)
      updateStoredAccount({ avatarUrl: profile.avatarUrl, fullName: profile.fullName || currentName })
      clearAvatarSelection()
      setAvatarMessage('Profile photo updated successfully.')
    } catch (error) {
      setAvatarError(getAuthApiErrorMessage(error, 'Unable to upload your profile photo.'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onSubmit: SubmitHandler<EditProfileFormValues> = async (values) => {
    setFormError(null)
    const payload: ApplicantProfilePayload = {
      fullName: values.fullName,
      phone: values.phone || '',
      university: values.university || '',
      major: values.major || '',
      location: values.location || '',
      headline: values.headline || '',
      summary: values.summary || '',
      careerGoal: values.careerGoal || '',
    }

    try {
      const profile = await updateApplicantProfile(payload)
      updateStoredAccount({ fullName: profile.fullName, avatarUrl: profile.avatarUrl || savedAvatarUrl })
      navigate('/profile', { replace: true, state: { profileMessage: 'Profile updated successfully.' } })
    } catch (error) {
      setFormError(getAuthApiErrorMessage(error, 'Unable to update your profile.'))
    }
  }

  const displayAvatarUrl = avatarPreviewUrl || savedAvatarUrl
  const avatarFailed = Boolean(displayAvatarUrl && failedAvatarUrl === displayAvatarUrl)

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8 space-y-5">
        <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
          <Link className="flex items-center gap-2 hover:text-[var(--color-teal)]" to="/profile"><UserIcon className="h-4 w-4" />Profile</Link>
          <span aria-hidden="true">/</span><span className="text-[var(--color-text-primary)]">Edit Profile</span>
        </nav>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">Edit Profile</h1>
            <p className="mt-2 text-base text-[var(--color-text-secondary)]">Keep your applicant details and profile photo current.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile"><Button type="button" variant="secondary">Cancel</Button></Link>
            <Button type="submit" form="edit-profile-form" loading={isSubmitting || loadingProfile} disabled={!isValid || loadingProfile}>Save Changes</Button>
          </div>
        </div>
        {pageError ? <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]" role="alert">{pageError}</p> : null}
        {formError ? <p className="rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]" role="alert">{formError}</p> : null}
      </header>

      <form id="edit-profile-form" className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          <FormCard title="Personal Information" icon={<UserIcon className="h-6 w-6" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <Input autoComplete="name" label="Name" maxLength={100} placeholder="Your full name" size="lg" state={errors.fullName ? 'error' : 'default'} error={errors.fullName?.message} className={fieldClass} {...register('fullName')} />
              <Input label="Professional Headline" size="lg" state={errors.headline ? 'error' : 'default'} error={errors.headline?.message} className={fieldClass} {...register('headline')} />
              <Input autoComplete="tel" inputMode="numeric" label="Phone" maxLength={12} placeholder="10 to 12 digits" size="lg" state={errors.phone ? 'error' : 'default'} error={errors.phone?.message} className={fieldClass} {...register('phone')} />
              <Input label="Location" size="lg" state={errors.location ? 'error' : 'default'} error={errors.location?.message} className={fieldClass} {...register('location')} />
              <TextAreaField id="summary" label="Bio / Summary" rows={5} className="md:col-span-2" error={errors.summary?.message} {...register('summary')} />
              {/* <TextAreaField id="careerGoal" label="Career Goal" rows={4} className="md:col-span-2" error={errors.careerGoal?.message} {...register('careerGoal')} /> */}
            </div>
          </FormCard>

          {/* <FormCard title="Education" icon={<GraduationCapIcon className="h-6 w-6" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="University" size="lg" state={errors.university ? 'error' : 'default'} error={errors.university?.message} className={fieldClass} {...register('university')} />
              <Input label="Major" size="lg" state={errors.major ? 'error' : 'default'} error={errors.major?.message} className={fieldClass} {...register('major')} />
            </div>
          </FormCard> */}
        </div>

        <aside>
          <FormCard title="Profile Photo" icon={<CameraIcon className="h-6 w-6" />}>
            <div className="flex flex-col items-center text-center" aria-busy={preparingAvatar || uploadingAvatar}>
              <button
                aria-label="Choose a new profile photo"
                className="group relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--color-white)] bg-[var(--color-bg-soft)] text-4xl font-bold text-[var(--color-teal)] shadow-[var(--shadow-md)] focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2"
                disabled={preparingAvatar || uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {displayAvatarUrl && !avatarFailed ? (
                  <img alt={`${currentName || 'Applicant'} avatar`} className="h-full w-full object-cover" onError={() => setFailedAvatarUrl(displayAvatarUrl)} src={displayAvatarUrl} />
                ) : getInitials(currentName)}
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-[var(--color-navy)]/65 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <CameraIcon className="h-5 w-5" />Change photo
                </span>
              </button>
              <input ref={fileInputRef} className="sr-only" type="file" accept={AVATAR_ACCEPT} disabled={preparingAvatar || uploadingAvatar} onChange={(event) => void handleAvatarChange(event)} />
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">JPEG, PNG or WebP · maximum 5 MB. Click the avatar to choose an image.</p>

              {preparingAvatar ? <p className="mt-4 text-sm font-medium text-[var(--color-teal)]" role="status">Preparing image preview…</p> : null}
              {avatarError ? <p className="mt-4 w-full rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]" role="alert">{avatarError}</p> : null}
              {avatarMessage ? <p className="mt-4 w-full rounded-[var(--radius-lg)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]" role="status">{avatarMessage}</p> : null}
              {uploadingAvatar ? <UploadProgress className="mt-4 w-full" label="Uploading photo" value={avatarProgress} /> : null}

              {avatarFile ? (
                <div className="mt-5 grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Button type="button" loading={uploadingAvatar} disabled={preparingAvatar} onClick={() => void confirmAvatarUpload()}>Confirm upload</Button>
                  <Button type="button" variant="secondary" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()}>Choose another</Button>
                  <Button className="sm:col-span-2 lg:col-span-1 xl:col-span-2" type="button" variant="ghost" disabled={uploadingAvatar} onClick={clearAvatarSelection}>Cancel preview</Button>
                </div>
              ) : null}
            </div>
          </FormCard>
        </aside>
      </form>
    </main>
  )
}
