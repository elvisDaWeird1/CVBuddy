import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ' +
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 ' +
'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none whitespace-nowrap',
{
variants: {
variant: {
primary: 'bg-[var(--color-primary-dark)] text-white hover:bg-[#151d27] active:bg-[#0f161e]',
secondary: 'bg-[var(--color-surface)] text-[var(--color-primary-dark)] border border-[var(--color-primary-dark)] hover:bg-[var(--color-bg)]',
outline: 'bg-transparent text-[var(--color-primary-dark)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-primary-dark)]',
danger: 'bg-[var(--color-error)] text-white hover:bg-[#dc2626] active:bg-[#b91c1c]',
cta: 'bg-[var(--color-accent)] text-[var(--color-primary-dark)] hover:bg-[#b89200] active:bg-[#9a7d00] font-semibold',
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
