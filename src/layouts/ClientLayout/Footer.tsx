import { Link } from 'react-router-dom'

export function Footer() {
  return (
<<<<<<< HEAD
    <footer className="mt-auto bg-[var(--color-navy)] text-[var(--color-text-on-navy)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
=======
    <footer className="mt-auto border-t border-[#d8e3fb] bg-[#eef4ff] text-[#404752]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Link to="/#home" className="inline-flex items-center gap-2 text-[#0061a4] hover:text-[#0061a4]">
              <img src="/logo.png" alt="CVBuddy" className="h-7 w-7" />
              <span className="text-base font-bold tracking-normal">CVBuddy</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#526069]">
              Guided clarity for applicants building stronger CVs, profiles, and portfolios.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-[#191c1d]">Landing</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/#about-us" className="text-[#526069] hover:text-[#0061a4]">About Us</Link></li>
              <li><Link to="/#project" className="text-[#526069] hover:text-[#0061a4]">Project</Link></li>
              <li><Link to="/#ai-buddy" className="text-[#526069] hover:text-[#0061a4]">AI Buddy</Link></li>
              <li><Link to="/#survey-form" className="text-[#526069] hover:text-[#0061a4]">Survey form</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-[#191c1d]">Project</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#526069]">
              Frontend-only survey submission stays local until a dedicated backend endpoint exists.
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="mt-8 border-t border-[var(--color-gray-800)] pt-6 text-center text-xs text-[var(--color-gray-500)]">
          © {new Date().getFullYear()} CV Buddy. All rights reserved.
=======
        <div className="mt-8 border-t border-[#d8e3fb] pt-6 text-center text-xs text-[#526069]">
          &copy; {new Date().getFullYear()} CVBuddy. All rights reserved.
>>>>>>> 690288de27cbb799d207026ec0483fd829139e99
        </div>
      </div>
    </footer>
  )
}
