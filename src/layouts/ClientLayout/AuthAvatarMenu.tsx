import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon, UserIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'
import type { AuthAccount } from '@/modules/auth/authApi'

interface AuthAvatarMenuProps {
  account: AuthAccount | null
  profileTo: string
  onLogout: () => void
  className?: string
  buttonClassName?: string
  menuClassName?: string
}

function getInitials(account: AuthAccount | null) {
  const source = account?.fullName || account?.companyName || account?.email || ''
  const parts = source.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return 'U'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AuthAvatarMenu({
  account,
  profileTo,
  onLogout,
  className,
  buttonClassName,
  menuClassName,
}: AuthAvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const initials = useMemo(() => getInitials(account), [account])
  const avatarUrl = typeof account?.avatarUrl === 'string' ? account.avatarUrl.trim() : ''
  const showAvatar = Boolean(avatarUrl && failedAvatarUrl !== avatarUrl)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-hover)] bg-[var(--color-bg-soft)] text-sm font-bold text-[var(--color-teal)] transition-colors hover:border-[var(--color-teal)] hover:bg-[var(--color-white)]',
          buttonClassName,
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        {showAvatar ? (
          <img
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailedAvatarUrl(avatarUrl)}
            src={avatarUrl}
          />
        ) : initials || <UserIcon className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-[calc(100%+0.5rem)] z-[220] min-w-48 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] p-2 shadow-[var(--shadow-xl)]',
            menuClassName,
          )}
          role="menu"
        >
          <Link
            to={profileTo}
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-teal)]"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-teal)]"
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">↩</span>
              Logout
            </span>
            <ChevronDownIcon className="h-4 w-4 rotate-[-90deg] text-[var(--color-text-muted)]" />
          </button>
        </div>
      )}
    </div>
  )
}
