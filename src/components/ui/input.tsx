import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-[var(--color-navy)] placeholder:text-[var(--color-gray-400)] ' +
  'transition-all duration-200 outline-none ' +
  'hover:border-[var(--color-border-hover)] ' +
  'focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)] ' +
  'disabled:bg-[var(--color-gray-100)] disabled:text-[var(--color-gray-400)] disabled:cursor-not-allowed',
  {
    variants: {
      state: {
        default: 'border-[var(--color-border)]',
        error: 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
        success: 'border-[var(--color-success)] focus:border-[var(--color-success)]',
      },
      size: {
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-lg',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
)

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-') || Math.random().toString(36).slice(2)}`
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(inputVariants({ state, size }), leftIcon && 'pl-9', rightIcon && 'pr-9', className)}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
