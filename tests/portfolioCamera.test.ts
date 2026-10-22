import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateCaptureDimensions, createCameraFile, getCameraErrorMessage, getCameraSupportError, stopCameraStream } from '../src/modules/portfolio/cameraUtils.ts'
import { buildMomentFormData } from '../src/modules/portfolio/momentUploadForm.ts'
import { appendMomentMediaFiles, MAX_PORTFOLIO_FILE_SIZE_BYTES, validatePortfolioUploadFile } from '../src/modules/portfolio/portfolioUploadPolicy.ts'

const fileCandidate = (index: number) => ({
  name: `photo-${index}.jpg`,
  type: 'image/jpeg',
  size: 100,
})

test('camera capture dimensions preserve the frame ratio and cap its longest edge', () => {
  assert.deepEqual(calculateCaptureDimensions(4032, 3024), { width: 1600, height: 1200 })
  assert.deepEqual(calculateCaptureDimensions(1920, 1080), { width: 1600, height: 900 })
  assert.deepEqual(calculateCaptureDimensions(640, 480), { width: 640, height: 480 })
  assert.throws(() => calculateCaptureDimensions(0, 480), /not ready/)
})

test('camera errors map to stable user-facing guidance', () => {
  assert.match(getCameraErrorMessage({ name: 'NotAllowedError' }), /permission/)
  assert.match(getCameraErrorMessage({ name: 'SecurityError' }), /permission/)
  assert.match(getCameraErrorMessage({ name: 'NotFoundError' }), /No camera/)
  assert.match(getCameraErrorMessage({ name: 'NotReadableError' }), /other apps/)
  assert.match(getCameraErrorMessage({ name: 'AbortError' }), /other apps/)
  assert.match(getCameraErrorMessage({ name: 'OverconstrainedError' }), /unavailable/)
  assert.match(getCameraSupportError({ secureContext: false, hostname: 'cvbuddy.example', hasGetUserMedia: true }) ?? '', /HTTPS or localhost/)
  assert.match(getCameraSupportError({ secureContext: true, hostname: 'cvbuddy.example', hasGetUserMedia: false }) ?? '', /not supported/)
  assert.equal(getCameraSupportError({ secureContext: false, hostname: 'localhost', hasGetUserMedia: true }), undefined)
})

test('camera files use JPEG MIME type and a timestamped camera filename and pass Moment validation', () => {
  const capturedAt = 1_797_000_000_000
  const file = createCameraFile(new Blob(['jpeg-data'], { type: 'image/jpeg' }), capturedAt)
  assert.equal(file.type, 'image/jpeg')
  assert.match(file.name, /^camera-moment-.*\.jpg$/)
  assert.equal(file.lastModified, capturedAt)
  assert.equal(validatePortfolioUploadFile(file, 'moment'), undefined)
})

test('adding media preserves the current selection and refuses a sixth item', () => {
  const current = Array.from({ length: 4 }, (_, index) => fileCandidate(index))
  const added = appendMomentMediaFiles(current, [fileCandidate(4)])
  assert.equal(added.error, undefined)
  assert.equal(added.files.length, 5)

  const rejected = appendMomentMediaFiles(added.files, [fileCandidate(5)])
  assert.match(rejected.error ?? '', /at most 5/)
  assert.equal(rejected.files, added.files)
  assert.equal(MAX_PORTFOLIO_FILE_SIZE_BYTES, 5 * 1024 * 1024)
})

test('camera session cleanup stops every media track and clears the video source', () => {
  const stopped: string[] = []
  const tracks = [
    { stop: () => stopped.push('video') },
    { stop: () => stopped.push('audio') },
  ]
  const video = { srcObject: { stream: true } } as unknown as Pick<HTMLVideoElement, 'srcObject'>
  stopCameraStream({ getTracks: () => tracks } as unknown as Pick<MediaStream, 'getTracks'>, video)
  assert.deepEqual(stopped, ['video', 'audio'])
  assert.equal(video.srcObject, null)
  stopCameraStream(null, video)
  assert.equal(video.srcObject, null)
})

test('Moment upload FormData keeps captured files in the existing multipart media field', () => {
  const file = createCameraFile(new Blob(['camera-frame'], { type: 'image/jpeg' }), 1_797_000_000_000)
  const form = buildMomentFormData([file], {
    caption: 'Window installation',
    capturedAt: '2026-10-22T12:00:00.000Z',
    skills: ['Installation', 'Planning'],
    location: 'District 1',
    visibility: 'portfolio',
    status: 'ready',
  })
  const uploadedMedia = form.getAll('media') as File[]
  assert.equal(uploadedMedia.length, 1)
  assert.equal(uploadedMedia[0].name, file.name)
  assert.equal(uploadedMedia[0].type, 'image/jpeg')
  assert.equal(form.get('caption'), 'Window installation')
  assert.equal(form.get('skills'), '["Installation","Planning"]')
  assert.equal(form.get('capturedAt'), '2026-10-22T12:00:00.000Z')
})
