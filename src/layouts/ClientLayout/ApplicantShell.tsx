import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { ApplicantHeader } from './ApplicantHeader'

interface ApplicantShellProps {
  children?: ReactNode
}

export function ApplicantShell({ children }: ApplicantShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <ApplicantHeader />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  )
}
