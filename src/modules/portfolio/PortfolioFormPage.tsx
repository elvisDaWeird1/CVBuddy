import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormGroup } from '@/components/ui/form'
import { ArrowRightIcon } from '@/components/ui/icons'
import { getPortfolio, getPortfolioErrorMessage, getPortfolioErrorStatus, getPortfolioFieldError, updatePortfolio } from './portfolioApi'
import type { PortfolioProfileInput } from './portfolioTypes'
import { LoadingState, Notice, PageHeading, PageShell } from './PortfolioShared'

const portfolioSchema = z.object({
  headline: z.string().trim().max(180, 'Headline must be 180 characters or fewer.'),
  about: z.string().trim().max(5000, 'About must be 5,000 characters or fewer.'),
  desiredRole: z.string().trim().max(180, 'Desired role must be 180 characters or fewer.'),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.'),
  skills: z.string().max(2000, 'Skills text is too long.'),
  socialLinks: z.string().max(2000, 'Social links text is too long.'),
})

type PortfolioFormValues = z.infer<typeof portfolioSchema>

function parseLines(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function parseSocialLinks(value: string) {
  const links: Record<string, string> = {}
  for (const line of value.split('\n').map((item) => item.trim()).filter(Boolean)) {
    const separator = line.indexOf('|')
    if (separator <= 0) continue
    const platform = line.slice(0, separator).trim()
    const url = line.slice(separator + 1).trim()
    if (platform && url) links[platform] = url
  }
  return links
}

function getInvalidSocialLink(links: Record<string, string>) {
  return Object.values(links).find((url) => !/^https?:\/\//i.test(url))
}

function hasInvalidSocialLinkLine(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).find((line) => !line.includes('|'))
}

function serializeSocialLinks(links: Record<string, string>) {
  return Object.entries(links).map(([platform, url]) => `${platform}|${url}`).join('\n')
}

export default function PortfolioFormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<unknown>(null)
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { headline: '', about: '', desiredRole: '', slug: '', skills: '', socialLinks: '' },
  })
  const slug = useWatch({ control, name: 'slug' })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const portfolio = await getPortfolio()
        if (active && portfolio) reset({ headline: portfolio.headline, about: portfolio.about, desiredRole: portfolio.desiredRole, slug: portfolio.slug, skills: portfolio.skills.join(', '), socialLinks: serializeSocialLinks(portfolio.socialLinks) })
      } catch (error) {
        if (active && getPortfolioErrorStatus(error) !== 404) setPageError(getPortfolioErrorMessage(error, 'Unable to load your portfolio.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [reset])

  const onSubmit: SubmitHandler<PortfolioFormValues> = async (values) => {
    setPageError(null)
    setSavedMessage(null)
    setServerError(null)
    const invalidSocialLinkLine = hasInvalidSocialLinkLine(values.socialLinks)
    if (invalidSocialLinkLine) {
      setPageError(`Use platform|URL for each social link. Check: ${invalidSocialLinkLine}`)
      return
    }
    const payload: PortfolioProfileInput = {
      headline: values.headline || undefined,
      about: values.about || undefined,
      desiredRole: values.desiredRole || undefined,
      slug: values.slug.trim().toLowerCase(),
      skills: parseLines(values.skills),
      socialLinks: parseSocialLinks(values.socialLinks),
    }
    const invalidSocialLink = getInvalidSocialLink(payload.socialLinks ?? {})
    if (invalidSocialLink) {
      setPageError(`Social links must use http:// or https://. Check: ${invalidSocialLink}`)
      return
    }
    try {
      await updatePortfolio(payload)
      setSavedMessage('Portfolio profile saved. It remains private until you publish it.')
      navigate('/portfolio', { replace: true })
    } catch (error) {
      setServerError(error)
      setPageError(getPortfolioErrorMessage(error, 'Unable to save your portfolio.'))
    }
  }

  if (loading) return <PageShell><LoadingState label="Loading portfolio form…" /></PageShell>

  return (
    <PageShell>
      <PageHeading eyebrow="Portfolio settings" title="Edit portfolio profile" description="Shape the profile visitors will see when you decide to publish. Saving does not publish the portfolio." actions={<Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]">Back to workspace <ArrowRightIcon className="h-4 w-4" /></Link>} />
      {pageError && <div className="mb-6"><Notice>{getPortfolioErrorStatus(serverError) === 409 ? 'That slug is already in use. Choose a different public URL.' : pageError}</Notice></div>}
      {savedMessage && <div className="mb-6"><Notice kind="success">{savedMessage}</Notice></div>}
      <form className="grid gap-6 lg:grid-cols-[1.5fr_1fr]" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader><CardTitle>Profile story</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <Input label="Headline" placeholder="Product designer building thoughtful digital tools" error={errors.headline?.message} state={errors.headline ? 'error' : 'default'} {...register('headline')} />
            <FormGroup label="About" error={errors.about?.message} helperText="Up to 5,000 characters."><textarea className="min-h-36 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-teal)] focus:shadow-[var(--focus-ring)]" placeholder="What do you care about, and what kind of work do you want to be known for?" {...register('about')} /></FormGroup>
            <Input label="Desired role" placeholder="Junior Product Designer" error={errors.desiredRole?.message} state={errors.desiredRole ? 'error' : 'default'} {...register('desiredRole')} />
            <FormGroup label="Skills" helperText="Separate skills with commas."><input className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-teal)] focus:shadow-[var(--focus-ring)]" placeholder="Research, Figma, React" {...register('skills')} /></FormGroup>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Public URL</CardTitle></CardHeader>
            <CardContent className="space-y-3"><Input label="Slug" placeholder="alex-sterling" error={errors.slug?.message || getPortfolioFieldError(serverError, 'slug')} state={errors.slug || getPortfolioFieldError(serverError, 'slug') ? 'error' : 'default'} {...register('slug', { onChange: (event) => { event.target.value = event.target.value.toLowerCase() } })} /><p className="break-all rounded-[var(--radius-md)] bg-[var(--color-gray-50)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">{window.location.origin}/p/{slug || 'your-slug'}</p><p className="text-xs leading-relaxed text-[var(--color-text-muted)]">The backend trims and lowercases the slug, then validates lowercase letters, numbers, and hyphens. The URL is available publicly only after publishing.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Social links</CardTitle></CardHeader>
            <CardContent><FormGroup helperText="One per line in the format platform|https://example.com"><textarea className="min-h-28 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-teal)] focus:shadow-[var(--focus-ring)]" placeholder={'github|https://github.com/you\nlinkedin|https://linkedin.com/in/you'} {...register('socialLinks')} /></FormGroup></CardContent>
          </Card>
          <div className="flex justify-end gap-3"><Link to="/portfolio"><Button type="button" variant="secondary">Cancel</Button></Link><Button type="submit" loading={isSubmitting}>Save profile</Button></div>
        </div>
      </form>
    </PageShell>
  )
}
