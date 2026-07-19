import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormGroup } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { UploadProgress } from '@/components/ui/upload-progress'
import { ArrowRightIcon, CameraIcon, TrashIcon, UploadIcon, XIcon } from '@/components/ui/icons'
import { assignMoment, createMoment, deleteMoment, getExperiences, getMoment, getMoments, getPortfolioErrorMessage, unassignMoment, updateMoment } from './portfolioApi'
import { EXPERIENCE_VISIBILITIES, MOMENT_STATUSES, type ExperienceVisibility, type PortfolioExperience, type PortfolioMoment } from './portfolioTypes'
import { ConfirmButton, EmptyState, LoadingState, MediaPreview, Notice, PageHeading, PageShell, StatusBadge, TagList } from './PortfolioShared'
import { formatDate } from './portfolioFormat'
import { compressImageFile, validateImageFile } from '@/utils/imageUpload'
import { cn } from '@/utils/cn'

const validMediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
const mediaAccept = 'image/jpeg,image/png,image/webp,video/mp4'
const visibilityOptions = EXPERIENCE_VISIBILITIES.map((value) => ({ value, label: value === 'portfolio' ? 'Portfolio (public-ready)' : 'Private' }))

function validateFiles(files: File[]) {
  if (!files.length) return 'Choose at least one image or video.'
  if (files.length > 5) return 'A moment can contain at most 5 media files.'
  const invalid = files.find((file) => !validMediaTypes.includes(file.type))
  if (invalid) return `${invalid.name} is not a supported media type.`

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const imageError = validateImageFile(file, { maxBytes: 10 * 1024 * 1024 })
      if (imageError) return `${file.name}: ${imageError}`
    } else if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
      return `${file.name} must be a non-empty video within the 10 MB upload limit.`
    }
  }

  return undefined
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MomentCreatePage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [capturedAt, setCapturedAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState('')
  const [experienceId, setExperienceId] = useState('')
  const [visibility, setVisibility] = useState<ExperienceVisibility>('portfolio')
  const [status, setStatus] = useState<'draft' | 'ready'>('ready')
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [preparingFiles, setPreparingFiles] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    let active = true
    void getExperiences({ limit: 100 }).then((result) => { if (active) setExperiences(result.items) }).catch((error) => { if (active) setErrorMessage(getPortfolioErrorMessage(error, 'Unable to load experiences.')) })
    return () => { active = false }
  }, [])
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files])
  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews])

  const prepareFiles = async (next: File[]) => {
    if (uploading || preparingFiles) return
    const validationError = validateFiles(next)
    setErrorMessage(validationError ?? null)
    if (validationError) return

    setPreparingFiles(true)
    setUploadProgress(0)

    try {
      const prepared: File[] = []
      for (const file of next) {
        prepared.push(file.type.startsWith('image/')
          ? await compressImageFile(file, { maxDimension: 1600, quality: 0.82 })
          : file)
      }
      setFiles(prepared)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to prepare these files for upload.')
    } finally {
      setPreparingFiles(false)
    }
  }

  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? [])
    event.target.value = ''
    void prepareFiles(next)
  }

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
    setErrorMessage(null)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const fileError = validateFiles(files)
    if (fileError) { setErrorMessage(fileError); return }
    if (new Date(capturedAt).getTime() > Date.now() + 5 * 60 * 1000) { setErrorMessage('Captured date cannot be more than 5 minutes in the future.'); return }
    if (uploading || preparingFiles) return
    setUploading(true); setUploadProgress(0); setErrorMessage(null)
    try {
      const moment = await createMoment(
        files,
        { caption: caption.trim() || undefined, capturedAt: new Date(capturedAt).toISOString(), location: location.trim() || undefined, skills: skills.split(',').map((item) => item.trim()).filter(Boolean), experienceId: experienceId || undefined, visibility, status },
        {
          onUploadProgress: (progressEvent) => {
            const value = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : (progressEvent.progress ?? 0) * 100
            setUploadProgress(Math.min(99, Math.round(value)))
          },
        },
      )
      setUploadProgress(100)
      if (moment) navigate('/portfolio', { replace: true })
    } catch (error) {
      setErrorMessage(getPortfolioErrorMessage(error, 'Unable to upload moment.'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <PageShell className="max-w-[1000px]">
      <PageHeading
        eyebrow="Capture proof quickly"
        title="New moment"
        description="Choose media, review the prepared files, then confirm the upload. Images are resized in your browser before they are sent."
        actions={<Link to="/portfolio" className="text-sm font-semibold text-[var(--color-teal)]">Back to Portfolio</Link>}
      />
      {errorMessage && <div className="mb-6"><Notice>{errorMessage}</Notice></div>}

      <form className="grid gap-6 lg:grid-cols-[1.1fr_1fr]" onSubmit={(event) => void submit(event)}>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div
                aria-busy={preparingFiles}
                className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-teal)] bg-[var(--color-bg-soft)] p-6 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (!uploading && !preparingFiles) void prepareFiles(Array.from(event.dataTransfer.files))
                }}
              >
                <CameraIcon className="mx-auto h-10 w-10 text-[var(--color-teal)]" />
                <p className="mt-3 font-semibold text-[var(--color-text-primary)]">
                  {preparingFiles ? 'Preparing images…' : 'Capture, choose, or drop media'}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">JPG, PNG, WEBP or MP4 · up to 5 files · 10 MB each</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <label className={cn('inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-teal)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95', (uploading || preparingFiles) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                    <CameraIcon className="h-4 w-4" />
                    Use camera
                    <input className="sr-only" type="file" accept={mediaAccept} capture="environment" disabled={uploading || preparingFiles} onChange={chooseFiles} />
                  </label>
                  <label className={cn('inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-teal)] bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-bg-soft)]', (uploading || preparingFiles) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                    <UploadIcon className="h-4 w-4" />
                    Choose files
                    <input className="sr-only" type="file" accept={mediaAccept} multiple disabled={uploading || preparingFiles} onChange={chooseFiles} />
                  </label>
                </div>
              </div>

              {preparingFiles ? (
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-teal)]" role="status" aria-live="polite">
                  Resizing and compressing images. You can keep editing the rest of the page.
                </div>
              ) : null}

              {files.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map(({ file, url }, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                        <div className="relative aspect-square bg-[var(--color-gray-100)]">
                          {file.type.startsWith('video/')
                            ? <video className="h-full w-full object-cover" src={url} controls />
                            : <img className="h-full w-full object-cover" src={url} alt={file.name} />}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-medium">{file.name}</p>
                          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{file.type} · {formatBytes(file.size)}</p>
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-error)] disabled:opacity-50"
                            disabled={uploading || preparingFiles}
                            onClick={() => removeFile(index)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <XIcon className="h-3.5 w-3.5" />Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-error)] disabled:opacity-50"
                    disabled={uploading || preparingFiles}
                    onClick={() => setFiles([])}
                    type="button"
                  >
                    Clear selection
                  </button>
                </>
              ) : (
                <p className="text-center text-sm text-[var(--color-text-muted)]">Your media preview will appear here before upload.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Moment details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormGroup label="Caption" helperText="Up to 500 characters.">
                <textarea className="min-h-24 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)]" maxLength={500} value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What happened here?" />
              </FormGroup>
              <Input type="datetime-local" label="Captured at" value={capturedAt} onChange={(event) => setCapturedAt(event.target.value)} />
              <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional" />
              <Input label="Skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Optional, comma separated" />
              <Select label="Experience" value={experienceId} onChange={(event) => setExperienceId(event.target.value)} placeholder="Leave unassigned" options={experiences.filter((item) => item.status !== 'archived').map((item) => ({ value: item.id, label: item.title }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as ExperienceVisibility)} options={visibilityOptions} />
                <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'ready')} options={MOMENT_STATUSES.map((value) => ({ value, label: value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Confirm upload</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Files are sent through the CVBuddy backend. A failed request keeps your preview and details so you can retry.
              </p>
              {uploading ? <UploadProgress className="mt-4" label="Uploading moment" value={uploadProgress} /> : null}
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={!files.length || preparingFiles || uploading}
                loading={uploading}
                iconLeft={<UploadIcon className="h-4 w-4" />}
              >
                Upload moment
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageShell>
  )
}

export function MomentListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<PortfolioMoment[]>([])
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([])
  const [experienceId, setExperienceId] = useState(searchParams.get('experienceId') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [visibility, setVisibility] = useState(searchParams.get('visibility') ?? '')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const requestId = useRef(0)

  async function load() { const currentRequest = ++requestId.current; setLoading(true); setErrorMessage(null); try { const result = await getMoments({ limit: 100, experienceId: experienceId || undefined, status: status as 'draft' | 'ready' || undefined, visibility: visibility as ExperienceVisibility || undefined }); if (currentRequest !== requestId.current) return; setItems(result.items) } catch (error) { if (currentRequest === requestId.current) setErrorMessage(getPortfolioErrorMessage(error, 'Unable to load moments.')) } finally { if (currentRequest === requestId.current) setLoading(false) } }
  useEffect(() => { let active = true; void getExperiences({ limit: 100 }).then((result) => { if (active) setExperiences(result.items) }).catch((error) => { if (active) setErrorMessage(getPortfolioErrorMessage(error, 'Unable to load experiences.')) }); return () => { active = false } }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => { window.clearTimeout(timer); requestId.current += 1 }
  // The committed URL is the request trigger; local filter text must not fetch before Apply.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  const applyFilters = (event: React.FormEvent) => { event.preventDefault(); const next = new URLSearchParams(); if (experienceId) next.set('experienceId', experienceId); if (status) next.set('status', status); if (visibility) next.set('visibility', visibility); setSearchParams(next) }
  const experienceTitle = (id: string | null) => experiences.find((item) => item.id === id)?.title ?? 'Unassigned'
  const doAssign = async (moment: PortfolioMoment, nextExperienceId: string) => { setBusy(moment.id); try { const next = nextExperienceId ? await assignMoment(moment.id, nextExperienceId) : await unassignMoment(moment.id); if (next) setItems((current) => current.map((item) => item.id === moment.id ? next : item)) } catch (error) { setErrorMessage(getPortfolioErrorMessage(error, 'Unable to update assignment.')) } finally { setBusy(null) } }
  const remove = async (moment: PortfolioMoment) => { if (!window.confirm('Delete this moment and its uploaded media? This cannot be undone.')) return; setBusy(moment.id); try { await deleteMoment(moment.id); setItems((current) => current.filter((item) => item.id !== moment.id)) } catch (error) { setErrorMessage(getPortfolioErrorMessage(error, 'Unable to delete moment.')) } finally { setBusy(null) } }

  return <PageShell><PageHeading eyebrow="Work in motion" title="Moments" description="Capture quick proof points, then connect them to the experiences they support." actions={<Link to="/portfolio/moments/new"><Button iconLeft={<UploadIcon className="h-4 w-4" />} >Capture moment</Button></Link>} />{errorMessage && <div className="mb-6"><Notice>{errorMessage}</Notice></div>}<Card className="mb-6"><CardContent><form className="grid gap-4 md:grid-cols-[1fr_170px_170px_auto] md:items-end" onSubmit={applyFilters}><Select label="Experience" value={experienceId} onChange={(event) => setExperienceId(event.target.value)} placeholder="All experiences" options={experiences.map((item) => ({ value: item.id, label: item.title }))} /><Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} placeholder="All statuses" options={MOMENT_STATUSES.map((value) => ({ value, label: value }))} /><Select label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)} placeholder="All visibility" options={visibilityOptions} /><Button type="submit">Apply filters</Button></form></CardContent></Card>{loading ? <LoadingState label="Loading moments…" /> : !items.length ? <EmptyState title="No moments yet" description="Use your phone camera or choose files from your device to capture a moment." action={<Link to="/portfolio/moments/new"><Button>Capture a moment</Button></Link>} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((moment) => <article key={moment.id} className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"><Link to={`/portfolio/moments/${moment.id}`}><MediaPreview moment={moment} /></Link><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-2"><p className="line-clamp-2 font-semibold">{moment.caption || 'Untitled moment'}</p><StatusBadge tone={moment.status === 'ready' ? 'success' : 'warning'}>{moment.status}</StatusBadge></div><p className="text-xs text-[var(--color-text-secondary)]">{formatDate(moment.capturedAt)} · {moment.visibility}</p><p className="text-xs text-[var(--color-text-secondary)]">Experience: <span className="font-medium">{experienceTitle(moment.experienceId)}</span></p><TagList items={moment.skills} empty="No skills tagged" /><div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3"><Select aria-label={`Assign ${moment.caption || 'moment'} to experience`} value={moment.experienceId ?? ''} onChange={(event) => void doAssign(moment, event.target.value)} disabled={busy === moment.id} placeholder="Unassigned" options={[{ value: '', label: 'Unassigned' }, ...experiences.filter((item) => item.status !== 'archived').map((item) => ({ value: item.id, label: item.title }))]} /><button type="button" className="shrink-0 rounded-[var(--radius-md)] p-2 text-[var(--color-error)] hover:bg-[var(--color-error-bg)]" disabled={busy === moment.id} onClick={() => void remove(moment)} aria-label={`Delete ${moment.caption || 'moment'}`}><TrashIcon className="h-4 w-4" /></button></div></div></article>)}</div>}</PageShell>
}

export function MomentDetailPage() {
  const navigate = useNavigate()
  const { momentId } = useParams()
  const [moment, setMoment] = useState<PortfolioMoment | null>(null)
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [visibility, setVisibility] = useState<ExperienceVisibility>('private')
  const [status, setStatus] = useState<'draft' | 'ready'>('draft')
  const [experienceId, setExperienceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  useEffect(() => { let active = true; const timer = window.setTimeout(() => { setMoment(null); async function load() { if (!momentId) return; try { const [nextMoment, nextExperiences] = await Promise.all([getMoment(momentId), getExperiences({ limit: 100 })]); if (active && nextMoment) { setMoment(nextMoment); setCaption(nextMoment.caption); setLocation(nextMoment.location); setVisibility(nextMoment.visibility); setStatus(nextMoment.status); setExperienceId(nextMoment.experienceId ?? '') }; if (active) setExperiences(nextExperiences.items) } catch (error) { if (active) setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to load moment.') }) } finally { if (active) setLoading(false) } } void load() }, 0); return () => { active = false; window.clearTimeout(timer) } }, [momentId])
  const save = async (event: React.FormEvent) => { event.preventDefault(); if (!momentId) return; setBusy(true); setMessage(null); try { const next = await updateMoment(momentId, { caption: caption.trim() || undefined, location: location.trim() || undefined, visibility, status, experienceId: experienceId || null }); if (next) setMoment(next); setMessage({ kind: 'success', text: 'Moment updated.' }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to update moment.') }) } finally { setBusy(false) } }
  if (loading) return <PageShell><LoadingState label="Loading moment…" /></PageShell>
  if (!moment) return <PageShell>{message && <div className="mb-6"><Notice kind="error">{message.text}</Notice></div>}<EmptyState title="Moment not found" description="This moment may have been deleted or you may not have access to it." action={<Link to="/portfolio/moments"><Button>Back to moments</Button></Link>} /></PageShell>
  return <PageShell className="max-w-[1000px]"><PageHeading eyebrow="Moment detail" title={moment.caption || 'Untitled moment'} description={`Captured ${formatDate(moment.capturedAt)}`} actions={<Link to="/portfolio/moments" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]">All moments <ArrowRightIcon className="h-4 w-4" /></Link>} />{message && <div className="mb-6"><Notice kind={message.kind}>{message.text}</Notice></div>}<div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"><Card className="overflow-hidden"><MediaPreview moment={moment} className="aspect-auto max-h-[600px]" /><CardContent className="space-y-4"><div className="flex flex-wrap gap-2"><StatusBadge tone={moment.status === 'ready' ? 'success' : 'warning'}>{moment.status}</StatusBadge><StatusBadge tone="info">{moment.visibility}</StatusBadge></div><p className="text-sm text-[var(--color-text-secondary)]">{moment.location || 'Location not provided'}</p><TagList items={moment.skills} empty="No skills tagged" /><div className="space-y-1 text-xs text-[var(--color-text-muted)]">{moment.mediaAssets.map((asset) => <p key={asset.id}>{asset.originalFilename} · {asset.mimeType} · {formatBytes(asset.bytes ?? 0)}</p>)}</div></CardContent></Card><Card><CardHeader><CardTitle>Edit moment</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(event) => void save(event)}><FormGroup label="Caption"><textarea className="min-h-24 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-teal)]" maxLength={500} value={caption} onChange={(event) => setCaption(event.target.value)} /></FormGroup><Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} /><Select label="Experience" value={experienceId} onChange={(event) => setExperienceId(event.target.value)} placeholder="Unassigned" options={[{ value: '', label: 'Unassigned' }, ...experiences.filter((item) => item.status !== 'archived').map((item) => ({ value: item.id, label: item.title }))]} /><Select label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as ExperienceVisibility)} options={visibilityOptions} /><Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'ready')} options={MOMENT_STATUSES.map((value) => ({ value, label: value }))} /><Button type="submit" loading={busy} className="w-full">Save changes</Button></form><div className="mt-6 border-t border-[var(--color-border)] pt-6"><ConfirmButton label="Delete moment" message="Delete this moment and its uploaded media? This cannot be undone." onConfirm={async () => { if (!momentId) return; setBusy(true); try { await deleteMoment(momentId); navigate('/portfolio/moments', { replace: true }) } catch (error) { setMessage({ kind: 'error', text: getPortfolioErrorMessage(error, 'Unable to delete moment.') }); setBusy(false) } }} /></div></CardContent></Card></div></PageShell>
}
