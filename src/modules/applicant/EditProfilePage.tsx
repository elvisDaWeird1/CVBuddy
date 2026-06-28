import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BriefcaseIcon, EditIcon, GraduationCapIcon, LinkIcon, PlusIcon, UserIcon, XIcon } from '@/components/ui/icons'
import { applicantProfile, educationItems, experienceItems } from './profileData'
import { cn } from '@/utils/cn'

const editProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.'),
  headline: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  university: z.string().trim().optional(),
  major: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  careerGoal: z.string().trim().optional(),
  avatarUrl: z.string().trim().url('Enter a valid image URL.').or(z.literal('')).optional(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

const fieldClass =
  'border-[#bfc7d4] bg-[#f8f9fa] text-base focus:border-[#2196f3] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.2)]'

function FormCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] bg-white p-6 shadow-[0_4px_20px_rgba(33,150,243,0.08)] transition-shadow hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)]">
      <div className="mb-6 flex items-center gap-3 border-b border-[#e3f2fd] pb-4">
        <span className="text-[#2196f3]">{icon}</span>
        <h2 className="text-2xl font-semibold tracking-normal text-[#191c1d]">{title}</h2>
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
      <label className="block text-sm font-semibold text-[#404752]" htmlFor={props.id}>
        {label}
      </label>
      <textarea
        className={cn(
          'w-full rounded-[8px] border px-4 py-3 text-base leading-relaxed text-[#191c1d] outline-none transition-all placeholder:text-[#707883]',
          fieldClass,
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}

export default function EditProfilePage() {
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: applicantProfile.fullName,
      headline: applicantProfile.headline,
      phone: applicantProfile.phone,
      location: applicantProfile.location,
      university: applicantProfile.university,
      major: applicantProfile.major,
      summary: applicantProfile.summary,
      careerGoal: applicantProfile.careerGoal,
      avatarUrl: '',
    },
  })

  const onSubmit: SubmitHandler<EditProfileFormValues> = async ({ fullName }) => {
    setFormMessage(`${fullName}'s profile details have been validated.`)
  }

  return (
    <ApplicantShell>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 space-y-5">
          <nav className="flex items-center gap-2 text-sm font-medium text-[#526069]">
            <Link className="flex items-center gap-2 hover:text-[#0061a4]" to="/applicant/profile">
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
            <span>/</span>
            <span className="text-[#191c1d]">Edit Profile</span>
          </nav>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[36px] font-bold leading-tight tracking-normal text-[#191c1d] sm:text-[40px]">Edit Profile</h1>
              <p className="mt-2 text-base leading-relaxed text-[#526069]">
                Update your professional details to keep your applications strong.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/applicant/profile"
                className="inline-flex h-10 items-center justify-center rounded-[8px] border-2 border-[#0061a4] bg-white px-5 text-sm font-semibold text-[#0061a4] transition-colors hover:bg-[#e3f2fd]"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                form="edit-profile-form"
                loading={isSubmitting}
                className="h-10 rounded-[8px] bg-[#2196f3] px-5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-[#0061a4]"
              >
                Save Changes
              </Button>
            </div>
          </div>
          {formMessage && (
            <p className="rounded-[12px] bg-[#e3f2fd] px-4 py-3 text-sm font-medium text-[#00497d]">
              {formMessage}
            </p>
          )}
        </div>

        <form id="edit-profile-form" className="grid gap-6 lg:grid-cols-[2fr_1fr]" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-6">
            <FormCard title="Personal Information" icon={<UserIcon className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Full Name"
                  size="lg"
                  state={errors.fullName ? 'error' : 'default'}
                  error={errors.fullName?.message}
                  className={fieldClass}
                  {...register('fullName')}
                />
                <Input
                  label="Professional Headline"
                  size="lg"
                  state={errors.headline ? 'error' : 'default'}
                  error={errors.headline?.message}
                  className={fieldClass}
                  {...register('headline')}
                />
                <Input
                  label="Phone"
                  size="lg"
                  state={errors.phone ? 'error' : 'default'}
                  error={errors.phone?.message}
                  className={fieldClass}
                  {...register('phone')}
                />
                <Input
                  label="Location"
                  size="lg"
                  state={errors.location ? 'error' : 'default'}
                  error={errors.location?.message}
                  className={fieldClass}
                  {...register('location')}
                />
                <TextAreaField
                  id="summary"
                  label="Bio / Summary"
                  rows={5}
                  className="md:col-span-2"
                  error={errors.summary?.message}
                  {...register('summary')}
                />
                <TextAreaField
                  id="careerGoal"
                  label="Career Goal"
                  rows={4}
                  className="md:col-span-2"
                  error={errors.careerGoal?.message}
                  {...register('careerGoal')}
                />
              </div>
            </FormCard>

            <FormCard title="Education" icon={<GraduationCapIcon className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="University"
                  size="lg"
                  state={errors.university ? 'error' : 'default'}
                  error={errors.university?.message}
                  className={fieldClass}
                  {...register('university')}
                />
                <Input
                  label="Major"
                  size="lg"
                  state={errors.major ? 'error' : 'default'}
                  error={errors.major?.message}
                  className={fieldClass}
                  {...register('major')}
                />
              </div>
              <div className="mt-5 space-y-4">
                {educationItems.map((item) => (
                  <article key={item.degree} className="rounded-[8px] border border-[#bfc7d4] bg-[#f8f9fa] p-4">
                    <h3 className="font-semibold text-[#191c1d]">{item.degree}</h3>
                    <p className="mt-1 text-[#404752]">
                      {item.school} • {item.dates}
                    </p>
                    <p className="mt-2 text-[#404752]">{item.note}</p>
                  </article>
                ))}
              </div>
            </FormCard>

            <FormCard title="Experience" icon={<BriefcaseIcon className="h-6 w-6" />}>
              <div className="space-y-4">
                {experienceItems.map((item) => (
                  <article key={`${item.role}-${item.company}`} className="rounded-[8px] border border-[#bfc7d4] bg-[#f8f9fa] p-4">
                    <h3 className="font-semibold text-[#191c1d]">{item.role}</h3>
                    <p className="mt-1 text-[#404752]">
                      {item.company} • {item.dates}
                    </p>
                    <p className="mt-2 text-[#404752]">{item.bullets[0]}</p>
                  </article>
                ))}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e3f2fd] px-4 py-2 text-sm font-semibold text-[#0061a4] transition-colors hover:bg-[#d1e4ff]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Experience
                </button>
              </div>
            </FormCard>
          </div>

          <aside className="space-y-6">
            <FormCard title="Profile Photo" icon={<EditIcon className="h-6 w-6" />}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#d1e4ff] bg-[#e3f2fd] text-4xl font-bold text-[#0061a4]">
                  {applicantProfile.initials}
                </div>
                <button type="button" className="mt-4 font-semibold text-[#0061a4] hover:underline">
                  Change Photo
                </button>
                <p className="mt-2 text-sm text-[#526069]">JPG, GIF or PNG. Max size of 5MB.</p>
                <Input
                  label="Avatar URL"
                  placeholder="https://example.com/avatar.jpg"
                  size="lg"
                  state={errors.avatarUrl ? 'error' : 'default'}
                  error={errors.avatarUrl?.message}
                  className={cn('mt-4', fieldClass)}
                  {...register('avatarUrl')}
                />
              </div>
            </FormCard>

            <FormCard title="Skills" icon={<UserIcon className="h-6 w-6" />}>
              <div className="flex flex-wrap gap-2">
                {applicantProfile.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full bg-[#e3f2fd] px-3 py-1.5 text-sm font-semibold text-[#0061a4]"
                  >
                    {skill}
                    <button type="button" className="hover:text-[var(--color-error)]" aria-label={`Remove ${skill}`}>
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#0061a4] px-3 py-1.5 text-sm font-semibold text-[#0061a4] hover:bg-[#e3f2fd]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Skill
                </button>
              </div>
            </FormCard>

            <FormCard title="Links" icon={<LinkIcon className="h-6 w-6" />}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-[8px] border border-[#bfc7d4] bg-[#f8f9fa] px-3 py-3 text-[#404752]">
                  <LinkIcon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{applicantProfile.portfolioUrl}</span>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#0061a4] px-3 py-2 text-sm font-semibold text-[#0061a4] hover:bg-[#e3f2fd]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Link
                </button>
              </div>
            </FormCard>
          </aside>
        </form>
      </div>
    </ApplicantShell>
  )
}
