import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { XIcon } from '@/components/ui/icons'
import { AdminSidebar } from './AdminSidebar'

function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Open admin navigation"
      className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[var(--color-teal)] transition-colors hover:bg-[var(--color-bg-soft)]"
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className="flex flex-col gap-1.5">
        <span className="h-0.5 w-5 rounded-full bg-current" />
        <span className="h-0.5 w-5 rounded-full bg-current" />
        <span className="h-0.5 w-5 rounded-full bg-current" />
      </span>
    </button>
  )
}

export function AdminLayout() {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const closeMobileNavigation = () => setIsMobileNavigationOpen(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg-main)]">
      <aside className="fixed inset-y-0 left-0 z-[200] hidden w-64 md:block lg:w-72">
        <AdminSidebar />
      </aside>

      <div className="border-b border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <img alt="" aria-hidden="true" className="h-7 w-7" src="/logo.png" />
            CVBuddy Admin
          </span>
          <MenuButton onClick={() => setIsMobileNavigationOpen(true)} />
        </div>
      </div>

      {isMobileNavigationOpen && (
        <div className="fixed inset-0 z-[300] md:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-[color:rgba(8,16,32,0.58)]"
            onClick={closeMobileNavigation}
            type="button"
          />
          <aside aria-label="Admin navigation" className="absolute inset-y-0 left-0 w-[min(18rem,calc(100vw-3rem))] shadow-[var(--shadow-xl)]">
            <button
              aria-label="Close admin navigation"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={closeMobileNavigation}
              type="button"
            >
              <XIcon aria-hidden="true" className="h-5 w-5" />
            </button>
            <AdminSidebar onNavigate={closeMobileNavigation} />
          </aside>
        </div>
      )}

      <main className="min-w-0 md:pl-64 lg:pl-72">
        <Outlet />
      </main>
    </div>
  )
}
