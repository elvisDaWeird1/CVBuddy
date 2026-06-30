import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f9fa] text-[#191c1d]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(#d1e4ff 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 bg-[#edeeef] px-6 py-6 text-sm text-[#404752] sm:flex-row sm:px-8">
        <p className="font-semibold text-[#191c1d]">© 2024 CVBuddy. Guided Clarity for Your Career.</p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Help Center</Link>
          <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Privacy Policy</Link>
          <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/coming-soon">Terms of Service</Link>
          <Link className="underline underline-offset-4 hover:text-[#0061a4]" to="/form">Contact Us</Link>
        </nav>
      </footer>
    </div>
  )
}
