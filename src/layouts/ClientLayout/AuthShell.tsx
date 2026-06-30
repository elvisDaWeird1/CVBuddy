import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-bg-soft)_1px,transparent_1px)] bg-[length:var(--sp-6)_var(--sp-6)] opacity-70"
      />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 bg-[var(--color-gray-100)] px-6 py-6 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:px-8">
        <p className="font-semibold text-[var(--color-text-primary)]">© 2024 CVBuddy. Guided Clarity for Your Career.</p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Help Center</Link>
          <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Privacy Policy</Link>
          <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/coming-soon">Terms of Service</Link>
          <Link className="underline underline-offset-4 hover:text-[var(--color-teal)]" to="/form">Contact Us</Link>
        </nav>
      </footer>
    </div>
  )
}
