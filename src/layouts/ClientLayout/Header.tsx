import { useState, useEffect, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'
import { AuthAvatarMenu } from './AuthAvatarMenu'
import { clearAuthSession, getAuthToken, getStoredAccount } from '@/modules/auth/authStorage'

const landingNavItems = [
  { label: 'Home', hash: '#home' },
  { label: 'About Us', hash: '#about-us' },
  { label: 'Project', hash: '#project' },
  { label: 'AI Buddy', hash: '#ai-buddy' },
  { label: 'Form / Survey', hash: '#survey-form' },
] as const

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = Boolean(getAuthToken())
  const account = getStoredAccount()
  const isLandingRoute = location.pathname === '/'

  // Lưu hash trước đó để phát hiện thay đổi trong lúc render
  const [prevHash, setPrevHash] = useState(location.hash)

  // Adjust state during render thay vì trong effect
  if (isLandingRoute && location.hash && location.hash !== prevHash) {
    setPrevHash(location.hash)
    setActiveSection(location.hash)
  }

  // Effect theo dõi scroll giữ nguyên (đây là hợp lệ vì setState
  // nằm trong callback của observer, không nằm trực tiếp trong thân effect)
  useEffect(() => {
    if (!isLandingRoute) return

    const sectionIds = landingNavItems.map((item) => item.hash.slice(1))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) {
          const closest = visible.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev,
          )
          setActiveSection(`#${closest.target.id}`)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isLandingRoute])

  const scrollToHash = (hash: string) => {
    const targetId = hash.slice(1)
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLandingNavClick = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    event.preventDefault()
    setIsMenuOpen(false)
    setActiveSection(hash) // feedback ngay khi click, không chờ observer

    if (isLandingRoute) {
      navigate({ pathname: '/', hash }, { replace: location.hash === hash })
      window.setTimeout(() => scrollToHash(hash), 0)
      return
    }

    navigate({ pathname: '/', hash })
  }

  const handleLogout = () => {
    clearAuthSession()
    setIsMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-[200] w-full bg-[var(--color-white)] border-b border-[var(--color-border)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img
            src="logo.png"
            alt="CV Buddy"
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-[var(--color-navy)] tracking-tight">
            CV Buddy
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Landing sections">
          {landingNavItems.map((item) => {
            const isActive = isLandingRoute && activeSection === item.hash

            return (
              <a
                key={item.hash}
                href={`/${item.hash}`}
                onClick={(event) => handleLandingNavClick(event, item.hash)}
                className={cn(
                  'border-b-2 py-1 text-sm font-semibold transition-colors duration-150',
                  isActive
                    ? 'border-[#2563eb] text-[#2563eb]'
                    : 'border-transparent text-[#526069] hover:text-[#0061a4]',
                )}
              > 
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-teal)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-teal)]"
              >
                Explore
              </Link>
              <AuthAvatarMenu account={account} profileTo="/profile" onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#bfc7d4] px-4 text-sm font-semibold text-[#191c1d] transition-colors hover:border-[#0061a4] hover:bg-[#f8f9fa] hover:text-[#0061a4]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#2563eb] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0061a4] hover:text-white"
              >
                Create account
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#d8e3fb] text-[#0061a4] transition-colors hover:bg-[#e3f2fd] md:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#d8e3fb] bg-white px-4 py-4 shadow-[0_8px_30px_rgba(33,150,243,0.12)] md:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col gap-2" aria-label="Mobile landing sections">
            {landingNavItems.map((item) => {
              const isActive = isLandingRoute && activeSection === item.hash

              return (
                <a
                  key={item.hash}
                  href={`/${item.hash}`}
                  onClick={(event) => handleLandingNavClick(event, item.hash)}
                  className={cn(
                    'rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-[#e3f2fd] text-[#0061a4]' : 'text-[#526069] hover:bg-[#f8f9fa] hover:text-[#0061a4]',
                  )}
                >
                  {item.label}
                </a>
              )
            })}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="rounded-[10px] px-3 py-2 text-sm font-semibold text-[var(--color-teal)] transition-colors hover:bg-[var(--color-bg-soft)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
            )}
            <div className="mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between rounded-[10px] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-3">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">Signed in</span>
                  <AuthAvatarMenu account={account} profileTo="/profile" onLogout={handleLogout} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#bfc7d4] text-sm font-semibold text-[#191c1d] hover:border-[#0061a4] hover:text-[#0061a4]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#0061a4] hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
