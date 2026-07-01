import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon, KeyIcon, LockIcon } from '@/components/ui/icons'
import { changePassword, getAuthApiErrorMessage } from '@/modules/auth/authApi'
import { useNavigate } from 'react-router-dom'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
type PasswordFieldName = keyof ChangePasswordFormValues

const passwordFields: Array<{
  name: PasswordFieldName
  label: string
  placeholder: string
  helperText?: string
  autoComplete: string
}> = [
  {
    name: 'currentPassword',
    label: 'Current Password',
    placeholder: 'Enter current password',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'New Password',
    placeholder: 'Enter new password',
    helperText: 'Must be at least 6 characters long.',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm New Password',
    placeholder: 'Re-enter new password',
    autoComplete: 'new-password',
  },
]

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState<Record<PasswordFieldName, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async ({ currentPassword, newPassword }) => {
    setFormMessage(null)

    try {
      const response = await changePassword({ currentPassword, newPassword })

      if (!response.success) {
        throw new Error(response.message || 'Unable to update password.')
      }

      setFormMessage(response.message || 'Your password has been updated successfully.')
      reset()
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined

      if (status === 401) {
        navigate('/login', {
          replace: true,
          state: { authMessage: 'Your session expired. Please sign in again.' },
        })
        return
      }

      setFormMessage(getAuthApiErrorMessage(error, 'Unable to update password.'))
    }
  }

  return (
    <ApplicantShell>
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[1200px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-[520px] rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:p-8">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-navy)]">
              <LockIcon className="h-7 w-7" />
            </span>
            <h1 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">Change Password</h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-[var(--color-text-secondary)]">
              Keep your account secure by updating your password regularly.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {passwordFields.map((field) => {
              const isVisible = visible[field.name]
              const error = errors[field.name]?.message

              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={isVisible ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  size="lg"
                  helperText={field.helperText}
                  state={error ? 'error' : 'default'}
                  error={error}
                  className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
                  rightIcon={
                    <button
                      type="button"
                      className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-teal)]"
                      onClick={() => setVisible((current) => ({ ...current, [field.name]: !isVisible }))}
                      aria-label={isVisible ? `Hide ${field.label}` : `Show ${field.label}`}
                    >
                      {isVisible ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                    </button>
                  }
                  {...register(field.name)}
                />
              )
            })}

            {formMessage && (
              <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--color-teal)]">
                {formMessage}
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              className="h-14 w-full rounded-[var(--radius-lg)] text-base font-semibold shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              iconLeft={<KeyIcon className="h-5 w-5" />}
            >
              Update Password
            </Button>
          </form>

          <div className="mt-7 text-center">
            <Link className="text-base font-medium text-[var(--color-teal)] hover:underline" to="/profile">
              Back to profile
            </Link>
          </div>
        </section>
      </div>
    </ApplicantShell>
  )
}
