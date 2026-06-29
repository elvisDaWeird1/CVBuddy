import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import heroShape from '@/assets/hero.png'
import { MainLayout } from '@/layouts/ClientLayout/ClientLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormGroup } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  FileTextIcon,
  LinkIcon,
  SearchIcon,
  UserIcon,
} from '@/components/ui/icons'
import { cn } from '@/utils/cn'

const surveySchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  currentRole: z.string().min(1, 'Select your current role.'),
  helpNeed: z.string().min(1, 'Choose where you need help most.'),
  usefulness: z.string().min(1, 'Choose a rating.'),
  additionalFeedback: z.string().trim().max(500, 'Please keep feedback under 500 characters.'),
})

type SurveyFormValues = z.infer<typeof surveySchema>

const roleOptions = [
  { value: 'student', label: 'Student or recent graduate' },
  { value: 'job-seeker', label: 'Job seeker' },
  { value: 'career-switcher', label: 'Career switcher' },
  { value: 'working-professional', label: 'Working professional' },
]

const helpOptions = [
  { value: 'cv-management', label: 'Organizing and improving my CV' },
  { value: 'ai-feedback', label: 'Getting AI feedback and scoring' },
  { value: 'profile', label: 'Building a stronger applicant profile' },
  { value: 'portfolio', label: 'Creating a portfolio showcase' },
  { value: 'career-prep', label: 'Preparing for jobs and interviews' },
]

const usefulnessOptions = [
  { value: 'very-useful', label: 'Very useful' },
  { value: 'useful', label: 'Useful' },
  { value: 'maybe', label: 'Maybe useful' },
  { value: 'not-sure', label: 'Not sure yet' },
]

const aboutCards = [
  {
    title: 'Built for job seekers',
    description:
      'CVBuddy helps students, fresh graduates, and early-career applicants turn scattered experience into a clear application story.',
    icon: <UserIcon className="h-6 w-6" />,
  },
  {
    title: 'Guided, not overwhelming',
    description:
      'The platform breaks CV improvement into approachable steps so users can see what to fix, why it matters, and what to do next.',
    icon: <CheckIcon className="h-6 w-6" />,
  },
  {
    title: 'Practical career support',
    description:
      'Every feature is focused on helping applicants prepare stronger profiles, portfolios, and job applications with confidence.',
    icon: <BriefcaseIcon className="h-6 w-6" />,
  },
]

const projectFeatures = [
  {
    title: 'CV management',
    description: 'Store CV versions, keep documents organized, and prepare files for different roles.',
    icon: <FileTextIcon className="h-6 w-6" />,
    className: 'md:col-span-7',
  },
  {
    title: 'AI CV scoring',
    description: 'Review clarity, structure, keyword strength, and readiness with actionable scoring.',
    icon: <SearchIcon className="h-6 w-6" />,
    className: 'md:col-span-5 bg-[#2563eb] text-white',
  },
  {
    title: 'Applicant profile',
    description: 'Collect contact details, goals, education, skills, and experience in one profile.',
    icon: <UserIcon className="h-6 w-6" />,
    className: 'md:col-span-5',
  },
  {
    title: 'Portfolio showcase',
    description: 'Highlight real projects and achievements so recruiters can quickly understand your strengths.',
    icon: <LinkIcon className="h-6 w-6" />,
    className: 'md:col-span-7',
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn('mx-auto max-w-3xl', align === 'center' ? 'text-center' : 'mx-0 text-left')}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[#0061a4]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold leading-tight tracking-normal text-[#191c1d] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#526069] sm:text-lg">
        {description}
      </p>
    </div>
  )
}

function IconBadge({ children, inverted = false }: { children: ReactNode; inverted?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-[14px]',
        inverted ? 'bg-white/15 text-white' : 'bg-[#e3f2fd] text-[#0061a4]',
      )}
    >
      {children}
    </span>
  )
}

function SurfaceCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={cn(
        'rounded-[16px] border-[#dbe7f5] bg-white p-6 shadow-[0_4px_20px_rgba(33,150,243,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)]',
        className,
      )}
    >
      {children}
    </Card>
  )
}

export function HomePage() {
  const location = useLocation()
  const [surveyMessage, setSurveyMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      fullName: '',
      email: '',
      currentRole: '',
      helpNeed: '',
      usefulness: '',
      additionalFeedback: '',
    },
  })

  useEffect(() => {
    const sectionId = location.hash.replace('#', '') || 'home'
    const scrollToSection = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: location.hash ? 'smooth' : 'auto',
        block: 'start',
      })
    }, 0)

    return () => window.clearTimeout(scrollToSection)
  }, [location.hash])

  const onSurveySubmit: SubmitHandler<SurveyFormValues> = ({ fullName }) => {
    const firstName = fullName.trim().split(/\s+/)[0]
    setSurveyMessage(`Thanks, ${firstName}. Your feedback is saved on this page for the CVBuddy team to review later.`)
  }

  return (
    <MainLayout>
      <div className="bg-[#f8fbff]">
        <section
          id="home"
          className="scroll-mt-28 border-b border-[#dbe7f5] bg-[#f5f9ff] px-4 py-8 sm:px-6 sm:py-14 lg:py-20"
        >
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center rounded-full bg-[#e3f2fd] px-3 py-1.5 text-sm font-semibold tracking-normal text-[#0061a4]">
                AI-powered career clarity
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-normal text-[#111c2d] sm:text-5xl">
                CVBuddy helps you understand and improve your CV.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#526069] sm:text-lg">
                A friendly workspace for applicants to manage CVs, get AI feedback, build a profile, and prepare a portfolio that feels ready for real opportunities.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <a
                  href="#survey-form"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#2196f3] px-5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(33,150,243,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#0061a4] hover:text-white"
                >
                  Start survey
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
                <a
                  href="#ai-buddy"
                  className="inline-flex h-12 items-center justify-center rounded-[12px] border border-[#9ecaff] bg-white px-5 text-sm font-semibold text-[#0061a4] transition-all hover:-translate-y-0.5 hover:bg-[#e3f2fd]"
                >
                  Meet AI Buddy
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="rounded-[24px] border border-[#dbe7f5] bg-white p-4 shadow-[0_12px_30px_rgba(30,41,59,0.08)] sm:p-6">
                <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[18px] border border-[#e1e8f5] bg-[#f8fbff] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#191c1d]">CV readiness</span>
                      <span className="rounded-full bg-[#d1fae5] px-2.5 py-1 text-xs font-semibold text-[#047857]">
                        92/100
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="h-2.5 rounded-full bg-[#dbeafe]">
                        <div className="h-2.5 w-[92%] rounded-full bg-[#2196f3]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#526069]">
                        <span>Keywords</span>
                        <span className="text-right text-[#0061a4]">Strong</span>
                        <span>Structure</span>
                        <span className="text-right text-[#0061a4]">Clear</span>
                      </div>
                    </div>
                    <div className="mt-4 hidden rounded-[14px] bg-white p-3 shadow-[0_4px_20px_rgba(33,150,243,0.08)] sm:block">
                      <p className="text-sm font-semibold text-[#191c1d]">AI suggestion</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#526069]">
                        Add one measurable result to your latest project before applying.
                      </p>
                    </div>
                  </div>

                  <div className="hidden min-h-[160px] flex-col justify-between overflow-hidden rounded-[18px] bg-[#e3f2fd] p-4 sm:flex sm:min-h-[260px]">
                    <img
                      src={heroShape}
                      alt=""
                      aria-hidden="true"
                      className="mx-auto h-20 w-24 object-contain opacity-90 sm:h-32 sm:w-36"
                    />
                    <div className="rounded-[14px] bg-white/90 p-3 shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
                      <p className="text-sm font-semibold text-[#191c1d]">Application profile</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#526069]">
                        CV, skills, goals, and portfolio signals in one clean view.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about-us" className="scroll-mt-28 bg-white px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading
              eyebrow="About Us"
              title="A calmer way to prepare for job applications."
              description="CVBuddy exists for applicants who know they have potential, but need clearer guidance on how to present it. The experience stays supportive, practical, and focused on building confidence."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {aboutCards.map((card) => (
                <SurfaceCard key={card.title}>
                  <IconBadge>{card.icon}</IconBadge>
                  <h3 className="mt-6 text-xl font-semibold tracking-normal text-[#191c1d]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#526069]">{card.description}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </section>

        <section id="project" className="scroll-mt-28 bg-[#edf5ff] px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading
              align="left"
              eyebrow="Project"
              title="Everything applicants need to shape a stronger career profile."
              description="The CVBuddy project brings CV management, AI CV scoring, applicant profile details, and portfolio showcase tools into one approachable workspace."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-12">
              {projectFeatures.map((feature) => {
                const inverted = feature.className.includes('text-white')

                return (
                  <SurfaceCard key={feature.title} className={cn('min-h-52', feature.className)}>
                    <IconBadge inverted={inverted}>{feature.icon}</IconBadge>
                    <h3 className={cn('mt-8 text-xl font-semibold tracking-normal', inverted ? 'text-white' : 'text-[#191c1d]')}>
                      {feature.title}
                    </h3>
                    <p className={cn('mt-3 max-w-xl text-sm leading-relaxed', inverted ? 'text-white/85' : 'text-[#526069]')}>
                      {feature.description}
                    </p>
                  </SurfaceCard>
                )
              })}
            </div>
          </div>
        </section>

        <section id="ai-buddy" className="scroll-mt-28 bg-white px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[20px] border border-[#dbe7f5] bg-[#f8fbff] p-4 shadow-[0_12px_30px_rgba(30,41,59,0.08)] sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#dbe7f5] pb-4">
                <IconBadge>
                  <SearchIcon className="h-5 w-5" />
                </IconBadge>
                <div>
                  <h3 className="text-base font-semibold tracking-normal text-[#191c1d]">AI Buddy</h3>
                  <p className="text-sm font-medium text-[#047857]">Ready to review</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="ml-auto max-w-[82%] rounded-[16px] rounded-tr-[4px] bg-[#2563eb] px-4 py-3 text-sm leading-relaxed text-white">
                  What should I improve before sending this CV?
                </div>
                <div className="max-w-[92%] rounded-[16px] rounded-tl-[4px] border border-[#dbe7f5] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
                  <p className="text-sm leading-relaxed text-[#191c1d]">
                    Your structure is strong. I would make the project impact clearer and add measurable results.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#526069]">
                    <li className="flex gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                      Add numbers to show scope, speed, or outcomes.
                    </li>
                    <li className="flex gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                      Match keywords to the job description before applying.
                    </li>
                    <li className="flex gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                      Prepare a short interview story for each highlighted project.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-full border border-[#dbe7f5] bg-white px-4 py-3 text-sm text-[#8a94a6]">
                <span>Ask about your CV...</span>
                <ArrowRightIcon className="h-4 w-4 text-[#0061a4]" />
              </div>
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="AI Buddy"
                title="Personalized CV suggestions and career preparation support."
                description="AI Buddy explains what is working, what needs attention, and how to improve your application materials before a recruiter sees them."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {['CV wording', 'ATS signals', 'Interview prep'].map((item) => (
                  <div key={item} className="rounded-[14px] border border-[#dbe7f5] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#0061a4]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="survey-form" className="scroll-mt-28 bg-[#eaf3ff] px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-3xl rounded-[20px] border border-[#dbe7f5] bg-white p-6 shadow-[0_12px_30px_rgba(30,41,59,0.08)] sm:p-10">
            <SectionHeading
              eyebrow="Survey Form"
              title="Tell us what would help you most."
              description="This short survey stays on the frontend for now and helps shape the next CVBuddy improvements."
            />

            <Form className="mt-10 space-y-6" onSubmit={handleSubmit(onSurveySubmit)}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Alex Nguyen"
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

              <Select
                label="Current role"
                placeholder="Select your current role"
                options={roleOptions}
                state={errors.currentRole ? 'error' : 'default'}
                error={errors.currentRole?.message}
                {...register('currentRole')}
              />

              <Select
                label="What do you need help with most?"
                placeholder="Choose the biggest need"
                options={helpOptions}
                state={errors.helpNeed ? 'error' : 'default'}
                error={errors.helpNeed?.message}
                {...register('helpNeed')}
              />

              <FormGroup
                label="How useful do you think this platform is?"
                error={errors.usefulness?.message}
                required
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {usefulnessOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#dbe7f5] bg-[#f8fbff] px-4 py-3 text-sm font-medium text-[#404752] transition-colors has-[:checked]:border-[#2196f3] has-[:checked]:bg-[#e3f2fd] has-[:checked]:text-[#0061a4]"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="h-4 w-4 border-[#bfc7d4] text-[#2196f3] focus:ring-[#2196f3]"
                        {...register('usefulness')}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </FormGroup>

              <FormGroup label="Additional feedback">
                <textarea
                  rows={4}
                  placeholder="What feature would make CVBuddy more useful for you?"
                  className={cn(
                    'w-full resize-none rounded-lg border bg-white px-4 py-3 text-base text-[var(--color-navy)] outline-none transition-all placeholder:text-[var(--color-gray-400)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]',
                    errors.additionalFeedback ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
                  )}
                  {...register('additionalFeedback')}
                />
                {errors.additionalFeedback && (
                  <p className="mt-1.5 text-xs text-[var(--color-error)]">
                    {errors.additionalFeedback.message}
                  </p>
                )}
              </FormGroup>

              {surveyMessage && (
                <p className="rounded-[12px] bg-[#d1fae5] px-4 py-3 text-sm font-medium text-[#047857]">
                  {surveyMessage}
                </p>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                className="h-12 w-full rounded-[12px] bg-[#2196f3] text-base font-semibold text-white hover:bg-[#0061a4]"
                iconRight={<ArrowRightIcon className="h-5 w-5" />}
              >
                Submit survey
              </Button>
            </Form>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default HomePage
