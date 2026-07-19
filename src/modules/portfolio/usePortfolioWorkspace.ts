import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteMoment,
  getAllMoments,
  getPortfolio,
  getPortfolioErrorMessage,
  publishPortfolio,
  unpublishPortfolio,
} from './portfolioApi'
import type { Portfolio, PortfolioMoment } from './portfolioTypes'

export interface PortfolioWorkspaceNotice {
  kind: 'error' | 'success'
  text: string
}

export function usePortfolioWorkspace() {
  const requestId = useRef(0)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [moments, setMoments] = useState<PortfolioMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [notice, setNotice] = useState<PortfolioWorkspaceNotice | null>(null)
  const [visibilityBusy, setVisibilityBusy] = useState(false)
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setPageError(null)
    setGalleryError(null)

    try {
      const nextPortfolio = await getPortfolio()
      if (currentRequest !== requestId.current) return
      setPortfolio(nextPortfolio)
      setMoments([])

      if (nextPortfolio) {
        setGalleryLoading(true)
        try {
          const nextMoments = await getAllMoments()
          if (currentRequest === requestId.current) setMoments(nextMoments)
        } catch (error) {
          if (currentRequest === requestId.current) {
            setGalleryError(getPortfolioErrorMessage(error, 'Unable to load your Portfolio images.'))
          }
        } finally {
          if (currentRequest === requestId.current) setGalleryLoading(false)
        }
      }
    } catch (error) {
      if (currentRequest === requestId.current) {
        setPageError(getPortfolioErrorMessage(error, 'Unable to load your Portfolio.'))
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => { window.clearTimeout(timer); requestId.current += 1 }
  }, [load])

  const changeVisibility = async (makePublic: boolean) => {
    if (visibilityBusy || !portfolio) return
    setVisibilityBusy(true)
    setNotice(null)
    try {
      const updated = makePublic ? await publishPortfolio() : await unpublishPortfolio()
      if (updated) setPortfolio(updated)
      setNotice({
        kind: 'success',
        text: makePublic
          ? 'Your Portfolio is now public and ready to share.'
          : 'Your Portfolio is now private. Its public link no longer reveals content.',
      })
    } catch (error) {
      setNotice({
        kind: 'error',
        text: getPortfolioErrorMessage(error, 'Unable to update Portfolio visibility.'),
      })
    } finally {
      setVisibilityBusy(false)
    }
  }

  const removeMoment = async (momentId: string) => {
    if (deletingMomentId) return false
    setDeletingMomentId(momentId)
    setNotice(null)
    try {
      await deleteMoment(momentId)
      setMoments((current) => current.filter((moment) => moment.id !== momentId))
      setNotice({ kind: 'success', text: 'The image moment was deleted.' })
      return true
    } catch (error) {
      setNotice({
        kind: 'error',
        text: getPortfolioErrorMessage(error, 'Unable to delete this image moment.'),
      })
      return false
    } finally {
      setDeletingMomentId(null)
    }
  }

  return {
    portfolio,
    moments,
    loading,
    galleryLoading,
    pageError,
    galleryError,
    notice,
    visibilityBusy,
    deletingMomentId,
    load,
    changeVisibility,
    removeMoment,
  }
}
