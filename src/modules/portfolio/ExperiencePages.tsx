import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormGroup } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BriefcaseIcon, EditIcon, PlusIcon, TrashIcon, UploadIcon } from '@/components/ui/icons'
import {
  archiveExperience,
  createEvidence,
  createExperience,
  deleteEvidence,
  deleteExperience,
  getEvidence,
  getExperience,
  getExperiences,
  getMoments,
  getPortfolioErrorMessage,
  publishExperience,
  updateEvidence,
  updateExperience,
  updateExperienceCover,
} from './portfolioApi'
import { EXPERIENCE_STATUSES, EXPERIENCE_TYPES, EXPERIENCE_VISIBILITIES, EVIDENCE_TYPES, type EvidenceInput, type EvidenceType, type ExperienceType, type PortfolioEvidence, type PortfolioExperience, type PortfolioMoment } from './portfolioTypes'
import { ConfirmButton, EmptyState, ExperienceCard, LoadingState, MediaPreview, Notice, PageHeading, PageShell, StatusBadge, TagList } from './PortfolioShared'
import { formatDate, formatDateRange } from './portfolioFormat'

const typeOptions = EXPERIENCE_TYPES.map((value) => ({ value, label: value.replaceAll('-', ' ') }))
const visibilityOptions = EXPERIENCE_VISIBILITIES.map((value) => ({ value, label: value === 'portfolio' ? 'Portfolio (public-ready)' : 'Private' }))
const portfolioUploadMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export function ExperienceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<PortfolioExperience[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? '')
  const requestId = useRef(0)

  async function load(page = pagination.page) {
    const currentRequest = ++requestId.current
    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getExperiences({ page, limit: 12, search: search || undefined, status: status as typeof EXPERIENCE_STATUSES[number] || undefined, type: type as ExperienceType || undefined })
      if (currentRequest !== requestId.current) return
      setItems(result.items)
      setPagination(result.pagination ?? { page, limit: 12, total: result.items.length, totalPages: 1 })
    } catch (error) {
      if (currentRequest !== requestId.current) return
      setErrorMessage(getPortfolioErrorMessage(error, 'Unable to load experiences.'))
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(1) }, 0)
    return () => { window.clearTimeout(timer); requestId.current += 1 }
  // The committed URL is the request trigger; local filter text must not fetch before Apply.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams()
    if (search) next.set('search', search)
    if (status) next.set('status', status)
    if (type) next.set('type', type)
    setSearchParams(next)
  }

  return <PageShell>
    <PageHeading eyebrow="Career journey" title="Experiences" description="Turn projects, roles, learning, and community work into clear professional chapters." actions={<Link to="/portfolio/experiences/new"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>New experience</Button></Link>} />
    {errorMessage && <div className="mb-6"><Notice>{errorMessage}</Notice></div>}
    <Card className="mb-6"><CardContent><form className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end" onSubmit={applyFilters}><Input label="Search" placeholder="Title, role, organization…" value={search} onChange={(event) => setSearch(event.target.value)} /><Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} placeholder="All statuses" options={EXPERIENCE_STATUSES.map((value) => ({ value, label: value }))} /><Select label="Type" value={type} onChange={(event) => setType(event.target.value)} placeholder="All types" options={typeOptions} /><Button type="submit">Apply filters</Button></form></CardContent></Card>
    {loading ? <LoadingState label="Loading experiences…" /> : !items.length ? <EmptyState title="No experiences match" description="Try a different filter or create your first professional experience." action={<Link to="/portfolio/experiences/new"><Button>Create experience</Button></Link>} /> : <><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}</div><div className="mt-6 flex items-center justify-between gap-3 text-sm text-[var(--color-text-secondary)]"><span>{pagination.total} experience{pagination.total === 1 ? '' : 's'}</span><div className="flex gap-2"><Button size="sm" variant="secondary" disabled={pagination.page <= 1} onClick={() => void load(pagination.page - 1)}>Previous</Button><span className="flex items-center px-2">Page {pagination.page} of {pagination.totalPages}</span><Button size="sm" variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => void load(pagination.page + 1)}>Next</Button></div></div></>}
  </PageShell>
}

const experienceSchema = z.object({
  type: z.enum(EXPERIENCE_TYPES),
  title: z.string().trim().min(2, 'Title is required.').max(150),
  organization: z.string().max(150),
  role: z.string().max(150),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
  location: z.string().max(200),
  description: z.string().max(2000),
  visibility: z.enum(EXPERIENCE_VISIBILITIES),
  responsibilities: z.array(z.object({ value: z.string().trim().min(1, 'Add a responsibility or remove this row.') })),
  achievements: z.array(z.object({ value: z.string().trim().min(1, 'Add an achievement or remove this row.') })),
  skills: z.array(z.object({ value: z.string().trim().min(1, 'Add a skill or remove this row.') })),
}).superRefine((values, context) => {
  if (values.startDate && values.endDate && values.startDate > values.endDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date cannot be before start date.' })
  if (values.isCurrent && values.endDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be empty for a current experience.' })
})

type ExperienceFormValues = z.infer<typeof experienceSchema>

function ArrayEditor({ title, name, control, register, errors }: { title: string; name: 'responsibilities' | 'achievements' | 'skills'; control: Parameters<typeof useFieldArray<ExperienceFormValues>>[0]['control']; register: ReturnType<typeof useForm<ExperienceFormValues>>['register']; errors: ReturnType<typeof useForm<ExperienceFormValues>>['formState']['errors'] }) {
  const { fields, append, remove } = useFieldArray({ control, name })
  return <div className="space-y-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-teal)]" onClick={() => append({ value: '' })}><PlusIcon className="h-4 w-4" />Add</button></div>{fields.map((field, index) => <div key={field.id} className="flex items-start gap-2"><input className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)] focus:shadow-[var(--focus-ring)]" placeholder={`Add ${title.toLowerCase().replace(/s$/, '')}`} {...register(`${name}.${index}.value`)} /><button type="button" className="mt-2 text-[var(--color-error)]" onClick={() => remove(index)} aria-label={`Remove ${title} item ${index + 1}`}><TrashIcon className="h-4 w-4" /></button>{errors[name]?.[index]?.value?.message && <p className="text-xs text-[var(--color-error)]">{errors[name][index]?.value?.message}</p>}</div>)}{!fields.length && <p className="text-xs text-[var(--color-text-muted)]">No items added yet.</p>}</div>
}

export function ExperienceFormPage() {
  const navigate = useNavigate()
  const { experienceId } = useParams()
  const editing = Boolean(experienceId)
  const [loading, setLoading] = useState(editing)
  const [pageError, setPageError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { type: 'project', title: '', organization: '', role: '', startDate: '', endDate: '', isCurrent: false, location: '', description: '', visibility: 'private', responsibilities: [], achievements: [], skills: [] },
  })
  const isCurrent = useWatch({ control, name: 'isCurrent' })

  useEffect(() => {
    if (!experienceId) return
    let active = true
    const id = experienceId
    async function load() {
      try {
        const experience = await getExperience(id)
        if (active && experience) reset({ type: experience.type, title: experience.title, organization: experience.organization, role: experience.role, startDate: experience.startDate?.slice(0, 10) ?? '', endDate: experience.endDate?.slice(0, 10) ?? '', isCurrent: experience.isCurrent, location: experience.location, description: experience.description, visibility: experience.visibility, responsibilities: experience.responsibilities.map((value) => ({ value })), achievements: experience.achievements.map((value) => ({ value })), skills: experience.skills.map((value) => ({ value })) })
      } catch (error) { if (active) setPageError(getPortfolioErrorMessage(error, 'Unable to load experience.')) } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [experienceId, reset])

  const onSubmit: SubmitHandler<ExperienceFormValues> = async (values) => {
    setPageError(null)
    const payload = { type: values.type, title: values.title.trim(), organization: values.organization.trim() || undefined, role: values.role.trim() || undefined, startDate: values.startDate || undefined, endDate: values.isCurrent ? undefined : values.endDate || undefined, isCurrent: values.isCurrent, location: values.location.trim() || undefined, description: values.description.trim() || undefined, visibility: values.visibility, responsibilities: values.responsibilities.map((item) => item.value.trim()).filter(Boolean), achievements: values.achievements.map((item) => item.value.trim()).filter(Boolean), skills: values.skills.map((item) => item.value.trim()).filter(Boolean) }
    try {
      const result = editing && experienceId ? await updateExperience(experienceId, payload) : await createExperience(payload)
      if (result) navigate(`/portfolio/experiences/${result.id}`, { replace: true })
    } catch (error) { setPageError(getPortfolioErrorMessage(error, 'Unable to save experience.')) }
  }

  if (loading) return <PageShell><LoadingState label="Loading experience form…" /></PageShell>
  return <PageShell>
    <PageHeading eyebrow="Experience editor" title={editing ? 'Edit experience' : 'Create experience'} description="Capture the context, contribution, and proof behind a professional chapter." actions={<Link to={editing && experienceId ? `/portfolio/experiences/${experienceId}` : '/portfolio/experiences'} className="text-sm font-semibold text-[var(--color-teal)]">Cancel</Link>} />
    {pageError && <div className="mb-6"><Notice>{pageError}</Notice></div>}
    <form className="grid gap-6 lg:grid-cols-[1.4fr_1fr]" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-6"><Card><CardHeader><CardTitle>Experience details</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Select label="Type" options={typeOptions} {...register('type')} /><Input label="Title" error={errors.title?.message} state={errors.title ? 'error' : 'default'} {...register('title')} /><Input label="Organization" {...register('organization')} /><Input label="Role" {...register('role')} /><Input type="date" label="Start date" {...register('startDate')} /><Input type="date" label="End date" disabled={isCurrent} error={errors.endDate?.message} state={errors.endDate ? 'error' : 'default'} {...register('endDate')} /><Input label="Location" {...register('location')} /><Select label="Visibility" options={visibilityOptions} {...register('visibility')} /></div><label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]"><input type="checkbox" className="h-4 w-4 accent-[var(--color-teal)]" {...register('isCurrent')} />This is a current experience</label><FormGroup label="Description" helperText="Up to 2,000 characters." error={errors.description?.message}><textarea className="min-h-36 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)] focus:shadow-[var(--focus-ring)]" {...register('description')} /></FormGroup></CardContent></Card><Card><CardHeader><CardTitle>Evidence in your own words</CardTitle></CardHeader><CardContent className="space-y-6"><ArrayEditor title="Responsibilities" name="responsibilities" control={control} register={register} errors={errors} /><ArrayEditor title="Achievements" name="achievements" control={control} register={register} errors={errors} /><ArrayEditor title="Skills" name="skills" control={control} register={register} errors={errors} /></CardContent></Card></div>
      <aside className="space-y-6"><Card><CardHeader><CardTitle>Publishing note</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]"><p>New experiences start as drafts. Publishing later makes the experience eligible for the public portfolio when visibility is set to portfolio.</p><p>At least one professional content field is required when you publish.</p></CardContent></Card><div className="flex justify-end"><Button type="submit" loading={isSubmitting}>{editing ? 'Save experience' : 'Create experience'}</Button></div></aside>
    </form>
  </PageShell>
}

interface EvidenceManagerProps {
  evidence: PortfolioEvidence[]
  busy: string | null
  onDelete: (id: string) => void
  onSave: (id: string, payload: EvidenceInput, file?: File) => Promise<void>
}

function EvidenceManager({ evidence, busy, onDelete, onSave }: EvidenceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<EvidenceType>('github')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [error, setError] = useState<string | null>(null)

  const startEditing = (item: PortfolioEvidence) => {
    setEditingId(item.id)
    setType(item.type)
    setTitle(item.title)
    setDescription(item.description)
    setUrl(item.url ?? '')
    setFile(undefined)
    setError(null)
  }

  const submit = async (event: React.FormEvent, item: PortfolioEvidence) => {
    event.preventDefault()
    const nextUrl = url.trim()
    if (!title.trim()) { setError('Title is required.'); return }
    if (nextUrl && !/^https?:\/\//i.test(nextUrl)) { setError('Evidence URL must start with http:// or https://.'); return }
    if (!nextUrl && !file && !item.url && !item.asset) { setError('Evidence must keep an external URL or an uploaded file.'); return }
    if (file && !portfolioUploadMimeTypes.includes(file.type)) { setError('Unsupported evidence file type. Use JPG, PNG, WEBP, MP4, PDF, DOC or DOCX.'); return }
    if (file && file.size > 10 * 1024 * 1024) { setError('Evidence files must be 10 MB or smaller.'); return }
    setError(null)
    try {
      await onSave(item.id, { type, title: title.trim(), description: description.trim() || undefined, url: nextUrl || item.url || undefined }, file)
      setEditingId(null)
    } catch {
      // Parent keeps the API error visible in the page notice.
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Evidence attached</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {evidence.length ? evidence.map((item) => (
          <div key={item.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.type} · {item.verificationStatus}</p></div>
              <div className="flex items-center gap-2"><button type="button" className="text-sm font-semibold text-[var(--color-teal)]" onClick={() => startEditing(item)} aria-label={`Edit ${item.title}`}>Edit</button><button type="button" className="text-[var(--color-error)]" disabled={busy === `evidence-${item.id}`} onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}><TrashIcon className="h-4 w-4" /></button></div>
            </div>
            {item.description && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.description}</p>}
            {item.url ? <a className="mt-2 block truncate text-sm font-medium text-[var(--color-teal)]" href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a> : item.asset && <a className="mt-2 block truncate text-sm font-medium text-[var(--color-teal)]" href={item.asset.secureUrl} target="_blank" rel="noopener noreferrer">{item.asset.originalFilename}</a>}
            {editingId === item.id && <form className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4" onSubmit={(event) => void submit(event, item)}><Select label="Type" value={type} onChange={(event) => setType(event.target.value as EvidenceType)} options={EVIDENCE_TYPES.map((value) => ({ value, label: value }))} /><Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} /><FormGroup label="Description"><textarea className="min-h-20 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)]" value={description} onChange={(event) => setDescription(event.target.value)} /></FormGroup><Input label="External URL" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder={item.url ?? 'Optional when a file exists'} /><div><label className="block text-sm font-medium text-[var(--color-navy)]">Replace uploaded file (optional)</label><input className="mt-1.5 block w-full text-sm" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp4,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,video/mp4" onChange={(event) => setFile(event.target.files?.[0])} /></div>{error && <p className="text-xs text-[var(--color-error)]" role="alert">{error}</p>}<div className="flex gap-2"><Button type="submit" size="sm" loading={busy === `evidence-edit-${item.id}`}>Save evidence</Button><Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button></div></form>}
          </div>
        )) : <p className="text-sm text-[var(--color-text-secondary)]">No evidence added yet.</p>}
      </CardContent>
    </Card>
  )
}

export function ExperienceDetailPage() {
  const navigate = useNavigate()
  const { experienceId } = useParams()
  const [experience, setExperience] = useState<PortfolioExperience | null>(null)
  const [moments, setMoments] = useState<PortfolioMoment[]>([])
  const [evidence, setEvidence] = useState<PortfolioEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('github')
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | undefined>()
  const requestId = useRef(0)

  async function load() {
    if (!experienceId) return
    const currentRequest = ++requestId.current
    setLoading(true)
    try {
      const [nextExperience, nextMoments, nextEvidence] = await Promise.all([getExperience(experienceId), getMoments({ experienceId, limit: 100 }), getEvidence(experienceId)])
      if (currentRequest !== requestId.current) return
      if (nextExperience) setExperience(nextExperience)
      setMoments(nextMoments.items)
      setEvidence(nextEvidence)
    } catch (error) {
      if (currentRequest === requestId.current) setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to load experience.') })
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { setExperience(null); setMoments([]); setEvidence([]); void load() }, 0)
    return () => { window.clearTimeout(timer); requestId.current += 1 }
  // The route parameter is the request trigger; the loader itself is intentionally recreated per render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId])

  const runAction = async (key: string, action: () => Promise<PortfolioExperience | void>) => {
    setBusy(key); setMessage(null)
    try { const result = await action(); if (result) setExperience(result); else await load(); setMessage({ kind: 'success', text: 'Experience updated.' }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Action failed.') }) } finally { setBusy(null) }
  }

  const submitEvidence = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!experienceId || !evidenceTitle.trim() || (!evidenceUrl.trim() && !evidenceFile)) { setMessage({ kind: 'error', text: 'Add a title and either an http(s) URL or a file.' }); return }
    if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) { setMessage({ kind: 'error', text: 'Evidence URL must start with http:// or https://.' }); return }
    if (evidenceFile && !portfolioUploadMimeTypes.includes(evidenceFile.type)) { setMessage({ kind: 'error', text: 'Unsupported evidence file type. Use JPG, PNG, WEBP, MP4, PDF, DOC or DOCX.' }); return }
    if (evidenceFile && evidenceFile.size > 10 * 1024 * 1024) { setMessage({ kind: 'error', text: 'Evidence files must be 10 MB or smaller.' }); return }
    setBusy('evidence'); setMessage(null)
    try { const created = await createEvidence(experienceId, { type: evidenceType, title: evidenceTitle.trim(), description: evidenceDescription.trim() || undefined, url: evidenceUrl.trim() || undefined }, evidenceFile); if (created) setEvidence((current) => [created, ...current]); setEvidenceTitle(''); setEvidenceDescription(''); setEvidenceUrl(''); setEvidenceFile(undefined); setMessage({ kind: 'success', text: 'Evidence added.' }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to add evidence.') }) } finally { setBusy(null) }
  }

  const removeEvidence = async (id: string) => { if (!window.confirm('Delete this evidence? This cannot be undone.')) return; setBusy(`evidence-${id}`); try { await deleteEvidence(id); setEvidence((current) => current.filter((item) => item.id !== id)); setMessage({ kind: 'success', text: 'Evidence deleted.' }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to delete evidence.') }) } finally { setBusy(null) } }
  const saveEvidence = async (id: string, payload: EvidenceInput, file?: File) => { setBusy(`evidence-edit-${id}`); setMessage(null); try { const updated = await updateEvidence(id, payload, file); if (updated) setEvidence((current) => current.map((item) => item.id === id ? updated : item)); setMessage({ kind: 'success', text: 'Evidence updated.' }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to update evidence.') }); throw error } finally { setBusy(null) } }
  const onCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file || !experienceId) return; if (!file.type.startsWith('image/')) { setMessage({ kind: 'error', text: 'Cover must be an image.' }); return } if (file.size > 10 * 1024 * 1024) { setMessage({ kind: 'error', text: 'Cover files must be 10 MB or smaller.' }); return } await runAction('cover', () => updateExperienceCover(experienceId, file)) }

  if (loading) return <PageShell><LoadingState label="Loading experience…" /></PageShell>
  if (!experience) return <PageShell>{message && <div className="mb-6"><Notice kind="error">{message.text}</Notice></div>}<EmptyState title="Experience not found" description="This experience may have been removed or you may not have access to it." action={<Link to="/portfolio/experiences"><Button>Back to experiences</Button></Link>} /></PageShell>

  return <PageShell>
    <PageHeading eyebrow="Experience detail" title={experience.title} description={`${experience.role || experience.organization || 'Professional experience'} · ${formatDateRange(experience)}`} actions={<><Link to={`/portfolio/experiences/${experience.id}/edit`}><Button variant="secondary" iconLeft={<EditIcon className="h-4 w-4" />}>Edit</Button></Link><Link to="/portfolio/experiences" className="inline-flex items-center text-sm font-semibold text-[var(--color-teal)]">All experiences</Link></>} />
    {message && <div className="mb-6"><Notice kind={message.kind}>{message.text}</Notice></div>}
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6"><Card className="overflow-hidden"><div className="relative">{experience.coverAsset ? <img className="h-64 w-full object-cover" src={experience.coverAsset.secureUrl} alt={`${experience.title} cover`} /> : <div className="flex h-40 items-center justify-center bg-[var(--color-bg-soft)] text-[var(--color-teal)]"><BriefcaseIcon className="h-12 w-12" /></div>}<label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-white)] px-3 py-2 text-sm font-semibold text-[var(--color-teal)] shadow-[var(--shadow-md)]"><UploadIcon className="h-4 w-4" />Change cover<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void onCoverChange(event)} /></label></div><CardContent className="space-y-5"><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={experience.status === 'published' ? 'success' : experience.status === 'archived' ? 'neutral' : 'warning'}>{experience.status}</StatusBadge><StatusBadge tone="info">{experience.visibility}</StatusBadge>{experience.location && <span className="text-sm text-[var(--color-text-secondary)]">{experience.location}</span>}</div><p className="leading-relaxed text-[var(--color-text-secondary)]">{experience.description || 'No description added yet.'}</p><div><h2 className="mb-2 text-lg font-semibold">Skills</h2><TagList items={experience.skills} /></div><div><h2 className="mb-2 text-lg font-semibold">Responsibilities</h2>{experience.responsibilities.length ? <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{experience.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-sm text-[var(--color-text-muted)]">No responsibilities added.</p>}</div><div><h2 className="mb-2 text-lg font-semibold">Achievements</h2>{experience.achievements.length ? <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{experience.achievements.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-sm text-[var(--color-text-muted)]">No achievements added.</p>}</div></CardContent></Card><Card><CardHeader><CardTitle>Assigned moments</CardTitle></CardHeader><CardContent>{moments.length ? <div className="grid gap-4 sm:grid-cols-2">{moments.map((moment) => <Link key={moment.id} to={`/portfolio/moments/${moment.id}`} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]"><MediaPreview moment={moment} /><div className="p-3"><p className="truncate text-sm font-medium">{moment.caption || 'Untitled moment'}</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{formatDate(moment.capturedAt)}</p></div></Link>)}</div> : <EmptyState title="No moments assigned" description="Assign moments from the moments timeline to show the proof behind this experience." action={<Link to="/portfolio/moments"><Button size="sm">Open moments</Button></Link>} />}</CardContent></Card></div>
      <aside className="space-y-6"><Card><CardHeader><CardTitle>Actions</CardTitle></CardHeader><CardContent className="space-y-3"><Button className="w-full" loading={busy === 'publish'} disabled={experience.status === 'published'} onClick={() => void runAction('publish', () => publishExperience(experience.id))}>Publish experience</Button><Button variant="secondary" className="w-full" loading={busy === 'archive'} disabled={experience.status === 'archived'} onClick={() => void runAction('archive', () => archiveExperience(experience.id))}>Archive experience</Button><ConfirmButton label="Delete experience" variant="danger" loading={busy === 'delete'} message="Delete this experience? Assigned moments will remain but become unassigned. Evidence linked to this experience will also be deleted by the backend." onConfirm={async () => { setBusy('delete'); try { await deleteExperience(experience.id); navigate('/portfolio/experiences', { replace: true }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to delete experience.') }); setBusy(null) } }} /></CardContent></Card><Card><CardHeader><CardTitle>Add evidence</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(event) => void submitEvidence(event)}><Select label="Type" value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)} options={EVIDENCE_TYPES.map((value) => ({ value, label: value }))} /><Input label="Title" value={evidenceTitle} onChange={(event) => setEvidenceTitle(event.target.value)} placeholder="Repository, certificate, article…" /><FormGroup label="Description"><textarea className="min-h-20 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)]" value={evidenceDescription} onChange={(event) => setEvidenceDescription(event.target.value)} /></FormGroup><Input label="External URL" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://…" /><div><label className="block text-sm font-medium text-[var(--color-navy)]">Or upload file</label><input className="mt-1.5 block w-full text-sm" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp4,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,video/mp4" onChange={(event) => setEvidenceFile(event.target.files?.[0])} /></div><Button type="submit" loading={busy === 'evidence'}>Add evidence</Button></form></CardContent></Card><EvidenceManager evidence={evidence} busy={busy} onDelete={(id) => void removeEvidence(id)} onSave={saveEvidence} /></aside>
    </div>
  </PageShell>
}
