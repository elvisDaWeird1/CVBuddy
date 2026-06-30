import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { AuthShell } from '@/layouts/ClientLayout/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRightIcon, LockIcon, MailIcon, UserIcon } from '@/components/ui/icons'
import { getAuthApiErrorMessage, registerApplicant } from './authApi'
import { saveAuthSession } from './authStorage'

const registerApplicantSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type RegisterApplicantFormValues = z.infer<typeof registerApplicantSchema>
type AuthFormStatus = { type: 'success' | 'error'; message: string }

export default function RegisterApplicantPage() {
  const navigate = useNavigate()
  const [formStatus, setFormStatus] = useState<AuthFormStatus | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterApplicantFormValues>({
    resolver: zodResolver(registerApplicantSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<RegisterApplicantFormValues> = async ({ fullName, email, password }) => {
    setFormStatus(null)

    try {
      const response = await registerApplicant({ fullName, email, password })

      if (!response.success) {
        throw new Error(response.message || 'Unable to create your applicant account.')
      }

      if (response.data?.token) {
        saveAuthSession(response.data)
        navigate('/applicant/profile', { replace: true })
        return
      }

      navigate('/login', {
        replace: true,
        state: { authMessage: response.message || 'Applicant account created. Please sign in.' },
      })
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: getAuthApiErrorMessage(error, 'Unable to create your applicant account. Please try again.'),
      })
    }
  }

  return (
    <AuthShell>
      <section className="w-full max-w-[720px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:p-6">
        <div className="mb-5 border-b border-[var(--color-border)] pb-4 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)]">
            Applicant account
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">Join CVBuddy</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Guided Clarity for Your Career.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Alex Walker"
              autoComplete="name"
              size="md"
              leftIcon={<UserIcon className="h-5 w-5" />}
              state={errors.fullName ? 'error' : 'default'}
              error={errors.fullName?.message}
              className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              autoComplete="email"
              size="md"
              leftIcon={<MailIcon className="h-5 w-5" />}
              state={errors.email ? 'error' : 'default'}
              error={errors.email?.message}
              className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter a password"
              autoComplete="new-password"
              size="md"
              helperText="Must be at least 6 characters long."
              leftIcon={<LockIcon className="h-5 w-5" />}
              state={errors.password ? 'error' : 'default'}
              error={errors.password?.message}
              className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              size="md"
              leftIcon={<LockIcon className="h-5 w-5" />}
              state={errors.confirmPassword ? 'error' : 'default'}
              error={errors.confirmPassword?.message}
              className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              {...register('confirmPassword')}
            />
          </div>

          {formStatus && (
            <p
              className={`rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm font-medium ${
                formStatus.type === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-teal)]'
              }`}
              role={formStatus.type === 'error' ? 'alert' : 'status'}
            >
              {formStatus.message}
            </p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-11 w-full rounded-[var(--radius-lg)] text-base font-semibold shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            iconRight={<ArrowRightIcon className="h-5 w-5" />}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/login">
            Log in here
          </Link>
        </p>
      </section>
    </AuthShell>
  )
}
