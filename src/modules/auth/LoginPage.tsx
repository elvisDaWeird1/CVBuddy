import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { AuthShell } from '@/layouts/ClientLayout/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRightIcon, LockIcon, MailIcon } from '@/components/ui/icons'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [formMessage, setFormMessage] = useState<string | null>(null)
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

  const onSubmit: SubmitHandler<LoginFormValues> = async () => {
    setFormMessage('Sign-in details validated. Backend connection can be enabled without changing this UI.')
  }

  return (
    <AuthShell>
<<<<<<< HEAD
      <section className="w-full max-w-[480px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-lg)] sm:p-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-[var(--color-teal)]">CVBuddy</h1>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)]">Guided Clarity for Your Career.</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-normal text-[var(--color-text-primary)]">Welcome back!</h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)]">Please enter your details to sign in.</p>
=======
      <section className="relative z-10 w-full max-w-[420px] rounded-[16px] bg-white p-5 shadow-[0_4px_20px_rgba(33,150,243,0.08)] sm:p-6">
        <div className="mb-5 text-center">
          <h1 className="text-[32px] font-bold leading-tight tracking-normal text-[#0061a4]">CVBuddy</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#526069]">Guided Clarity for Your Career.</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-normal text-[#191c1d]">Welcome back!</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#404752]">Please enter your details to sign in.</p>
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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

<<<<<<< HEAD
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-navy)]" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              size="lg"
              leftIcon={<LockIcon className="h-5 w-5" />}
              state={errors.password ? 'error' : 'default'}
              error={errors.password?.message}
              className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              {...register('password')}
            />
          </div>

          <label className="flex items-center gap-3 text-base text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              className="h-[18px] w-[18px] rounded border-[var(--color-gray-500)] text-[var(--color-teal)] focus:ring-[var(--color-teal)]"
=======
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            size="md"
            leftIcon={<LockIcon className="h-5 w-5" />}
            state={errors.password ? 'error' : 'default'}
            error={errors.password?.message}
            className="border-transparent bg-[#f8f9fa] text-base focus:border-[#2196f3] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.2)]"
            {...register('password')}
          />

          <label className="flex items-center gap-3 text-sm text-[#404752]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#707883] text-[#0061a4] focus:ring-[#2196f3]"
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
              {...register('remember')}
            />
            Remember me for 30 days
          </label>

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
            Sign In
          </Button>
        </form>

<<<<<<< HEAD
        <p className="mt-10 text-center text-base text-[var(--color-text-secondary)]">
=======
        <p className="mt-5 text-center text-sm text-[#526069]">
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
          Don&apos;t have an account?{' '}
          <Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/register/applicant">
            Create account
          </Link>
        </p>
      </section>
    </AuthShell>
  )
}
