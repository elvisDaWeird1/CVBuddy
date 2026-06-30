import type { ReactNode } from 'react'
import { Header } from '@/layouts/ClientLayout/Header'
import { Footer } from '@/layouts/ClientLayout/Footer'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-bg-soft)_1px,transparent_1px)] bg-[length:var(--sp-6)_var(--sp-6)] opacity-70"
      />
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
