import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ApplicantHeader } from './ApplicantHeader'

interface ApplicantShellProps {
  children?: ReactNode
}

export function ApplicantShell({ children }: ApplicantShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <ApplicantHeader />

      <main className="flex-1">{children ?? <Outlet />}</main>

      <footer className="mt-auto w-full bg-[var(--color-gray-100)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-semibold text-[var(--color-text-primary)]">© 2024 CVBuddy. Guided Clarity for Your Career.</p>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Help Center</Link>
            <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Privacy Policy</Link>
            <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Terms of Service</Link>
            <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/form">Contact Us</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
