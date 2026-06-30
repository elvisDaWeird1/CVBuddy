import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { AuthShell } from '@/layouts/ClientLayout/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRightIcon, LockIcon, MailIcon, UserIcon } from '@/components/ui/icons'

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

export default function RegisterApplicantPage() {
  const [formMessage, setFormMessage] = useState<string | null>(null)
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

  const onSubmit: SubmitHandler<RegisterApplicantFormValues> = async ({ fullName }) => {
    setFormMessage(`${fullName}'s applicant account details are ready to submit.`)
  }

  return (
    <AuthShell>
      <section className="w-full max-w-[520px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:p-10">
        <div className="mb-10 border-b border-[var(--color-border)] pb-6 text-center">
          <p className="mx-auto mb-4 inline-flex rounded-full bg-[var(--color-bg-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--color-teal)]">
            Applicant account
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">Join CVBuddy</h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">Guided Clarity for Your Career.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Full Name"
            placeholder="Alex Walker"
            autoComplete="name"
            size="lg"
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
            size="lg"
            leftIcon={<MailIcon className="h-5 w-5" />}
            state={errors.email ? 'error' : 'default'}
            error={errors.email?.message}
            className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            size="lg"
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
            placeholder="••••••••"
            autoComplete="new-password"
            size="lg"
            leftIcon={<LockIcon className="h-5 w-5" />}
            state={errors.confirmPassword ? 'error' : 'default'}
            error={errors.confirmPassword?.message}
            className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
            {...register('confirmPassword')}
          />

          {formMessage && (
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--color-teal)]">
              {formMessage}
            </p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-14 w-full rounded-[var(--radius-lg)] text-base font-semibold shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            iconRight={<ArrowRightIcon className="h-5 w-5" />}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-9 text-center text-base text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/login">
            Log in here
          </Link>
        </p>
      </section>
    </AuthShell>
  )
}
