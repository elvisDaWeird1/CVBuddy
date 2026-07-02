import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormGroup } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  FileTextIcon,
  GraduationCapIcon,
  LinkIcon,
  UserIcon,
} from '@/components/ui/icons'
import heroImage from '@/assets/hero.png'
import { cn } from '@/utils/cn'

type ProjectFeature = {
  title: string
  body: string
  icon: ReactNode
  className: string
  inverted?: boolean
}

const surveyDefaults = {
  fullName: '',
  email: '',
  currentRole: '',
  difficulties: [] as string[],
  aiReadiness: '',
  feedback: '',
}

const surveySchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  currentRole: z.string().min(1, 'Choose your current role.'),
  difficulties: z.array(z.string()).min(1, 'Choose at least one challenge.'),
  aiReadiness: z.string().min(1, 'Choose one answer.'),
  feedback: z.string().trim().max(600, 'Feedback must be 600 characters or fewer.').optional(),
})

type SurveyFormValues = z.infer<typeof surveySchema>

const aboutCards = [
  {
    title: 'Easy to use',
    body: 'A focused flow helps applicants upload, review, and improve career materials without extra complexity.',
    icon: <CheckIcon className="h-6 w-6" />,
  },
  {
    title: 'Personal guidance',
    body: 'Suggestions are shaped around role goals, profile details, and the story each applicant wants to tell.',
    icon: <UserIcon className="h-6 w-6" />,
  },
  {
    title: 'Practical direction',
    body: 'CVBuddy turns broad advice into clear next steps for stronger applications and portfolio proof.',
    icon: <BriefcaseIcon className="h-6 w-6" />,
  },
] as const

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

const aiCapabilities = [
  'Real-time CV feedback',
  'ATS keyword guidance',
  'Interview preparation prompts',
  'Portfolio improvement ideas',
] as const

const roleOptions = [
  { value: 'early-career-applicant', label: 'Early-career applicant' },
  { value: 'recent-graduate', label: 'Recent graduate' },
  { value: 'job-seeker', label: 'Job seeker' },
  { value: 'career-switcher', label: 'Career switcher' },
] as const

const difficultyOptions = [
  { value: 'career-summary', label: 'Writing a clear career summary.' },
  { value: 'limited-experience', label: 'Showing impact with limited experience.' },
  { value: 'layout', label: 'Making the CV layout look professional.' },
  { value: 'ats', label: 'Knowing whether the CV is ATS ready.' },
] as const

const aiReadinessOptions = [
  { value: 'yes', label: 'Yes, I would use AI suggestions' },
  { value: 'maybe', label: 'Maybe, if the guidance is clear' },
  { value: 'not-yet', label: 'Not yet' },
]

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
}: {
  eyebrow?: string
  title: string
  children: ReactNode
  centered?: boolean
}) {
  return (
    <div className={cn('mb-10 max-w-2xl', centered && 'mx-auto text-center')}>
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
    <a
      href={to}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] px-6 text-base font-semibold transition-all duration-200',
        variant === 'primary'
          ? 'bg-[var(--color-teal)] text-[var(--color-text-on-teal)] shadow-[var(--shadow-md)] hover:-translate-y-0.5 hover:brightness-95'
          : 'border border-[var(--color-teal)] bg-[var(--color-white)] text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]',
      )}
    >
      {children}
    </a>
  )
}

export function LandingPage() {
  const location = useLocation()
  const [surveyMessage, setSurveyMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: surveyDefaults,
  })

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const targetId = location.hash.slice(1)
    const timeoutId = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [location.hash])

  const onSubmit: SubmitHandler<SurveyFormValues> = async ({ fullName }) => {
    setSurveyMessage(`Thanks, ${fullName}. Your survey response was saved for this session.`)
    reset(surveyDefaults)
  }

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
              <SectionLink to="#form">
                Start the survey
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
                      <p className="text-sm font-semibold">Next suggestion</p>
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

      <SectionShell id="about-us" className="bg-[var(--color-white)]">
        <SectionIntro eyebrow="About us" title="A calmer way to prepare for the job search" centered>
          CVBuddy is built to reduce the uncertainty around job applications by making CV review, profile preparation, and portfolio storytelling easier to understand.
        </SectionIntro>

        <div className="grid gap-5 md:grid-cols-3">
          {aboutCards.map((card) => (
            <SoftCard key={card.title}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-navy)]">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">{card.body}</p>
            </SoftCard>
          ))}
        </div>
      </SectionShell>

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
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1fr]">
          <Card className="order-2 p-5 shadow-[var(--shadow-lg)] lg:order-1">
            <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-teal)] text-[var(--color-text-on-teal)]">
                <BriefcaseIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-navy)]">AI Buddy</h3>
                <p className="text-sm font-medium text-[var(--color-teal)]">Personal CV feedback</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="ml-auto max-w-[82%] rounded-[var(--radius-xl)] rounded-tr-[var(--radius-sm)] bg-[var(--color-teal)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-on-teal)]">
                Where does my CV need the most improvement?
              </div>
              <div className="max-w-[92%] rounded-[var(--radius-xl)] rounded-tl-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-4 shadow-[var(--shadow-sm)]">
                <p className="text-sm leading-relaxed text-[var(--color-navy)]">
                  Your experience section is strong. I would improve two areas next:
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  <li className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal)]" />
                    Add numbers to show impact in project outcomes.
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal)]" />
                    Tune keywords for the role you want next.
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                Ask about your CV...
                <ArrowRightIcon className="h-4 w-4 text-[var(--color-teal)]" />
              </div>
            </div>
          </Card>

          <div className="order-1 lg:order-2">
            <SectionIntro eyebrow="AI Buddy" title="Personalized suggestions without the guesswork">
              AI Buddy turns CV review into a guided conversation about phrasing, missing evidence, role-specific keywords, and next interview preparation steps.
            </SectionIntro>
            <div className="grid gap-3 sm:grid-cols-2">
              {aiCapabilities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-teal)]"
                >
                  <CheckIcon className="h-4 w-4 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-teal)] px-6 text-base font-semibold text-[var(--color-text-on-teal)] shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95"
            >
              Create account
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="survey-form" className="bg-[var(--color-bg-soft)]">
        <div className="mx-auto max-w-3xl">
          <Card className="p-6 shadow-[var(--shadow-xl)] sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[var(--color-teal)]">Survey form</p>
              <h2 className="text-3xl font-bold leading-tight tracking-normal text-[var(--color-navy)]">
                Help shape CVBuddy
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
                Share what would make CVBuddy most useful for your next application.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Alex Walker"
                  autoComplete="name"
                  state={errors.fullName ? 'error' : 'default'}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  state={errors.email ? 'error' : 'default'}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <FormGroup label="Current role" error={errors.currentRole?.message}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 text-sm text-[var(--color-navy)] transition-colors hover:border-[var(--color-teal)] hover:bg-[var(--color-bg-soft)] has-[:checked]:border-[var(--color-teal)] has-[:checked]:bg-[var(--color-bg-soft)]"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="h-4 w-4 accent-[var(--color-teal)]"
                        {...register('currentRole')}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormGroup>

              <FormGroup label="Challenges when writing a CV" error={errors.difficulties?.message}>
                <div className="space-y-3">
                  {difficultyOptions.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                      <input
                        type="checkbox"
                        value={option.value}
                        className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-teal)]"
                        {...register('difficulties')}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormGroup>

              <Select
                label="Would you use AI suggestions to improve your CV?"
                placeholder="Choose one answer"
                options={aiReadinessOptions}
                state={errors.aiReadiness ? 'error' : 'default'}
                error={errors.aiReadiness?.message}
                {...register('aiReadiness')}
              />

              <FormGroup label="Additional feedback" error={errors.feedback?.message}>
                <textarea
                  className="min-h-32 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-base text-[var(--color-navy)] outline-none transition-all duration-200 placeholder:text-[var(--color-gray-400)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
                  placeholder="What would you want CVBuddy to help with next?"
                  {...register('feedback')}
                />
              </FormGroup>

              {surveyMessage && (
                <p role="status" className="rounded-[var(--radius-lg)] bg-[var(--color-success-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-success)]">
                  {surveyMessage}
                </p>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                className="h-12 w-full rounded-[var(--radius-lg)] text-base font-semibold"
                iconRight={<ArrowRightIcon className="h-5 w-5" />}
              >
                Submit survey
              </Button>
            </form>
          </Card>
        </div>
      </SectionShell>
    </>
  )
}

export default LandingPage
