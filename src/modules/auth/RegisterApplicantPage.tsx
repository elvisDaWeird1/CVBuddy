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
<<<<<<< HEAD
      <section className="w-full max-w-[520px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:p-10">
        <div className="mb-10 border-b border-[var(--color-border)] pb-6 text-center">
          <p className="mx-auto mb-4 inline-flex rounded-full bg-[var(--color-bg-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--color-teal)]">
            Applicant account
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">Join CVBuddy</h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">Guided Clarity for Your Career.</p>
=======
      <section className="relative z-10 w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-[0_4px_20px_rgba(33,150,243,0.08)] transition-shadow hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)] sm:p-6">
        <div className="mb-5 border-b border-[#e1e3e4] pb-4 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full bg-[#e3f2fd] px-3 py-1 text-xs font-semibold text-[#0061a4]">
            Applicant account
          </p>
          <h1 className="text-[28px] font-bold leading-tight tracking-normal text-[#191c1d]">Join CVBuddy</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#526069]">Guided Clarity for Your Career.</p>
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          {formMessage && (
            <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--color-teal)]">
              {formMessage}
            </p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
<<<<<<< HEAD
            className="h-14 w-full rounded-[var(--radius-lg)] text-base font-semibold shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
=======
            className="h-11 w-full rounded-[12px] bg-[#2196f3] text-base font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#0061a4] hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)]"
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
            iconRight={<ArrowRightIcon className="h-5 w-5" />}
          >
            Create Account
          </Button>
        </form>

<<<<<<< HEAD
        <p className="mt-9 text-center text-base text-[var(--color-text-secondary)]">
=======
        <p className="mt-5 text-center text-sm text-[#526069]">
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
          Already have an account?{' '}
          <Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/login">
            Log in here
          </Link>
        </p>
      </section>
    </AuthShell>
  )
}
