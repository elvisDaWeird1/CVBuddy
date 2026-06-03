import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
({ className, ...props }, ref) => (
<div ref={ref} className={cn('rounded-xl border border-[var(--color-border)] bg-white shadow-sm', className)} {...props} />
)
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
({ className, ...props }, ref) => (
<div ref={ref} className={cn('px-5 py-4 border-b border-[var(--color-border)]', className)} {...props} />
)
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
({ className, ...props }, ref) => (
<h3 ref={ref} className={cn('text-base font-semibold text-[var(--color-primary-dark)]', className)} {...props} />
)
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
({ className, ...props }, ref) => (
<p ref={ref} className={cn('text-sm text-[var(--color-text-muted)] mt-0.5', className)} {...props} />
)
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
({ className, ...props }, ref) => (
<div ref={ref} className={cn('px-5 py-4', className)} {...props} />
)
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
({ className, ...props }, ref) => (
<div ref={ref} className={cn('px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-gray-50)] rounded-b-xl', className)} {...props} />
)
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
