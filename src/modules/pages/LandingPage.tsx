import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  GraduationCapIcon,
  LinkIcon,
  UploadIcon,
  UserIcon,
} from '@/components/ui/icons'
import heroImage from '@/assets/hero.png'
import { cn } from '@/utils/cn'
import { scrollToLandingSection } from './landingNavigation'

type ProjectFeature = {
  title: string
  body: string
  icon: ReactNode
  className: string
  inverted?: boolean
}

type TeamMember = {
  id: number
  name: string
  role: string
  image: string | null
}

type LandingFeature = {
  title: string
  label: string
  body: string
  icon: ReactNode
}

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Member 1', role: 'Team role to be updated', image: null },
  { id: 2, name: 'Member 2', role: 'Team role to be updated', image: null },
  { id: 3, name: 'Member 3', role: 'Team role to be updated', image: null },
  { id: 4, name: 'Member 4', role: 'Team role to be updated', image: null },
  { id: 5, name: 'Member 5', role: 'Team role to be updated', image: null },
  { id: 6, name: 'Member 6', role: 'Team role to be updated', image: null },
]

const projectFeatures: ProjectFeature[] = [
  {
    title: 'AI CV review',
    body: 'Analyze structure, phrasing, missing proof, and role-specific keywords before applications go out.',
    icon: <FileTextIcon className="h-7 w-7" />,
    className: 'md:col-span-8',
  },
  {
    title: 'Improvement prompts',
    body: 'Get concise suggestions for stronger action verbs, measurable outcomes, and clearer summaries.',
    icon: <CheckIcon className="h-7 w-7" />,
    className: 'md:col-span-4 border-[var(--color-teal)] bg-[var(--color-teal)] text-[var(--color-text-on-teal)]',
    inverted: true,
  },
  {
    title: 'Applicant profile',
    body: 'Keep education, experience, career goals, and contact details ready for reuse.',
    icon: <UserIcon className="h-7 w-7" />,
    className: 'md:col-span-4',
  },
  {
    title: 'Portfolio showcase',
    body: 'Connect project evidence with the CV so employers can understand both skills and outcomes.',
    icon: <LinkIcon className="h-7 w-7" />,
    className: 'md:col-span-8',
  },
]

const aiFeatures: LandingFeature[] = [
  {
    title: 'Translate CV',
    label: 'Vietnamese to English',
    body: 'Translate your CV from Vietnamese to English while preserving its professional meaning and structure.',
    icon: <FileTextIcon className="h-6 w-6" />,
  },
  {
    title: 'Score Your CV',
    label: 'Overall readiness score',
    body: 'Get an overall CV score to quickly understand the strengths and weaknesses of your current resume.',
    icon: <GraduationCapIcon className="h-6 w-6" />,
  },
  {
    title: 'Get CV Feedback',
    label: 'Practical improvements',
    body: 'Receive detailed feedback and practical suggestions to improve your CV.',
    icon: <CheckIcon className="h-6 w-6" />,
  },
]

const portfolioSteps: LandingFeature[] = [
  {
    title: 'Capture',
    label: '01',
    body: 'Use the CVBuddy mobile app to photograph projects, events, campaigns, and work in progress.',
    icon: <CameraIcon className="h-5 w-5" />,
  },
  {
    title: 'Upload',
    label: '02',
    body: 'Publish selected photos directly to your personal portfolio without moving between tools.',
    icon: <UploadIcon className="h-5 w-5" />,
  },
  {
    title: 'Showcase',
    label: '03',
    body: 'Present real projects and practical experience in one professional, visual space.',
    icon: <EyeIcon className="h-5 w-5" />,
  },
]

const creativeIndustries = [
  'Communication',
  'Marketing',
  'Event',
  'Design',
  'Photography',
  'Content Creation',
] as const

function SectionShell({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  )
}

function SectionIntro({
  eyebrow,
  title,
  children,
  centered = false,
  className,
}: {
  eyebrow?: string
  title: string
  children: ReactNode
  centered?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-10 max-w-2xl', centered && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[var(--color-teal)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-navy)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">{children}</p>
    </div>
  )
}

function SoftCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={cn(
        'p-6 shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]',
        className,
      )}
    >
      {children}
    </Card>
  )
}

function SectionLink({
  to,
  variant = 'primary',
  children,
}: {
  to: string
  variant?: 'primary' | 'secondary'
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={() => {
        if (to.startsWith('#')) {
          window.setTimeout(() => scrollToLandingSection(to), 0)
        }
      }}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] px-6 text-base font-semibold transition-all duration-200',
        variant === 'primary'
          ? 'bg-[var(--color-teal)] text-[var(--color-text-on-teal)] shadow-[var(--shadow-md)] hover:-translate-y-0.5 hover:brightness-95'
          : 'border border-[var(--color-teal)] bg-[var(--color-white)] text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]',
      )}
    >
      {children}
    </Link>
  )
}

export function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      scrollToLandingSection(location.hash)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [location.hash])

  return (
    <>
      <SectionShell
        id="home"
        className="overflow-hidden bg-gradient-to-b from-[var(--color-bg-soft)] via-[var(--color-bg-main)] to-[var(--color-white)] pt-12 lg:pt-16"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-teal)] shadow-[var(--shadow-sm)]">
              <span className="h-2.5 w-2.5 rounded-[var(--radius-full)] bg-[var(--color-cyan)]" />
              AI career support for clearer applications
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-[var(--color-navy)] sm:text-5xl">
              CVBuddy helps you understand and improve your CV.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Review your CV, organize applicant details, collect AI feedback, and shape a portfolio that makes your work easier to trust.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SectionLink to="/register">
                Create your account
                <ArrowRightIcon className="h-5 w-5" />
              </SectionLink>
              <SectionLink to="#ai-buddy" variant="secondary">
                Explore AI Buddy
              </SectionLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-xl)]">
              <div className="bg-[var(--color-bg-soft)] p-5">
                <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)]">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-teal)]">CV score</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--color-navy)]">92/100</p>
                  </div>
                  <img src={heroImage} alt="CVBuddy layered interface artwork" className="h-24 w-24 object-contain" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)]">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                        <GraduationCapIcon className="h-5 w-5" />
                      </span>
                      <p className="font-semibold text-[var(--color-navy)]">Application readiness</p>
                    </div>
                    <div className="h-2 rounded-[var(--radius-full)] bg-[var(--color-gray-200)]">
                      <div className="h-2 w-[82%] rounded-[var(--radius-full)] bg-[var(--color-teal)]" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)]">
                      <p className="text-sm font-semibold text-[var(--color-navy)]">Strong sections</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        Experience and project proof are ready to refine.
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-teal)] p-4 text-[var(--color-text-on-teal)] shadow-[var(--shadow-sm)]">
                      <p className="text-sm font-semibold text-white">Next suggestion</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-on-teal)]">
                        Add measurable outcomes to one project bullet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* <SectionShell id="about-us" className="bg-[var(--color-white)]">
        <div className="grid items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionIntro
            className="mb-0 self-center"
            eyebrow="About us"
            title="The team building a clearer path from experience to opportunity"
          >
            CVBuddy is developed by a collaborative team focused on making CV review, career storytelling, and portfolio building easier for students and early-career applicants.
          </SectionIntro>

          <Card className="overflow-hidden border-[var(--color-navy)] bg-[var(--color-navy)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-cyan)]">Our shared direction</p>
            <h3 className="mt-4 text-2xl font-semibold text-[var(--color-text-on-navy)]">
              Practical tools, thoughtful guidance, and proof that feels personal.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-on-navy)]/70">
              We combine product, design, engineering, and career-focused thinking to help applicants understand what to improve and how to present their work with confidence.
            </p>
          </Card>
        </div>

        <div className="mb-6 mt-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">Meet the builders</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">The CVBuddy development team</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">Six team profiles ready to be updated.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article key={member.id}>
              <Card className="h-full overflow-hidden shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-md)]">
                <div className="flex aspect-[16/10] items-center justify-center bg-[var(--color-bg-main)]">
                  {member.image ? (
                    <img className="h-full w-full object-cover" src={member.image} alt={`${member.name} profile`} />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-full)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-white)] text-[var(--color-text-muted)]">
                      <UserIcon aria-hidden="true" className="h-9 w-9" />
                      <span className="sr-only">Member photo placeholder</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-[var(--color-border)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">
                    Team member {String(member.id).padStart(2, '0')}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-[var(--color-navy)]">{member.name}</h4>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{member.role}</p>
                </div>
              </Card>
            </article>
          ))}
        </div>
      </SectionShell> */}

      <SectionShell id="project" className="bg-[var(--color-bg-soft)]">
        <SectionIntro eyebrow="Project" title="One workspace for your applicant story">
          CVBuddy brings the main preparation pieces together: CV review, AI improvement prompts, applicant profile details, and portfolio evidence.
        </SectionIntro>

        <div className="grid gap-5 md:grid-cols-12">
          {projectFeatures.map((feature) => (
            <SoftCard key={feature.title} className={cn('min-h-[220px]', feature.className)}>
              <div
                className={cn(
                  'mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]',
                  feature.inverted
                    ? 'bg-[color-mix(in_srgb,var(--color-white)_18%,transparent)] text-[var(--color-text-on-teal)]'
                    : 'bg-[var(--color-white)] text-[var(--color-teal)]',
                )}
              >
                {feature.icon}
              </div>
              <h3
                className={cn(
                  'text-xl font-semibold',
                  feature.inverted ? 'text-[var(--color-text-on-teal)]' : 'text-[var(--color-navy)]',
                )}
              >
                {feature.title}
              </h3>
              <p
                className={cn(
                  'mt-3 max-w-xl text-base leading-relaxed',
                  feature.inverted ? 'text-[var(--color-text-on-teal)]' : 'text-[var(--color-text-secondary)]',
                )}
              >
                {feature.body}
              </p>
            </SoftCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="ai-buddy" className="bg-[var(--color-white)]">
        <SectionIntro centered eyebrow="AI Buddy" title="Three focused ways to understand and improve your CV">
          Translate your content, see an overall readiness score, and review practical feedback in one guided CVBuddy workspace.
        </SectionIntro>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature) => (
            <article key={feature.title}>
              <Card className="group h-full p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-teal)] hover:shadow-[var(--shadow-lg)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] text-[var(--color-teal)] transition-colors group-hover:bg-[var(--color-teal)] group-hover:text-[var(--color-text-on-teal)]">
                    {feature.icon}
                  </span>
                  <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-main)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    AI feature
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">{feature.label}</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{feature.body}</p>
              </Card>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-teal)] px-6 text-base font-semibold text-[var(--color-text-on-teal)] shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95"
          >
            Create account
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </SectionShell>

      <SectionShell id="portfolio" className="bg-[var(--color-bg-soft)]">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionIntro
              className="mb-8"
              eyebrow="Portfolio"
              title="Build Your Portfolio Anywhere"
            >
              Capture your work with the CVBuddy mobile app and publish it directly to your personal portfolio.
            </SectionIntro>

            <p className="mb-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
              Showcase real projects, events, campaigns, and creative work in one professional space. Turn practical experience into visual proof that is easy to revisit and share.
            </p>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {portfolioSteps.map((step) => (
                <Card key={step.title} className="flex h-full items-start gap-4 p-4 shadow-[var(--shadow-sm)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-white)] text-[var(--color-teal)] shadow-[var(--shadow-sm)]">
                    {step.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">{step.label}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--color-navy)]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.body}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-[var(--color-navy)]">Ideal for visual and creative fields</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {creativeIndustries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    {industry}
                  </span>
                ))}
                <span className="rounded-[var(--radius-full)] border border-dashed border-[var(--color-border-hover)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
                  Other creative fields
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]" aria-hidden="true">
            <div className="rounded-[calc(var(--radius-xl)*2)] bg-[var(--color-navy)] p-3 shadow-[var(--shadow-xl)]">
              <div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-white)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                      <CameraIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-navy)]">CVBuddy Mobile</p>
                      <p className="text-xs text-[var(--color-text-muted)]">New portfolio moment</p>
                    </div>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-[var(--radius-full)] bg-[var(--color-success)]" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-teal)] bg-[var(--color-bg-soft)] text-center">
                    <CameraIcon className="h-10 w-10 text-[var(--color-teal)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">Campaign behind the scenes</p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Photo placeholder</p>
                  </div>

                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <UploadIcon className="h-4 w-4 text-[var(--color-teal)]" />
                        <p className="text-sm font-semibold text-[var(--color-navy)]">Publishing to portfolio</p>
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-success)]">Complete</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-gray-200)]">
                      <div className="h-full w-full rounded-[var(--radius-full)] bg-[var(--color-teal)]" />
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-navy)] p-4">
                    <div className="flex items-center gap-2 text-[var(--color-cyan)]">
                      <EyeIcon className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-cyan)]">Portfolio preview</p>
                    </div>
                    <p className="mt-3 text-base font-semibold text-[var(--color-text-on-navy)]">Spring campaign launch</p>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-on-navy)]/70">
                      A visual project moment ready to connect with skills, experience, and outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </>
  )
}

export default LandingPage
