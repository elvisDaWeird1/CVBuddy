import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { ChevronDownIcon } from './icons'

const selectVariants = cva(
  'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-[var(--color-navy)] ' +
  'transition-all duration-200 outline-none cursor-pointer ' +
  'hover:border-[var(--color-border-hover)] ' +
  'focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)] ' +
  'disabled:bg-[var(--color-gray-100)] disabled:text-[var(--color-gray-400)] disabled:cursor-not-allowed',
  {
    variants: {
      state: {
        default: 'border-[var(--color-border)]',
        error: 'border-[var(--color-error)] focus:border-[var(--color-error)]',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: { state: 'default', size: 'md' },
  }
)

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
  VariantProps<typeof selectVariants> {
  label?: string
  helperText?: string
  error?: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, state, size, label, helperText, error, placeholder, options, id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s/g, '-') || Math.random().toString(36).slice(2)}`
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">{label}</label>
        )}
        <div className="relative">
          <select ref={ref} id={selectId} className={cn(selectVariants({ state, size }), className)} {...props}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-400)] pointer-events-none" />
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
Select.displayName = 'Select'
