import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CameraIcon,
  CheckIcon,
  EditIcon,
  EyeIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { UploadProgress } from '@/components/ui/upload-progress'
import { compressImageFile, validateImageFile } from '@/utils/imageUpload'
import {
  createPortfolioCollection,
  createPortfolioCollectionMoment,
  deletePortfolioCollection,
  getPortfolioCollection,
  getPortfolioCollectionExperiences,
  getPortfolioCollectionMoments,
  getPortfolioCollections,
  getPortfolioErrorCode,
  getPortfolioErrorMessage,
  updatePortfolioCollection,
  updatePortfolioVisibility,
} from './portfolioApi'
import { EmptyState, LoadingState, Notice, PageHeading, PageShell, StatusBadge } from './PortfolioShared'
import { formatDate } from './portfolioFormat'
import type {
  PortfolioCollection,
  PortfolioExperience,
  PortfolioMoment,
  PortfolioVisibility,
} from './portfolioTypes'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

function resolvePublicUrl(portfolio: PortfolioCollection) {
  if (!portfolio.publicUrl) return ''
  try {
    return new URL(portfolio.publicUrl, window.location.origin).toString()
  } catch {
    return portfolio.publicUrl
  }
}

function momentImage(moment: PortfolioMoment) {
  return moment.imageUrl || moment.mediaAssets?.[0]?.secureUrl || ''
}

function CollectionCover({ portfolio }: { portfolio: PortfolioCollection }) {
  if (portfolio.coverImageUrl) {
    return <img alt="" className="h-40 w-full object-cover" src={portfolio.coverImageUrl} />
  }

  return (
    <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,var(--color-bg-soft),var(--color-gray-100))] text-[var(--color-teal)]">
      <CameraIcon className="h-10 w-10" />
    </div>
  )
}

export function PortfolioListPage() {
  const [portfolios, setPortfolios] = useState<PortfolioCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadPortfolios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPortfolios(await getPortfolioCollections())
    } catch (loadError) {
      setError(getPortfolioErrorMessage(loadError, 'Unable to load your portfolios.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPortfolios() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadPortfolios])

  const toggleVisibility = async (portfolio: PortfolioCollection) => {
    if (busyId) return
    const visibility: PortfolioVisibility = portfolio.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    if (visibility === 'PRIVATE' && !window.confirm('Make this portfolio private? Its public link will stop working immediately.')) return
    setBusyId(portfolio.id)
    setError(null)
    try {
      const updated = await updatePortfolioVisibility(portfolio.id, visibility)
      if (updated) setPortfolios((items) => items.map((item) => item.id === updated.id ? updated : item))
    } catch (updateError) {
      setError(getPortfolioErrorMessage(updateError, 'Unable to update portfolio visibility.'))
    } finally {
      setBusyId(null)
    }
  }

  const copyUrl = async (portfolio: PortfolioCollection) => {
    const url = resolvePublicUrl(portfolio)
    if (!url || !navigator.clipboard?.writeText) {
      setError('Copy is unavailable in this browser.')
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(portfolio.id)
      window.setTimeout(() => setCopiedId((current) => current === portfolio.id ? null : current), 1800)
    } catch {
      setError('Unable to copy the public URL.')
    }
  }

  const removePortfolio = async (portfolio: PortfolioCollection) => {
    if (busyId || !window.confirm(`Delete "${portfolio.title}" and all of its experiences and moments? This cannot be undone.`)) return
    setBusyId(portfolio.id)
    setError(null)
    try {
      await deletePortfolioCollection(portfolio.id)
      setPortfolios((items) => items.filter((item) => item.id !== portfolio.id))
    } catch (deleteError) {
      setError(getPortfolioErrorMessage(deleteError, 'Unable to delete this portfolio.'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <PageShell><LoadingState label="Loading your portfolios..." /></PageShell>

  return (
    <PageShell>
      <PageHeading
        eyebrow="Portfolio workspace"
        title="My Portfolios"
        description="Create focused portfolios for different roles, projects, or creative disciplines."
        actions={<Link to="/portfolio/new"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>Create Portfolio</Button></Link>}
      />
      {error ? <div className="mb-6"><Notice>{error}</Notice></div> : null}

      {!portfolios.length ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              title="No portfolios yet"
              description="Create a portfolio, then add real project photos and experiences."
              action={<Link to="/portfolio/new"><Button iconLeft={<PlusIcon className="h-4 w-4" />}>Create Portfolio</Button></Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card className="overflow-hidden shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]" key={portfolio.id}>
              <CollectionCover portfolio={portfolio} />
              <CardContent className="space-y-4 p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 truncate text-xl font-semibold">{portfolio.title}</h2>
                    <StatusBadge tone={portfolio.visibility === 'PUBLIC' ? 'success' : 'warning'}>
                      {portfolio.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {portfolio.description || 'Add a description to explain the focus of this portfolio.'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] bg-[var(--color-bg-main)] p-3 text-center text-xs text-[var(--color-text-secondary)]">
                  <span><strong className="block text-base text-[var(--color-text-primary)]">{portfolio.momentCount ?? 0}</strong>Moments</span>
                  <span><strong className="block text-base text-[var(--color-text-primary)]">{portfolio.experienceCount ?? 0}</strong>Experiences</span>
                  <span><strong className="block text-sm text-[var(--color-text-primary)]">{formatDate(portfolio.updatedAt)}</strong>Updated</span>
                </div>
                {portfolio.visibility === 'PUBLIC' && portfolio.publicUrl ? (
                  <button
                    className="flex w-full items-center gap-2 rounded-[var(--radius-md)] text-left text-xs font-medium text-[var(--color-teal)] hover:underline"
                    onClick={() => void copyUrl(portfolio)}
                    type="button"
                  >
                    {copiedId === portfolio.id ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                    <span className="truncate">{copiedId === portfolio.id ? 'Copied' : resolvePublicUrl(portfolio)}</span>
                  </button>
                ) : null}
                <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                  <Link to={`/portfolio/manage/${portfolio.id}`}><Button size="sm" iconLeft={<EyeIcon className="h-4 w-4" />}>Open</Button></Link>
                  <Link to={`/portfolio/manage/${portfolio.id}/edit`}><Button size="sm" variant="secondary" iconLeft={<EditIcon className="h-4 w-4" />}>Edit</Button></Link>
                  <Button disabled={Boolean(busyId)} loading={busyId === portfolio.id} onClick={() => void toggleVisibility(portfolio)} size="sm" variant="ghost">
                    {portfolio.visibility === 'PUBLIC' ? 'Make private' : 'Publish'}
                  </Button>
                  <Button aria-label={`Delete ${portfolio.title}`} className="ml-auto" disabled={Boolean(busyId)} onClick={() => void removePortfolio(portfolio)} size="sm" title={`Delete ${portfolio.title}`} variant="ghost">
                    <TrashIcon className="h-4 w-4 text-[var(--color-error)]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

export function PortfolioCollectionFormPage() {
  const { portfolioId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(Boolean(portfolioId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string }>({})

  useEffect(() => {
    if (!portfolioId) return
    let active = true
    void getPortfolioCollection(portfolioId)
      .then((portfolio) => {
        if (!active || !portfolio) return
        setTitle(portfolio.title)
        setDescription(portfolio.description || '')
      })
      .catch((loadError) => {
        if (active) setError(getPortfolioErrorMessage(loadError, 'Unable to load this portfolio.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [portfolioId])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    const cleanTitle = title.trim()
    const cleanDescription = description.trim()
    const nextErrors = {
      title: cleanTitle.length < 2 || cleanTitle.length > 100 ? 'Title must be between 2 and 100 characters.' : undefined,
      description: cleanDescription.length > 2000 ? 'Description must not exceed 2000 characters.' : undefined,
    }
    setFieldErrors(nextErrors)
    if (nextErrors.title || nextErrors.description) return

    setSaving(true)
    setError(null)
    try {
      const portfolio = portfolioId
        ? await updatePortfolioCollection(portfolioId, { title: cleanTitle, description: cleanDescription })
        : await createPortfolioCollection({ title: cleanTitle, description: cleanDescription })
      if (portfolio) navigate(`/portfolio/manage/${portfolio.id}`, { replace: true })
    } catch (saveError) {
      const code = getPortfolioErrorCode(saveError)
      setError(code === 'MULTI_PORTFOLIO_MIGRATION_REQUIRED'
        ? 'The backend database migration for multiple portfolios must be run before another portfolio can be created.'
        : getPortfolioErrorMessage(saveError, 'Unable to save this portfolio.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageShell><LoadingState label="Loading portfolio..." /></PageShell>

  return (
    <PageShell>
      <PageHeading
        eyebrow={portfolioId ? 'Portfolio settings' : 'New portfolio'}
        title={portfolioId ? 'Edit Portfolio' : 'Create Portfolio'}
        description="Give this portfolio a clear focus. Cover upload is not available in the current backend contract."
      />
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={submit} noValidate>
            {error ? <Notice>{error}</Notice> : null}
            <Input
              error={fieldErrors.title}
              label="Portfolio name"
              maxLength={100}
              onChange={(event) => { setTitle(event.target.value); setFieldErrors((current) => ({ ...current, title: undefined })) }}
              placeholder="Marketing Portfolio"
              value={title}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-navy)]" htmlFor="portfolio-description">Description</label>
              <textarea
                className="min-h-36 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 text-sm outline-none hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
                id="portfolio-description"
                maxLength={2000}
                onChange={(event) => { setDescription(event.target.value); setFieldErrors((current) => ({ ...current, description: undefined })) }}
                placeholder="Selected campaigns, events and creative projects."
                value={description}
              />
              <div className="mt-1 flex justify-between gap-3 text-xs">
                <span className="text-[var(--color-error)]">{fieldErrors.description}</span>
                <span className="text-[var(--color-text-muted)]">{description.length}/2000</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button onClick={() => navigate(-1)} type="button" variant="secondary">Cancel</Button>
              <Button loading={saving} type="submit">{portfolioId ? 'Save changes' : 'Create Portfolio'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function PortfolioCollectionDetailPage() {
  const { portfolioId = '' } = useParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioCollection | null>(null)
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([])
  const [moments, setMoments] = useState<PortfolioMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [preparedFile, setPreparedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const loadPortfolio = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [portfolioResult, experienceResult, momentResult] = await Promise.allSettled([
      getPortfolioCollection(portfolioId),
      getPortfolioCollectionExperiences(portfolioId),
      getPortfolioCollectionMoments(portfolioId),
    ])
    if (portfolioResult.status === 'fulfilled') setPortfolio(portfolioResult.value ?? null)
    else setError(getPortfolioErrorMessage(portfolioResult.reason, 'Unable to load this portfolio.'))
    if (experienceResult.status === 'fulfilled') setExperiences(experienceResult.value)
    else setError(getPortfolioErrorMessage(experienceResult.reason, 'Unable to load portfolio experiences.'))
    if (momentResult.status === 'fulfilled') setMoments(momentResult.value)
    else setError(getPortfolioErrorMessage(momentResult.reason, 'Unable to load portfolio moments.'))
    setLoading(false)
  }, [portfolioId])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPortfolio() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadPortfolio])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const resetPreview = () => {
    setPreparedFile(null)
    setCaption('')
    setProgress(0)
    setPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || uploading) return
    setError(null)
    const validationError = validateImageFile(file, { maxBytes: MAX_IMAGE_SIZE_BYTES })
    if (validationError) {
      setError(validationError)
      event.target.value = ''
      return
    }
    setPreparing(true)
    try {
      const compressed = await compressImageFile(file, { maxDimension: 1600, quality: 0.82 })
      const nextPreview = URL.createObjectURL(compressed)
      setPreviewUrl(nextPreview)
      setPreparedFile(compressed)
    } catch (prepareError) {
      setError(getPortfolioErrorMessage(prepareError, 'Unable to prepare this image.'))
      event.target.value = ''
    } finally {
      setPreparing(false)
    }
  }

  const uploadMoment = async () => {
    if (!preparedFile || uploading || caption.trim().length > 500) return
    setUploading(true)
    setProgress(0)
    setError(null)
    try {
      const moment = await createPortfolioCollectionMoment(
        portfolioId,
        preparedFile,
        { caption: caption.trim() || undefined },
        {
          onUploadProgress: (event) => {
            const value = event.total ? event.loaded / event.total : event.progress ?? 0
            setProgress(Math.min(99, Math.round(value * 100)))
          },
        },
      )
      if (moment) setMoments((items) => [moment, ...items.filter((item) => item.id !== moment.id)])
      setProgress(100)
      resetPreview()
      setPortfolio((current) => current ? { ...current, momentCount: current.momentCount + 1 } : current)
    } catch (uploadError) {
      setError(getPortfolioErrorMessage(uploadError, 'Unable to upload this moment.'))
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <PageShell><LoadingState label="Loading portfolio..." /></PageShell>
  if (!portfolio) return <PageShell><Notice>{error || 'This portfolio could not be found.'}</Notice></PageShell>

  const publicUrl = resolvePublicUrl(portfolio)

  return (
    <PageShell>
      <PageHeading
        eyebrow="Portfolio detail"
        title={portfolio.title}
        description={portfolio.description || 'Add moments and experiences that support this portfolio.'}
        actions={<>
          {portfolio.visibility === 'PUBLIC' && publicUrl ? <a href={publicUrl} rel="noreferrer" target="_blank"><Button variant="secondary" iconLeft={<EyeIcon className="h-4 w-4" />}>View public</Button></a> : null}
          <Link to={`/portfolio/manage/${portfolio.id}/edit`}><Button iconLeft={<EditIcon className="h-4 w-4" />}>Edit</Button></Link>
        </>}
      />
      {error ? <div className="mb-6"><Notice>{error}</Notice></div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><h2 className="text-2xl font-semibold">Moments</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Project photos and visual proof uploaded to this portfolio.</p></div>
              <StatusBadge tone={portfolio.visibility === 'PUBLIC' ? 'success' : 'warning'}>{portfolio.visibility}</StatusBadge>
            </div>
            {moments.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {moments.map((moment) => (
                  <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]" key={moment.id}>
                    {momentImage(moment) ? <img alt={moment.caption || 'Portfolio moment'} className="aspect-[4/3] w-full object-cover" loading="lazy" src={momentImage(moment)} /> : <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-bg-main)]"><CameraIcon className="h-8 w-8 text-[var(--color-teal)]" /></div>}
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-semibold">{moment.caption || 'Untitled moment'}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDate(moment.capturedAt || moment.createdAt)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : <EmptyState title="No moments yet" description="Use the upload panel to add the first project image." />}
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Experiences</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Experiences assigned to this portfolio by the backend.</p>
            {experiences.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {experiences.map((experience) => (
                  <Card key={experience.id}><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)]">{experience.type}</p><h3 className="mt-2 text-lg font-semibold">{experience.title}</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{experience.organization || experience.role || 'Organization not set'}</p></CardContent></Card>
                ))}
              </div>
            ) : <div className="mt-4"><EmptyState title="No experiences yet" description="Nested experience creation remains available through the existing experience flow." /></div>}
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle className="flex items-center gap-2"><UploadIcon className="h-5 w-5 text-[var(--color-teal)]" />Add a moment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {previewUrl ? (
                <img alt="New moment preview" className="aspect-square w-full rounded-[var(--radius-lg)] object-cover" src={previewUrl} />
              ) : (
                <button
                  className="flex aspect-square w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] text-center hover:border-[var(--color-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
                  disabled={preparing || uploading}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <CameraIcon className="h-9 w-9 text-[var(--color-teal)]" />
                  <span className="mt-3 text-sm font-semibold">{preparing ? 'Preparing image...' : 'Choose or capture an image'}</span>
                  <span className="mt-1 text-xs text-[var(--color-text-secondary)]">JPEG, PNG or WebP, up to 5 MB</span>
                </button>
              )}
              <input accept={IMAGE_ACCEPT} className="sr-only" disabled={preparing || uploading} onChange={(event) => void chooseImage(event)} ref={fileInputRef} type="file" />
              {previewUrl ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="moment-caption">Caption</label>
                    <textarea
                      className="min-h-24 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
                      disabled={uploading}
                      id="moment-caption"
                      maxLength={500}
                      onChange={(event) => setCaption(event.target.value)}
                      placeholder="What does this image show?"
                      value={caption}
                    />
                    <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">{caption.length}/500</p>
                  </div>
                  {uploading ? <UploadProgress label="Uploading moment" value={progress} /> : null}
                  <div className="grid gap-2">
                    <Button disabled={uploading} loading={uploading} onClick={() => void uploadMoment()} type="button">Confirm upload</Button>
                    <Button disabled={uploading} onClick={() => fileInputRef.current?.click()} type="button" variant="secondary">Choose another photo</Button>
                    <Button disabled={uploading} onClick={resetPreview} type="button" variant="ghost">Cancel</Button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  )
}
