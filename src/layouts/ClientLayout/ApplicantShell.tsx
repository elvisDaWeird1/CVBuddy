import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BriefcaseIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

interface ApplicantShellProps {
  children: ReactNode
}

const navItems = [
  { label: 'Profile', to: '/applicant/profile' },
  { label: 'Applications', to: '/coming-soon' },
  { label: 'Settings', to: '/change-password' },
] as const

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-12 items-center border-b-2 px-1 text-base transition-colors duration-200 sm:h-16',
    isActive
      ? 'border-[#0061a4] text-[#0061a4]'
      : 'border-transparent text-[#404752] hover:text-[#0061a4]',
  )

export function ApplicantShell({ children }: ApplicantShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] text-[#191c1d]">
      <header className="sticky top-0 z-50 w-full bg-white shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
        <div className="mx-auto flex min-h-16 w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-5 px-4 sm:px-6 lg:px-8">
          <Link to="/applicant/profile" className="flex items-center gap-2 text-xl font-bold text-[#0061a4]">
            <BriefcaseIcon className="h-7 w-7" />
            <span>CVBuddy</span>
          </Link>

          <nav className="order-last flex w-full justify-center gap-5 sm:order-none sm:w-auto sm:gap-8">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-base font-medium text-[#404752] transition-colors hover:text-[#0061a4] sm:inline-flex">
              Logout
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bfc7d4] bg-[#d1e4ff] text-sm font-bold text-[#0061a4]">
              AS
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto w-full bg-[#edeeef]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[#404752] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-semibold text-[#191c1d]">© 2024 CVBuddy. Guided Clarity for Your Career.</p>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Help Center</Link>
            <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Privacy Policy</Link>
            <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Terms of Service</Link>
            <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/#survey-form">Contact Us</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
