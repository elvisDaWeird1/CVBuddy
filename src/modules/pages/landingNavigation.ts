export const LANDING_HOME_HASH = '#home'

export const landingNavItems = [
  { label: 'Home', hash: LANDING_HOME_HASH },
  { label: 'About Us', hash: '#about-us' },
  { label: 'Project', hash: '#project' },
  { label: 'AI Buddy', hash: '#ai-buddy' },
  { label: 'Portfolio', hash: '#portfolio' },
] as const

export function getLandingPath(hash: string) {
  return `/${hash}`
}

export function scrollToLandingSection(hash: string) {
  if (hash === LANDING_HOME_HASH) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
