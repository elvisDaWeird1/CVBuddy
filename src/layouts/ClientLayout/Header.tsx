import { useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

const landingNavItems = [
  { label: 'Home', hash: '#home' },
  { label: 'About Us', hash: '#about-us' },
  { label: 'Project', hash: '#project' },
  { label: 'AI Buddy', hash: '#ai-buddy' },
  { label: 'Form / Survey', hash: '#survey-form' },
] as const

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLandingRoute = location.pathname === '/'
  const activeHash = location.hash || '#home'

  const scrollToHash = (hash: string) => {
    const targetId = hash.slice(1)
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLandingNavClick = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    event.preventDefault()
    setIsMenuOpen(false)

    if (isLandingRoute) {
      navigate({ pathname: '/', hash }, { replace: activeHash === hash })
      window.setTimeout(() => scrollToHash(hash), 0)
      return
    }

    navigate({ pathname: '/', hash })
  }

  return (
    <header className="sticky top-0 z-[200] w-full border-b border-[#d8e3fb] bg-white/95 shadow-[0_4px_20px_rgba(33,150,243,0.08)] backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/#home"
          onClick={(event) => handleLandingNavClick(event, '#home')}
          className="flex shrink-0 items-center gap-2 text-[#0061a4] hover:text-[#0061a4]"
        >
          <img src="/logo.png" alt="CVBuddy" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-normal text-[#0061a4]">CVBuddy</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Landing sections">
          {landingNavItems.map((item) => {
            const isActive = isLandingRoute && activeHash === item.hash

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
          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#bfc7d4] px-4 text-sm font-semibold text-[#191c1d] transition-colors hover:border-[#0061a4] hover:bg-[#f8f9fa] hover:text-[#0061a4]"
          >
            Login
          </Link>
          <Link
            to="/register/applicant"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#2563eb] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0061a4] hover:text-white"
          >
            Create account
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
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
              const isActive = isLandingRoute && activeHash === item.hash

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
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#bfc7d4] text-sm font-semibold text-[#191c1d] hover:border-[#0061a4] hover:text-[#0061a4]"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register/applicant"
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#0061a4] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
