import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { AuthAvatarMenu } from './AuthAvatarMenu'
import { logout } from '@/modules/auth/authApi'
import { clearAuthSession } from '@/modules/auth/authStorage'
import { useAuthSession } from '@/modules/auth/useAuthSession'

const applicantNavItems = [
  { label: 'Profile', to: '/profile' },
  { label: 'CV', to: '/cv' },
  { label: 'AI Chatting', to: '/ai-chat' },
  { label: 'Portfolio', to: '/portfolio' },
] as const

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-12 items-center border-b-2 px-1 text-base transition-colors duration-200 sm:h-16',
    isActive
      ? 'border-[var(--color-teal)] text-[var(--color-teal)]'
      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-teal)]',
  )

export function ApplicantHeader() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { account } = useAuthSession()

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsMenuOpen(false)
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // Local cleanup and redirect are still required when the server rejects the token.
    } finally {
      clearAuthSession()
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-[200] w-full border-b border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex min-h-16 w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-5 px-4 sm:px-6 lg:px-8">
        <Link to="/profile" className="flex items-center gap-2 text-xl font-bold text-[var(--color-teal)]">
          <img src="/logo.png" alt="CV Buddy" className="h-8 w-8" />
          <span>CV Buddy</span>
        </Link>

        <nav className="order-last flex w-full justify-center gap-5 sm:order-none sm:w-auto sm:gap-8" aria-label="Applicant sections">
          {applicantNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthAvatarMenu account={account} profileTo="/profile" onLogout={handleLogout} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-teal)] transition-colors hover:bg-[var(--color-bg-soft)] sm:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Toggle applicant navigation"
            aria-expanded={isMenuOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-white)] px-4 py-4 shadow-[var(--shadow-md)] sm:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col gap-2" aria-label="Applicant mobile navigation">
            {applicantNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-[var(--radius-lg)] px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-[var(--color-bg-soft)] text-[var(--color-teal)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-teal)]',
                  )
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
