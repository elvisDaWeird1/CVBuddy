import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { MainLayout } from '@/layouts/ClientLayout/ClientLayout'
import { Button } from '@/components/ui/button'
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

const surveySchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  currentRole: z.string().min(1, 'Choose your current role.'),
  helpNeed: z.string().min(1, 'Choose what you need help with most.'),
  usefulness: z.string().min(1, 'Choose a usefulness rating.'),
  feedback: z.string().trim().max(600, 'Feedback must be 600 characters or fewer.').optional(),
})

type SurveyFormValues = z.infer<typeof surveySchema>

interface ProjectFeature {
  title: string
  body: string
  icon: ReactNode
  className: string
  inverted?: boolean
}

const aboutCards = [
  {
    title: 'Easy to start',
    body: 'Upload, organize, and improve your career materials without needing design or hiring jargon.',
    icon: <CheckIcon className="h-6 w-6" />,
  },
  {
    title: 'Made for applicants',
    body: 'CVBuddy keeps early-career job seekers, students, and career switchers at the center of every workflow.',
    icon: <UserIcon className="h-6 w-6" />,
  },
  {
    title: 'Practical guidance',
    body: 'Clear next steps help turn a rough CV into a stronger, more confident application package.',
    icon: <BriefcaseIcon className="h-6 w-6" />,
  },
] as const

const projectFeatures: ProjectFeature[] = [
  {
    title: 'CV management',
    body: 'Keep versions, updates, and application-ready documents organized in one focused workspace.',
    icon: <FileTextIcon className="h-7 w-7" />,
    className: 'md:col-span-7',
  },
  {
    title: 'AI CV scoring',
    body: 'Spot missing keywords, structure gaps, and weak phrasing before sending your application.',
    icon: <CheckIcon className="h-7 w-7" />,
    className: 'md:col-span-5 bg-[#2563eb] text-white',
    inverted: true,
  },
  {
    title: 'Applicant profile',
    body: 'Build a trusted profile that keeps your experience, education, and goals ready to reuse.',
    icon: <UserIcon className="h-7 w-7" />,
    className: 'md:col-span-5',
  },
  {
    title: 'Portfolio showcase',
    body: 'Present projects and proof of work alongside your CV so employers can see what you can do.',
    icon: <LinkIcon className="h-7 w-7" />,
    className: 'md:col-span-7',
  },
] as const

const helpNeedOptions = [
  { value: 'cv-structure', label: 'CV structure and layout' },
  { value: 'ai-feedback', label: 'AI feedback and scoring' },
  { value: 'profile', label: 'Applicant profile building' },
  { value: 'portfolio', label: 'Portfolio showcase' },
  { value: 'career-prep', label: 'Career preparation' },
]

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'graduate', label: 'Recent graduate' },
  { value: 'job-seeker', label: 'Job seeker' },
  { value: 'career-switcher', label: 'Career switcher' },
  { value: 'working-professional', label: 'Working professional' },
]

const usefulnessOptions = [
  { value: 'very-useful', label: 'Very useful' },
  { value: 'useful', label: 'Useful' },
  { value: 'somewhat-useful', label: 'Somewhat useful' },
  { value: 'not-sure', label: 'Not sure yet' },
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
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[#0061a4]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-normal text-[#111c2d] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#526069] sm:text-lg">{children}</p>
    </div>
  )
}

function SoftCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-[#d8e3fb] bg-white p-6 shadow-[0_4px_20px_rgba(33,150,243,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(33,150,243,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function HomePage() {
  const location = useLocation()
  const [surveyMessage, setSurveyMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      fullName: '',
      email: '',
      currentRole: '',
      helpNeed: '',
      usefulness: '',
      feedback: '',
    },
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
    setSurveyMessage(`Thanks, ${fullName}. Your feedback was saved in this session.`)
    reset()
  }

  return (
    <MainLayout>
      <SectionShell
        id="home"
        className="overflow-hidden bg-gradient-to-b from-[#eef6ff] via-[#f8f9fa] to-white pt-12 lg:pt-16"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full bg-[#dbeafe] px-4 py-2 text-sm font-semibold text-[#0061a4]">
              AI career support for clearer applications
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-[#111c2d] sm:text-5xl lg:text-6xl">
              CVBuddy helps you understand and improve your CV.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#526069]">
              Build a stronger applicant profile, manage CV versions, collect AI feedback, and prepare a portfolio that makes your work easier to trust.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/#survey-form"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 text-base font-semibold text-white shadow-[0_4px_20px_rgba(33,150,243,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#0061a4] hover:text-white"
              >
                Start the survey
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/#ai-buddy"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#b4c5ff] bg-white px-6 text-base font-semibold text-[#0061a4] transition-colors hover:bg-[#e3f2fd] hover:text-[#0061a4]"
              >
                Explore AI Buddy
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[24px] border border-[#d8e3fb] bg-white p-4 shadow-[0_16px_45px_rgba(33,150,243,0.16)] sm:p-6">
              <div className="rounded-[18px] bg-[#f8f9fa] p-5">
                <div className="flex items-center justify-between gap-4 border-b border-[#d8e3fb] pb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0061a4]">CV score</p>
                    <p className="mt-1 text-3xl font-bold text-[#111c2d]">92/100</p>
                  </div>
                  <img
                    src={heroImage}
                    alt="Layered CVBuddy interface preview"
                    className="h-20 w-20 object-contain sm:h-28 sm:w-28"
                  />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[14px] bg-white p-4 shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
                    <p className="text-sm font-semibold text-[#191c1d]">Strong sections</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#526069]">
                      Experience, education, and project proof are ready to refine.
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[#2563eb] p-4 text-white shadow-[0_4px_20px_rgba(33,150,243,0.12)]">
                    <p className="text-sm font-semibold">Next suggestion</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      Add measurable outcomes to your latest project bullet.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[14px] bg-white p-4 shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeafe] text-[#0061a4]">
                      <GraduationCapIcon className="h-4 w-4" />
                    </span>
                    <p className="font-semibold text-[#191c1d]">Application readiness</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#d8e3fb]">
                    <div className="h-2 w-[82%] rounded-full bg-[#2563eb]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="about-us" className="bg-white">
        <SectionIntro eyebrow="About us" title="A calmer way to prepare for the job search" centered>
          CVBuddy exists for applicants who want clear, friendly guidance before they send a CV into the world. It helps users see what is working, what needs polish, and what to do next.
        </SectionIntro>

        <div className="grid gap-5 md:grid-cols-3">
          {aboutCards.map((card) => (
            <SoftCard key={card.title}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#e3f2fd] text-[#0061a4]">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#111c2d]">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#526069]">{card.body}</p>
            </SoftCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="project" className="bg-[#eef4ff]">
        <SectionIntro eyebrow="Project" title="One workspace for your applicant story">
          CVBuddy brings the core pieces of career preparation together: CV management, AI CV scoring, applicant profile details, and a portfolio showcase for real project evidence.
        </SectionIntro>

        <div className="grid gap-5 md:grid-cols-12">
          {projectFeatures.map((feature) => (
            <SoftCard
              key={feature.title}
              className={cn(
                'min-h-[220px] overflow-hidden',
                feature.className,
                feature.inverted && 'border-[#2563eb] bg-[#2563eb]',
              )}
            >
              <div
                className={cn(
                  'mb-6 flex h-12 w-12 items-center justify-center rounded-[14px]',
                  feature.inverted ? 'bg-white/15 text-white' : 'bg-[#e3f2fd] text-[#0061a4]',
                )}
              >
                {feature.icon}
              </div>
              <h3 className={cn('text-xl font-semibold', feature.inverted ? 'text-white' : 'text-[#111c2d]')}>
                {feature.title}
              </h3>
              <p className={cn('mt-3 max-w-xl text-base leading-relaxed', feature.inverted ? 'text-white/90' : 'text-[#526069]')}>
                {feature.body}
              </p>
            </SoftCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="ai-buddy" className="bg-white">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1fr]">
          <div className="order-2 rounded-[24px] border border-[#d8e3fb] bg-[#f8fbff] p-5 shadow-[0_12px_35px_rgba(33,150,243,0.12)] lg:order-1">
            <div className="mb-5 flex items-center gap-3 border-b border-[#d8e3fb] pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                <BriefcaseIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#111c2d]">AI Buddy</h3>
                <p className="text-sm font-medium text-[#0061a4]">Personal CV feedback</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="ml-auto max-w-[82%] rounded-[18px] rounded-tr-[6px] bg-[#2563eb] px-4 py-3 text-sm leading-relaxed text-white">
                Where does my CV need the most improvement?
              </div>
              <div className="max-w-[92%] rounded-[18px] rounded-tl-[6px] border border-[#d8e3fb] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(33,150,243,0.08)]">
                <p className="text-sm leading-relaxed text-[#404752]">
                  Your experience section is strong. I would improve two areas next:
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#526069]">
                  <li className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0061a4]" />
                    Add numbers to show impact in project outcomes.
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0061a4]" />
                    Tune keywords for the role you want next.
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-full border border-[#d8e3fb] bg-white px-4 py-3 text-sm text-[#9ca3af]">
                Ask about your CV...
                <ArrowRightIcon className="h-4 w-4 text-[#0061a4]" />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionIntro eyebrow="AI Buddy" title="Personalized suggestions without the guesswork">
              AI Buddy turns CV review into a conversation. It can point out weak phrasing, missing proof, role-specific keywords, and interview preparation topics so applicants know what to improve next.
            </SectionIntro>
            <div className="grid gap-3 sm:grid-cols-2">
              {['CV wording suggestions', 'Career preparation support', 'ATS keyword guidance', 'Portfolio improvement prompts'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[14px] bg-[#e3f2fd] px-4 py-3 text-sm font-semibold text-[#00497d]">
                  <CheckIcon className="h-4 w-4 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="survey-form" className="bg-[#eaf2ff]">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[24px] border border-[#d8e3fb] bg-white p-6 shadow-[0_16px_45px_rgba(33,150,243,0.14)] sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[#0061a4]">Survey form</p>
              <h2 className="text-3xl font-bold leading-tight tracking-normal text-[#111c2d]">
                Help shape CVBuddy
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#526069]">
                Share what would make this platform most useful for your next application.
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

              <Select
                label="Current role"
                placeholder="Choose your current role"
                options={roleOptions}
                state={errors.currentRole ? 'error' : 'default'}
                error={errors.currentRole?.message}
                {...register('currentRole')}
              />

              <Select
                label="What do you need help with most?"
                placeholder="Choose the main area"
                options={helpNeedOptions}
                state={errors.helpNeed ? 'error' : 'default'}
                error={errors.helpNeed?.message}
                {...register('helpNeed')}
              />

              <Select
                label="How useful do you think this platform is?"
                placeholder="Choose a rating"
                options={usefulnessOptions}
                state={errors.usefulness ? 'error' : 'default'}
                error={errors.usefulness?.message}
                {...register('usefulness')}
              />

              <FormGroup label="Additional feedback" error={errors.feedback?.message}>
                <textarea
                  className="min-h-32 w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-base text-[var(--color-navy)] outline-none transition-all duration-200 placeholder:text-[var(--color-gray-400)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
                  placeholder="What would you want CVBuddy to help with next?"
                  {...register('feedback')}
                />
              </FormGroup>

              {surveyMessage && (
                <p className="rounded-[14px] bg-[#e3f2fd] px-4 py-3 text-sm font-semibold text-[#00497d]">
                  {surveyMessage}
                </p>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                className="h-12 w-full rounded-[12px] bg-[#2563eb] text-base font-semibold hover:bg-[#0061a4]"
                iconRight={<ArrowRightIcon className="h-5 w-5" />}
              >
                Submit survey
              </Button>
            </form>
          </div>
        </div>
      </SectionShell>
    </MainLayout>
  )
}

export default HomePage
