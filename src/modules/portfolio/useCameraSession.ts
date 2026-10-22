import { useCallback, useEffect, useRef, useState } from 'react'
import { getCameraErrorMessage, getCameraSupportError, stopCameraStream } from './cameraUtils'

export type CameraSessionStatus = 'idle' | 'requesting' | 'live' | 'error'

export interface CameraDeviceOption {
  deviceId: string
  label: string
}

export function useCameraSession() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestIdRef = useRef(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraSessionStatus>('idle')
  const [devices, setDevices] = useState<CameraDeviceOption[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const releaseCurrentStream = useCallback(() => {
    stopCameraStream(streamRef.current, videoRef.current)
    streamRef.current = null
    setStream(null)
  }, [])

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1
    releaseCurrentStream()
    setStatus('idle')
  }, [releaseCurrentStream])

  const startCamera = useCallback(async (deviceId?: string) => {
    const nextRequestId = requestIdRef.current + 1
    requestIdRef.current = nextRequestId
    releaseCurrentStream()
    setErrorMessage(null)
    setInfoMessage(null)

    const cameraApi = navigator.mediaDevices
    const supportError = getCameraSupportError({
      secureContext: window.isSecureContext,
      hostname: window.location.hostname,
      hasGetUserMedia: typeof cameraApi?.getUserMedia === 'function',
    })
    if (supportError) {
      setErrorMessage(supportError)
      setStatus('error')
      return false
    }

    setStatus('requesting')
    try {
      const videoConstraints: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: 'environment' } }
      const nextStream = await cameraApi.getUserMedia({ video: videoConstraints, audio: false })
      if (requestIdRef.current !== nextRequestId) {
        stopCameraStream(nextStream)
        return false
      }

      streamRef.current = nextStream
      setStream(nextStream)
      setStatus('live')
      const activeDeviceId = nextStream.getVideoTracks()[0]?.getSettings().deviceId ?? deviceId ?? ''
      setSelectedCameraId(activeDeviceId)
      try {
        const videoInputs = (await cameraApi.enumerateDevices())
          .filter((item) => item.kind === 'videoinput')
          .map((item, index) => ({
            deviceId: item.deviceId,
            label: item.label || `Camera ${index + 1}`,
          }))
        if (requestIdRef.current === nextRequestId) {
          setDevices(videoInputs)
          if (activeDeviceId && videoInputs.some((item) => item.deviceId === activeDeviceId)) {
            setSelectedCameraId(activeDeviceId)
          } else if (!activeDeviceId && videoInputs.length === 1) {
            setSelectedCameraId(videoInputs[0].deviceId)
          }
        }
      } catch {
        // A live stream can still be used when device enumeration is unavailable.
        setDevices([])
      }
      return true
    } catch (error) {
      if (requestIdRef.current === nextRequestId) {
        setErrorMessage(getCameraErrorMessage(error))
        setStatus('error')
      }
      return false
    }
  }, [releaseCurrentStream])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && streamRef.current) {
        stopCamera()
        setInfoMessage('Camera paused because this page was hidden. Start it again when you return.')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [stopCamera])

  useEffect(() => () => {
    requestIdRef.current += 1
    stopCameraStream(streamRef.current, videoRef.current)
    streamRef.current = null
  }, [])

  return {
    videoRef,
    stream,
    status,
    devices,
    selectedCameraId,
    errorMessage,
    infoMessage,
    startCamera,
    stopCamera,
  }
}
