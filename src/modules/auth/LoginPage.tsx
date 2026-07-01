import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRightIcon, LockIcon, MailIcon } from '@/components/ui/icons'
import { getAuthApiErrorMessage, login } from './authApi'
import { saveAuthSession } from './authStorage'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>
type AuthFormStatus = { type: 'success' | 'error'; message: string }
type LoginLocationState = { authMessage?: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialMessage =
    typeof (location.state as LoginLocationState | null)?.authMessage === 'string'
      ? (location.state as LoginLocationState).authMessage
      : null
  const [formStatus, setFormStatus] = useState<AuthFormStatus | null>(
    initialMessage ? { type: 'success', message: initialMessage } : null,
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async ({ email, password }) => {
    setFormStatus(null)

    try {
      const response = await login({ email, password })

      if (!response.success || !response.data?.token) {
        throw new Error(response.message || 'Unable to sign in. Please check your credentials.')
      }

      saveAuthSession(response.data)
      navigate('/profile', { replace: true })
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: getAuthApiErrorMessage(error, 'Unable to sign in. Please try again.'),
      })
    }
  }

  return (
    <>
      <section className="w-full max-w-[420px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-lg)] sm:p-6">
        <div className="mb-5 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-teal)]">CVBuddy</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Guided Clarity for Your Career.</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-normal text-[var(--color-text-primary)]">Welcome back!</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Please enter your details to sign in.</p>
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="hello@example.com"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            size="md"
            leftIcon={<LockIcon className="h-5 w-5" />}
            state={errors.password ? 'error' : 'default'}
            error={errors.password?.message}
            className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
            {...register('password')}
          />

          <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-gray-500)] text-[var(--color-teal)] focus:ring-[var(--color-teal)]"
              {...register('remember')}
            />
            Remember me for 30 days
          </label>

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
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </>
  )
}
