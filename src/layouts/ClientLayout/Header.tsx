import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'text-[var(--color-teal)]'
      : 'text-[var(--color-gray-600)] hover:text-[var(--color-navy)]'
  }`

export function Header() {
  return (
    <header className="sticky top-0 z-[200] w-full bg-white border-b border-[var(--color-border)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img
            src="/icons.svg"
            alt="CV Buddy"
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-[var(--color-navy)] tracking-tight">
            CV Buddy
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/home" end className={navLinkClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/about-us" className={navLinkClass}>
            Về chúng tôi
          </NavLink>
          <NavLink to="/project" className={navLinkClass}>
            Về dự án
          </NavLink>
          <NavLink to="/ai-buddy" className={navLinkClass}>
            AI Buddy
          </NavLink>
          <NavLink to="/form" className={navLinkClass}>
            Góp ý
          </NavLink>
          <NavLink to="/coming-soon" className={navLinkClass}>
            Coming Soon
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Đăng nhập
          </Button>
          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            Đăng kí
          </Button>
        </div>
      </div>
    </header>
  )
}
