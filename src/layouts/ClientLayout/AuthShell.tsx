import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/layouts/ClientLayout/Header'
import { Footer } from '@/layouts/ClientLayout/Footer'

interface AuthShellProps {
  children?: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  )
}
