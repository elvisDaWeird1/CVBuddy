import type { ReactNode } from 'react'
import { Header } from '@/layouts/ClientLayout/Header'
import { Footer } from '@/layouts/ClientLayout/Footer'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] text-[#191c1d]">
      <Header />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: 'radial-gradient(#d1e4ff 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {children}
      </main>
      <Footer />
    </div>
  )
}
