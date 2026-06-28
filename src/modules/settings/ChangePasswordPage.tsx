import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon, KeyIcon, LockIcon } from '@/components/ui/icons'

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

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async () => {
    setFormMessage('Your new password details have been validated.')
    reset()
  }

  return (
    <ApplicantShell>
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[1200px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-[520px] rounded-[16px] bg-white p-6 shadow-[0_4px_20px_rgba(33,150,243,0.08)] transition-shadow hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)] sm:p-8">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d1e4ff] text-[#001c3a]">
              <LockIcon className="h-7 w-7" />
            </span>
            <h1 className="text-[32px] font-bold leading-tight tracking-normal text-[#191c1d]">Change Password</h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-[#404752]">
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
                  className="border-transparent bg-[#f8f9fa] text-base focus:border-[#2196f3] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.2)]"
                  rightIcon={
                    <button
                      type="button"
                      className="text-[#526069] transition-colors hover:text-[#0061a4]"
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
              <p className="rounded-[12px] bg-[#e3f2fd] px-4 py-3 text-sm font-medium text-[#00497d]">
                {formMessage}
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              className="h-14 w-full rounded-[12px] bg-[#2196f3] text-base font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#0061a4] hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)]"
              iconLeft={<KeyIcon className="h-5 w-5" />}
            >
              Update Password
            </Button>
          </form>

          <div className="mt-7 text-center">
            <Link className="text-base font-medium text-[#0061a4] hover:underline" to="/applicant/profile">
              Back to profile
            </Link>
          </div>
        </section>
      </div>
    </ApplicantShell>
  )
}
