import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-[var(--color-navy)] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/home" className="inline-flex items-center gap-2">
              <img src="/icons.svg" alt="CV Buddy" className="h-7 w-7" />
              <span className="text-base font-bold tracking-tight">CV Buddy</span>
            </Link>
            <p className="mt-3 text-sm text-[var(--color-gray-400)] leading-relaxed">
              Nền tảng tạo CV và Portfolio chuyên nghiệp dành cho sinh viên.
            </p>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-gray-400)]">
              Liên hệ
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-gray-400)]">
              <li>Tên công ty</li>
              <li>Địa chỉ</li>
              <li>Số điện thoại</li>
              <li>Email</li>
            </ul>
          </div>

          {/* Dự án */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-gray-400)]">
              Về dự án
            </h3>
            <p className="mt-3 text-sm text-[var(--color-gray-400)] leading-relaxed">
              CV Buddy — giúp sinh viên xây dựng hồ sơ năng lực và portfolio nhanh chóng, chuyên nghiệp.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-[var(--color-gray-500)]">
          © {new Date().getFullYear()} CV Buddy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
