import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface FormGroupProps {
label?: string
error?: string
helperText?: string
required?: boolean
children: React.ReactNode
className?: string
}

export function FormGroup({ label, error, helperText, required, children, className }: FormGroupProps) {
return (
<div className={cn('w-full', className)}>
{label && (
<label className="block text-sm font-medium text-[var(--color-primary-dark)] mb-1.5">{label}{required && <span className="text-[var(--color-error)] ml-0.5">*</span>}</label>
)}
{children}
{error && <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>}
{helperText && !error && <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{helperText}</p>}
</div>
)
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>(({ className, onSubmit, ...props }, ref) => {
return (
<form ref={ref} className={cn('w-full', className)} onSubmit={onSubmit} noValidate {...props} />
)
})
Form.displayName = 'Form'
