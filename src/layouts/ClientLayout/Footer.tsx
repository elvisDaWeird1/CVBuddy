import { Link } from 'react-router-dom'
import { getLandingPath, LANDING_HOME_HASH, landingNavItems } from '@/modules/pages/landingNavigation'

export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--color-navy)] text-[var(--color-text-on-navy)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Link
              aria-label="Go to CVBuddy home"
              className="inline-flex items-center gap-2 text-[var(--color-cyan)] hover:text-[var(--color-white)]"
              to={getLandingPath(LANDING_HOME_HASH)}
            >
              <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-7" />
              <span className="text-base font-bold tracking-normal">CVBuddy</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-text-on-navy)]/70">
              Guided clarity for applicants building stronger CVs, profiles, and portfolios.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-[var(--color-text-on-navy)]">Explore CVBuddy</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {landingNavItems.map((item) => (
                <li key={item.hash}>
                  <Link
                    className="text-[var(--color-text-on-navy)]/70 hover:text-[var(--color-cyan)]"
                    to={getLandingPath(item.hash)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-[var(--color-text-on-navy)]">From CV to proof</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-text-on-navy)]/70">
              Review your CV with AI, capture real work from your phone, and shape it into a portfolio employers can understand.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-white)]/10 pt-6 text-center text-xs text-[var(--color-text-on-navy)]/50">
          © {new Date().getFullYear()} CV Buddy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
