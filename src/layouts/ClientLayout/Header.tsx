import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

const landingLinks = [
  { label: 'Home', sectionId: 'home' },
  { label: 'About Us', sectionId: 'about-us' },
  { label: 'Project', sectionId: 'project' },
  { label: 'AI Buddy', sectionId: 'ai-buddy' },
  { label: 'Form / Survey', sectionId: 'survey-form' },
]

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeHash = location.pathname === '/' ? location.hash || '#home' : ''

  const handleLandingClick = (sectionId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/') {
      return
    }

    event.preventDefault()
    const hash = `#${sectionId}`

    if (location.hash !== hash) {
      navigate({ pathname: '/', hash })
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <header className="sticky top-0 z-[200] w-full border-b border-[#dbe7f5] bg-white/95 shadow-[0_4px_20px_rgba(33,150,243,0.06)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/#home"
          onClick={handleLandingClick('home')}
          className="flex shrink-0 items-center gap-2 text-[#191c1d] hover:text-[#0061a4]"
        >
          <img src="/logo.png" alt="CVBuddy" className="h-8 w-8 rounded-[8px]" />
          <span className="text-lg font-bold tracking-normal">CVBuddy</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Landing sections">
          {landingLinks.map((link) => {
            const hash = `#${link.sectionId}`
            const isActive = activeHash === hash

            return (
              <Link
                key={link.sectionId}
                to={`/${hash}`}
                onClick={handleLandingClick(link.sectionId)}
                className={cn(
                  'border-b-2 border-transparent py-5 text-sm font-semibold tracking-normal transition-colors',
                  isActive ? 'border-[#2196f3] text-[#0061a4]' : 'text-[#526069] hover:text-[#0061a4]',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="hidden h-10 items-center justify-center rounded-[12px] border border-[#dbe7f5] px-4 text-sm font-semibold text-[#191c1d] transition-colors hover:border-[#2196f3] hover:bg-[#f8fbff] hover:text-[#0061a4] sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            to="/register/applicant"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#2196f3] px-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(33,150,243,0.12)] transition-colors hover:bg-[#0061a4] hover:text-white"
          >
            Join
            <ArrowRightIcon className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto border-t border-[#eef4fb] px-4 py-2 lg:hidden"
        aria-label="Landing sections"
      >
        {landingLinks.map((link) => {
          const hash = `#${link.sectionId}`
          const isActive = activeHash === hash

          return (
            <Link
              key={link.sectionId}
              to={`/${hash}`}
              onClick={handleLandingClick(link.sectionId)}
              className={cn(
                'shrink-0 rounded-full px-3 py-2 text-sm font-semibold tracking-normal transition-colors',
                isActive ? 'bg-[#e3f2fd] text-[#0061a4]' : 'text-[#526069] hover:bg-[#f8fbff] hover:text-[#0061a4]',
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
