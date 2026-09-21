import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-[var(--radius-lg)] transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-teal)] text-[var(--color-text-on-teal)] hover:brightness-95 active:brightness-90',
        secondary: 'bg-[var(--color-bg-soft)] text-[var(--color-teal)] border border-[var(--color-teal)] hover:bg-[var(--color-white)]',
        outline: 'bg-transparent text-[var(--color-navy)] border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]',
        ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-navy)]',
        danger: 'bg-[var(--color-error)] text-[var(--color-white)] hover:brightness-95 active:brightness-90',
        cta: 'bg-[var(--color-amber)] text-[var(--color-navy)] hover:brightness-95 active:brightness-90 font-semibold',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, iconLeft, iconRight, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {!loading && iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
        {children}
        {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'
