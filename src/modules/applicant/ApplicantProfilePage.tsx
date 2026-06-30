import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'
import {
  BriefcaseIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  GraduationCapIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from '@/components/ui/icons'
import { applicantProfile, educationItems, experienceItems } from './profileData'
import { cn } from '@/utils/cn'

interface SurfaceCardProps {
  children: ReactNode
  className?: string
}

function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-lg)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-xl)]',
        className,
      )}
    >
      {children}
    </section>
  )
}

function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
      <span className="text-[var(--color-teal)]">{icon}</span>
      <h2 className="text-2xl font-semibold tracking-normal text-[var(--color-text-primary)]">{children}</h2>
    </div>
  )
}

function Chip({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold',
        muted
          ? 'bg-[var(--color-gray-100)] text-[var(--color-text-primary)]'
          : 'border border-[var(--color-cyan)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]',
      )}
    >
      {children}
    </span>
  )
}

export default function ApplicantProfilePage() {
  return (
    <ApplicantShell>
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8 lg:py-12">
        <div className="space-y-8">
          <SurfaceCard className="overflow-hidden p-0">
            <div className="h-32 bg-[var(--color-bg-soft)]" />
            <div className="-mt-10 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-[var(--color-white)] bg-[var(--color-bg-soft)] text-4xl font-bold text-[var(--color-teal)] shadow-[var(--shadow-md)]">
                  {applicantProfile.initials}
                </div>
                <div>
                  <h1 className="text-4xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)]">
                    {applicantProfile.fullName}
                  </h1>
                  <p className="mt-2 text-lg leading-relaxed text-[var(--color-text-secondary)]">{applicantProfile.headline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip>
                      <span className="mr-1.5 inline-flex"><MapPinIcon className="h-4 w-4" /></span>
                      {applicantProfile.location}
                    </Chip>
                    {applicantProfile.availability.map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                to="/applicant/profile/edit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-5 text-sm font-semibold text-[var(--color-text-on-teal)] shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:brightness-95"
              >
                <EditIcon className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading icon={<UserIcon className="h-6 w-6" />}>About Me</SectionHeading>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">{applicantProfile.summary}</p>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading icon={<BriefcaseIcon className="h-6 w-6" />}>Work Experience</SectionHeading>
            <div className="relative space-y-8">
              <div className="absolute bottom-3 left-[19px] top-8 hidden w-px bg-[var(--color-border)] sm:block" />
              {experienceItems.map((item) => (
                <article key={`${item.role}-${item.company}`} className="relative flex gap-5">
                  <div className="z-10 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-white)] bg-[var(--color-bg-soft)] text-[var(--color-teal)] shadow-[var(--shadow-sm)] sm:flex">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                      <h3 className="text-xl font-semibold tracking-normal text-[var(--color-text-primary)]">{item.role}</h3>
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{item.dates}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-[var(--color-teal)]">{item.company}</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--color-text-secondary)]">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading icon={<GraduationCapIcon className="h-6 w-6" />}>Education</SectionHeading>
            {educationItems.map((item) => (
              <article key={item.degree} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] text-[var(--color-teal)]">
                  <GraduationCapIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-normal text-[var(--color-text-primary)]">{item.degree}</h3>
                  <p className="mt-1 text-base font-medium text-[var(--color-teal)]">{item.school}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {item.dates} • {item.note}
                  </p>
                </div>
              </article>
            ))}
          </SurfaceCard>
        </div>

        <aside className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SurfaceCard className="flex min-h-32 flex-col items-center justify-center p-4 text-center">
              <BriefcaseIcon className="mb-2 h-8 w-8 text-[var(--color-teal)]" />
              <span className="text-3xl font-semibold leading-none text-[var(--color-text-primary)]">3+</span>
              <span className="mt-1 text-sm text-[var(--color-text-secondary)]">Years Exp.</span>
            </SurfaceCard>
            <SurfaceCard className="flex min-h-32 flex-col items-center justify-center p-4 text-center">
              <FileTextIcon className="mb-2 h-8 w-8 text-[var(--color-teal)]" />
              <span className="text-3xl font-semibold leading-none text-[var(--color-text-primary)]">24</span>
              <span className="mt-1 text-sm text-[var(--color-text-secondary)]">Projects Done</span>
            </SurfaceCard>
          </div>

          <SurfaceCard>
            <h2 className="mb-4 border-b border-[var(--color-border)] pb-3 text-2xl font-semibold tracking-normal text-[var(--color-text-primary)]">Contact</h2>
            <ul className="space-y-4 text-base text-[var(--color-text-secondary)]">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-teal)]">
                  <MailIcon className="h-4 w-4" />
                </span>
                <a className="truncate hover:text-[var(--color-teal)]" href={`mailto:${applicantProfile.email}`}>
                  {applicantProfile.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-teal)]">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span>{applicantProfile.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-teal)]">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <span className="truncate">{applicantProfile.portfolioUrl}</span>
              </li>
            </ul>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="mb-4 border-b border-[var(--color-border)] pb-3 text-2xl font-semibold tracking-normal text-[var(--color-text-primary)]">Top Skills</h2>
            <div className="flex flex-wrap gap-2">
              {applicantProfile.skills.map((skill, index) => (
                <Chip key={skill} muted={index > 3}>{skill}</Chip>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="mb-4 border-b border-[var(--color-border)] pb-3 text-2xl font-semibold tracking-normal text-[var(--color-text-primary)]">Documents</h2>
            <Link
              to="/coming-soon"
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] px-4 py-3 transition-colors hover:border-[var(--color-teal)] hover:bg-[var(--color-bg-main)]"
            >
              <FileTextIcon className="h-6 w-6 shrink-0 text-[var(--color-error)]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-[var(--color-text-primary)]">{applicantProfile.resumeName}</span>
                <span className="block text-sm text-[var(--color-text-secondary)]">{applicantProfile.resumeUpdated}</span>
              </span>
              <DownloadIcon className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
            </Link>
          </SurfaceCard>
        </aside>
      </div>
    </ApplicantShell>
  )
}
