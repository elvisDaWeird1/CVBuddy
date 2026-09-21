import type { SVGProps } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { AdminProfile } from './AdminProfile'

interface AdminSidebarProps {
  onNavigate?: () => void
}

function DashboardIcon({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect height="6.5" rx="1.25" width="6.5" x="3.5" y="3.5" />
      <rect height="6.5" rx="1.25" width="6.5" x="14" y="3.5" />
      <rect height="6.5" rx="1.25" width="6.5" x="3.5" y="14" />
      <rect height="6.5" rx="1.25" width="6.5" x="14" y="14" />
    </svg>
  )
}

const navigation = [
  { label: 'Overview', to: '/admin', icon: DashboardIcon },
]

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <div className="flex h-full min-h-screen flex-col bg-[var(--color-navy)] pb-4 pt-5 text-[var(--color-text-on-navy)]">
      <Link
        aria-label="Go to the Admin overview"
        className="mx-5 flex items-center gap-3 rounded-[var(--radius-lg)] focus-visible:shadow-[var(--focus-ring-cyan)]"
        onClick={onNavigate}
        to="/admin"
      >
        <img alt="" aria-hidden="true" className="h-9 w-9" src="/logo.png" />
        <span>
          <span className="block text-base font-bold tracking-tight">CVBuddy</span>
          <span className="block text-xs font-medium text-white/60">Admin workspace</span>
        </span>
      </Link>

      <nav aria-label="Admin navigation" className="mt-10 px-3">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">Workspace</p>
        <div className="mt-3 space-y-1">
          {navigation.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) => cn(
                'flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors duration-150 focus-visible:shadow-[var(--focus-ring-cyan)]',
                isActive
                  ? 'bg-[var(--color-teal)] text-[var(--color-text-on-teal)] shadow-[var(--shadow-sm)]'
                  : 'text-white/70 hover:bg-white/10 hover:text-[var(--color-text-on-navy)]',
              )}
              end
              key={to}
              onClick={onNavigate}
              to={to}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto">
        <AdminProfile />
      </div>
    </div>
  )
}
