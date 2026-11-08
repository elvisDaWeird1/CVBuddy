import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer, type ViteDevServer } from 'vite'
import type { AiResultRecord } from '../src/modules/ai/aiApi.ts'
import type {
  AiFeedbackViewModel,
  AiScoreViewModel,
  AiTranslationViewModel,
} from '../src/modules/ai/aiResultAdapter.ts'
import type { AiHistoryItemViewModel } from '../src/modules/ai/aiHistoryAdapter.ts'
import type { ScoreOverviewProps } from '../src/modules/ai/components/ScoreOverview.tsx'
import type { AiResultHistoryDetailProps } from '../src/modules/ai/components/AiResultHistoryDetail.tsx'

let server: ViteDevServer
let CANONICAL_DIMENSION_KEYS: readonly string[]
let adaptScoreResult: (result: AiResultRecord) => AiScoreViewModel
let adaptFeedbackResult: (result: AiResultRecord) => AiFeedbackViewModel
let adaptTranslationResult: (result: AiResultRecord) => AiTranslationViewModel
let adaptAiHistory: (
  records: AiResultRecord[],
  cvs: Array<{ id: string; title: string; status?: string; fileType: string; fileSize: number; uploadedAt: string }>,
) => AiHistoryItemViewModel[]
let resolveAiComposerPrefill: (
  cvs: Array<{ id: string; title: string; status?: string; fileType: string; fileSize: number; uploadedAt: string }>,
  query: { cvId?: string | null; action?: string | null },
) => { selectedCvId: string; selectedAction: string }
let loadAiResultDetail: (resultId: string) => Promise<{
  record: AiResultRecord
  sourceCvId: string | null
}>
let ScoreOverview: ComponentType<ScoreOverviewProps>
let AiResultHistoryDetail: ComponentType<AiResultHistoryDetailProps>
let AiResultHistory: ComponentType<{
  items: AiHistoryItemViewModel[]
  loading: boolean
  error?: string | null
  selectedId?: string | null
  onRetry: () => void
}>
let ApplicantHeader: ComponentType
let httpClient: {
  get: (path: string, config?: unknown) => Promise<unknown>
  post: (path: string, body?: unknown, config?: unknown) => Promise<unknown>
}
let appRoutes: Array<Record<string, unknown>>

before(async () => {
  server = await createServer({
    configFile: false,
    envFile: false,
    root: fileURLToPath(new URL('..', import.meta.url)),
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    server: { middlewareMode: true, watch: null, ws: false, hmr: false },
    appType: 'custom',
  })

  const adapterModule = await server.ssrLoadModule('/src/modules/ai/aiResultAdapter.ts')
  CANONICAL_DIMENSION_KEYS = adapterModule.CANONICAL_DIMENSION_KEYS
  adaptScoreResult = adapterModule.adaptScoreResult
  adaptFeedbackResult = adapterModule.adaptFeedbackResult
  adaptTranslationResult = adapterModule.adaptTranslationResult

  const historyAdapterModule = await server.ssrLoadModule('/src/modules/ai/aiHistoryAdapter.ts')
  adaptAiHistory = historyAdapterModule.adaptAiHistory
  resolveAiComposerPrefill = historyAdapterModule.resolveAiComposerPrefill
  loadAiResultDetail = historyAdapterModule.loadAiResultDetail

  const scoreOverviewModule = await server.ssrLoadModule('/src/modules/ai/components/ScoreOverview.tsx')
  ScoreOverview = scoreOverviewModule.ScoreOverview as ComponentType<ScoreOverviewProps>

  const detailModule = await server.ssrLoadModule('/src/modules/ai/components/AiResultHistoryDetail.tsx')
  AiResultHistoryDetail = detailModule.AiResultHistoryDetail as ComponentType<AiResultHistoryDetailProps>

  const historyModule = await server.ssrLoadModule('/src/modules/ai/components/AiResultHistory.tsx')
  AiResultHistory = historyModule.AiResultHistory

  const httpModule = await server.ssrLoadModule('/src/apis/httpClient.ts')
  httpClient = httpModule.httpClient

  const routerModule = await server.ssrLoadModule('/src/routes/app-router.tsx')
  appRoutes = routerModule.appRoutes

  const headerModule = await server.ssrLoadModule('/src/layouts/ClientLayout/ApplicantHeader.tsx')
  ApplicantHeader = headerModule.ApplicantHeader
})

after(async () => {
  await server.close()
})

function makeRecord(overrides: Partial<AiResultRecord> = {}): AiResultRecord {
  return {
    id: 'result-1',
    accountId: 'account-1',
    cvDocumentId: 'cv-1',
    aiType: 'CV_SCORING',
    status: 'COMPLETED',
    score: 74,
    createdAt: '2026-10-20T09:00:00.000Z',
    ...overrides,
  }
}

function renderScore(result: AiScoreViewModel, sourceCvId: string | null = 'cv-1') {
  return renderToStaticMarkup(createElement(ScoreOverview, { result, sourceCvId }))
}

test('1. normalizes the four dimensions in fixed canonical order regardless of payload key order', () => {
  const record = makeRecord({
    result: {
      overall_score: 76,
      dimensions: {
        jd_fit: { score: 68, gaps: ['Missing production deployment scale'] },
        keywords: { score: 71, missing: ['FastAPI', 'PyTorch'] },
        language: { score: 82, issues: ['Two bullets start with passive phrasing'] },
        layout_ats: { score: 88, fixes: ['Keep date format consistent'] },
      },
    },
  })

  const adapted = adaptScoreResult(record)
  assert.deepEqual(adapted.dimensions.map((item) => item.key), [...CANONICAL_DIMENSION_KEYS])
  assert.deepEqual(adapted.dimensions.map((item) => item.label), [
    'Layout and ATS',
    'Language clarity',
    'Keywords',
    'Target-role fit',
  ])

  const html = renderScore(adapted)
  const breakdownIndex = html.indexOf('Where your CV stands')
  const strongestIndex = html.indexOf('Strongest area:')
  const breakdownSlice = html.slice(breakdownIndex, strongestIndex)

  const layoutPos = breakdownSlice.indexOf('Layout and ATS')
  const languagePos = breakdownSlice.indexOf('Language clarity')
  const keywordsPos = breakdownSlice.indexOf('Keywords')
  const jdFitPos = breakdownSlice.indexOf('Target-role fit')

  assert.ok(layoutPos >= 0 && languagePos > layoutPos && keywordsPos > languagePos && jdFitPos > keywordsPos)
})

test('2 & 3. sorts priority groups from lowest score to highest and skips dimensions without real issues, gaps, or fixes', () => {
  const record = makeRecord({
    result: {
      overall_score: 64,
      dimensions: {
        layout_ats: {
          score: 35,
          issues: [],
          fixes: [],
          gaps: [],
        },
        language: {
          score: 62,
          issues: ['Use stronger action verbs'],
          fixes: ['Start bullets with measurable verbs'],
        },
        keywords: {
          score: 51,
          fixes: ['Include MLOps and Docker in project bullets'],
        },
        jd_fit: {
          score: 44,
          gaps: ['No model evaluation benchmark mentioned'],
        },
      },
    },
  })

  const adapted = adaptScoreResult(record)
  // layout_ats has score 35 (lowest) but no issues, gaps, or fixes -> must NOT create a fake priority
  assert.deepEqual(
    adapted.priorityGroups.map((group) => ({ key: group.key, score: group.score })),
    [
      { key: 'jd_fit', score: 44 },
      { key: 'keywords', score: 51 },
      { key: 'language', score: 62 },
    ],
  )
})

test('4. selects the highest-scoring dimension as Strongest area and hides the section when no valid score exists', () => {
  const scoredRecord = makeRecord({
    result: {
      overall_score: 79,
      dimensions: {
        layout_ats: { score: 72, issues: ['Dense header'] },
        language: { score: 94, description: 'Clear, concise bullet structure.' },
        keywords: { score: 68, missing: ['Kubernetes'] },
        jd_fit: { score: 81, gaps: [] },
      },
    },
  })

  const adapted = adaptScoreResult(scoredRecord)
  assert.deepEqual(adapted.strongestArea, {
    key: 'language',
    label: 'Language clarity',
    score: 94,
    assessmentLabel: 'Strong',
    description: 'Clear, concise bullet structure.',
  })

  const html = renderScore(adapted)
  assert.match(html, /Strongest area: Language clarity/)
  assert.match(html, /94\/100/)

  const unscoredRecord = makeRecord({
    score: null,
    result: {
      overall_score: null,
      dimensions: {
        layout_ats: { issues: ['Missing contact link'] },
        language: {},
        keywords: {},
        jd_fit: {},
      },
    },
  })
  const unscoredAdapted = adaptScoreResult(unscoredRecord)
  assert.equal(unscoredAdapted.strongestArea, null)
  const unscoredHtml = renderScore(unscoredAdapted)
  assert.doesNotMatch(unscoredHtml, /Strongest area:/)
})

test('5. never renders the word Critical when the API contract does not provide severity', () => {
  const record = makeRecord({
    score: 38,
    result: {
      overall_score: 38,
      dimensions: {
        layout_ats: { score: 25, issues: ['Two-column table breaks ATS parsing'], fixes: ['Use single-column layout'] },
        language: { score: 40, issues: ['Frequent grammar errors'] },
        keywords: { score: 35, missing: ['Python', 'SQL'], fixes: ['Add core technical stack'] },
        jd_fit: { score: 42, gaps: ['No relevant internship listed'] },
      },
    },
  })

  const html = renderScore(adaptScoreResult(record))
  assert.doesNotMatch(html, /Critical/i)
})

test('6. deduplicates suggested bullets globally and does not repeat them inside dimension cards', () => {
  const duplicateBullet = 'Built an automated ETL pipeline processing 2M records daily with 99.8% reliability.'
  const secondBullet = 'Reduced inference latency by 35% using ONNX quantization.'
  const record = makeRecord({
    result: {
      overall_score: 75,
      suggested_bullets: [duplicateBullet],
      dimensions: {
        layout_ats: { score: 80, suggested_bullets: [duplicateBullet] },
        language: { score: 78 },
        keywords: {
          score: 70,
          suggested_bullets: [duplicateBullet, secondBullet],
          suggestedBullets: [secondBullet],
        },
        jd_fit: { score: 72 },
      },
    },
  })

  const adapted = adaptScoreResult(record)
  assert.deepEqual(adapted.suggestedBullets, [duplicateBullet, secondBullet])

  const html = renderScore(adapted)
  const occurrences = html.split(duplicateBullet).length - 1
  assert.equal(occurrences, 1)
})

test('7. preserves needs_user_fact warnings on rewrite comparisons', () => {
  const record = makeRecord({
    result: {
      overall_score: 70,
      dimensions: {
        layout_ats: { score: 75 },
        language: { score: 70 },
        keywords: { score: 68 },
        jd_fit: { score: 67 },
      },
      rewrites: [
        {
          section: 'experience',
          original: 'Worked on backend APIs.',
          suggested_en: 'Engineered REST APIs serving [X] daily active users with <100ms p95 latency.',
          reason: 'Quantify traffic and latency with real project metrics.',
          needs_user_fact: true,
        },
      ],
    },
  })

  const adapted = adaptScoreResult(record)
  assert.equal(adapted.rewrites.length, 1)
  assert.equal(adapted.rewrites[0].needsUserFact, true)

  const html = renderScore(adapted)
  assert.match(html, /Verify or add supporting facts before using/)
})

test('8. renders company_model_feedback only once across ScoreOverview and AiResultHistoryDetail', () => {
  const uniqueFeedback = 'Company model note: emphasize end-to-end ownership and measurable business outcomes.'
  const record = makeRecord({
    result: {
      overall_score: 81,
      company_model_feedback: uniqueFeedback,
      explanation: uniqueFeedback,
      dimensions: {
        layout_ats: { score: 85 },
        language: { score: 80 },
        keywords: { score: 78 },
        jd_fit: { score: 82 },
      },
    },
  })

  const detailHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record,
      loading: false,
      error: null,
      sourceCvId: 'cv-1',
      onRetry: () => undefined,
    }),
  )

  const count = detailHtml.split(uniqueFeedback).length - 1
  assert.equal(count, 1)
})

test('9. renders current structured result in the required 11-step priority hierarchy order with technical details collapsed', () => {
  const record = makeRecord({
    result: {
      overall_score: 77,
      confidence: 0.89,
      company_model_feedback: 'Strong alignment with product engineering teams.',
      disclaimer: 'Custom advisory disclaimer text.',
      meta: {
        source: 'groq',
        model: 'llama-3.3-70b-versatile',
        language: 'en',
      },
      dimensions: {
        layout_ats: { score: 84, fixes: ['Standardize section headings'] },
        language: { score: 91, description: 'Strong action-oriented phrasing.' },
        keywords: {
          score: 64,
          missing: ['TypeScript', 'GraphQL'],
          suggested_bullets: ['Delivered GraphQL schema federation across 3 services.'],
          issues: ['Missing frontend type-system keywords'],
        },
        jd_fit: { score: 69, gaps: ['Add CI/CD ownership examples'] },
      },
      rewrites: [
        {
          section: 'projects',
          original: 'Built a dashboard.',
          suggested: 'Built a real-time analytics dashboard reducing reporting time by 40%.',
          needs_user_fact: true,
        },
      ],
    },
  })

  const html = renderScore(adaptScoreResult(record), 'cv-1')
  const orderedHeadings = [
    'id="overall-score-heading"',
    'id="priority-issues-heading"',
    'id="score-dimensions-heading"',
    'id="strongest-area-heading"',
    'id="issues-fixes-gaps-heading"',
    'id="missing-keywords-heading"',
    'id="suggested-bullets-heading"',
    'id="rewrite-suggestions-heading"',
    'Strong alignment with product engineering teams.',
    'id="next-actions-heading"',
    'aria-label="Technical details and advisory disclaimer"',
  ]

  let previousIndex = -1
  for (const marker of orderedHeadings) {
    const nextIndex = html.indexOf(marker)
    assert.ok(nextIndex > previousIndex, `Expected "${marker}" to appear after index ${previousIndex}, got ${nextIndex}`)
    previousIndex = nextIndex
  }

  assert.match(html, /href="\/ai\?cvId=cv-1&amp;action=translate"/)
  assert.match(html, /llama-3\.3-70b-versatile/)
  assert.match(html, /89%/)
  assert.match(html, /Custom advisory disclaimer text\./)

  // When sourceCvId is null (CV deleted), Translate this CV must not appear
  const htmlWithoutCv = renderScore(adaptScoreResult(record), null)
  assert.doesNotMatch(htmlWithoutCv, /Translate this CV/)
})

test('10. renders legacy stored results safely without losing data', () => {
  const legacyScoreRecord = makeRecord({
    score: 71,
    result: undefined,
    resultText: 'Legacy plain-text evaluation summary for an older CV record.',
  })

  const adaptedLegacyScore = adaptScoreResult(legacyScoreRecord)
  assert.equal(adaptedLegacyScore.overallScore, 71)
  assert.equal(adaptedLegacyScore.fallbackText, 'Legacy plain-text evaluation summary for an older CV record.')
  assert.equal(adaptedLegacyScore.malformed, false)

  const legacyHtml = renderScore(adaptedLegacyScore, null)
  assert.match(legacyHtml, /Legacy plain-text evaluation summary for an older CV record\./)

  const legacyFeedbackRecord = makeRecord({
    aiType: 'CV_FEEDBACK',
    result: {
      summary: 'Legacy feedback summary.',
      strengths: ['Clear education timeline'],
      improvements: ['Add project impact metrics'],
    },
  })

  const adaptedFeedback = adaptFeedbackResult(legacyFeedbackRecord)
  assert.equal(adaptedFeedback.malformed, false)
  const feedbackDetailHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record: legacyFeedbackRecord,
      loading: false,
      error: null,
      sourceCvId: null,
      onRetry: () => undefined,
    }),
  )
  assert.match(feedbackDetailHtml, /Legacy feedback summary\./)
  assert.match(feedbackDetailHtml, /Clear education timeline/)
})

test('11. handles missing optional fields without crashing', () => {
  const sparseRecord = makeRecord({
    score: null,
    result: {
      dimensions: {
        layout_ats: { score: 70 },
      },
    },
  })

  const adapted = adaptScoreResult(sparseRecord)
  assert.equal(adapted.dimensions.length, 4)
  assert.equal(adapted.partial, true)
  assert.equal(adapted.malformed, false)

  const html = renderScore(adapted, null)
  assert.match(html, /Layout and ATS/)
  assert.match(html, /Not scored/)

  const emptyTranslation = adaptTranslationResult(makeRecord({ aiType: 'CV_TRANSLATION', result: {} }))
  assert.equal(emptyTranslation.malformed, true)
})

test('12. preserves long issue and rewrite text without truncation', () => {
  const longIssue = 'Issue: ' + 'A'.repeat(1200)
  const longRewrite = 'Suggested: ' + 'B'.repeat(1200)
  const record = makeRecord({
    result: {
      overall_score: 65,
      dimensions: {
        layout_ats: { score: 55, issues: [longIssue] },
        language: { score: 70 },
        keywords: { score: 65 },
        jd_fit: { score: 70 },
      },
      rewrites: [
        {
          section: 'summary',
          original: 'Short original text.',
          suggested: longRewrite,
        },
      ],
    },
  })

  const adapted = adaptScoreResult(record)
  assert.equal(adapted.dimensions[0].issues[0], longIssue)
  assert.equal(adapted.rewrites[0].suggested, longRewrite)

  const html = renderScore(adapted, null)
  assert.ok(html.includes(longIssue))
  assert.ok(html.includes(longRewrite))
})

test('13. renders pending, failed, malformed, partial, 403, and 404 result states accurately', () => {
  const pendingRecord = makeRecord({ status: 'PENDING', score: null, result: undefined })
  const pendingHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record: pendingRecord,
      loading: false,
      error: null,
      onRetry: () => undefined,
    }),
  )
  assert.match(pendingHtml, /AI result is still processing/)
  assert.match(pendingHtml, /Processing/)

  const failedRecord = makeRecord({
    status: 'FAILED',
    score: null,
    errorCode: 'AI_PROVIDER_ERROR',
    errorMessage: 'Upstream provider timed out.',
  })
  const failedHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record: failedRecord,
      loading: false,
      error: null,
      onRetry: () => undefined,
    }),
  )
  assert.match(failedHtml, /AI result failed/)
  assert.match(failedHtml, /Upstream provider timed out\./)
  assert.match(failedHtml, /AI_PROVIDER_ERROR/)

  const malformedRecord = makeRecord({ score: null, result: {}, resultText: '{broken-json' })
  const malformedAdapted = adaptScoreResult(malformedRecord)
  assert.equal(malformedAdapted.malformed, true)
  const malformedHtml = renderScore(malformedAdapted, null)
  assert.match(malformedHtml, /The result was created but cannot be displayed fully\./)

  const partialRecord = makeRecord({
    score: 70,
    result: {
      overall_score: 70,
      dimensions: {
        layout_ats: { score: 70 },
      },
    },
  })
  const partialAdapted = adaptScoreResult(partialRecord)
  assert.equal(partialAdapted.partial, true)
  assert.equal(partialAdapted.malformed, false)
  const partialHtml = renderScore(partialAdapted, null)
  assert.match(partialHtml, /Some score details were not returned for this analysis\./)

  const forbiddenHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record: null,
      loading: false,
      errorStatus: 403,
      error: 'You do not have permission to view this AI result.',
      onRetry: () => undefined,
    }),
  )
  assert.match(forbiddenHtml, /Access denied/)
  assert.match(forbiddenHtml, /You do not have permission to view this AI result\./)

  const notFoundHtml = renderToStaticMarkup(
    createElement(AiResultHistoryDetail, {
      record: null,
      loading: false,
      errorStatus: 404,
      error: 'This saved AI result does not exist or is no longer available.',
      onRetry: () => undefined,
    }),
  )
  assert.match(notFoundHtml, /AI result not found/)
})

test('14. direct /ai/results/:resultId detail loader calls GET detail API and never calls POST mutation endpoints', async () => {
  const originalGet = httpClient.get
  const originalPost = httpClient.post
  const getCalls: string[] = []
  const postCalls: string[] = []

  httpClient.get = async (path: string) => {
    getCalls.push(path)
    if (path.startsWith('/ai/results/')) {
      return {
        data: {
          success: true,
          message: 'OK',
          data: {
            aiResult: makeRecord({ id: 'res-42', cvDocumentId: 'cv-99' }),
          },
        },
      }
    }
    if (path === '/cvs') {
      return {
        data: {
          success: true,
          message: 'OK',
          data: {
            cvs: [{ id: 'cv-99', title: 'Backend_Resume.pdf', status: 'ACTIVE', fileType: 'PDF', fileSize: 102400, uploadedAt: '2026-10-10T00:00:00.000Z' }],
          },
        },
      }
    }
    throw new Error(`Unexpected GET ${path}`)
  }

  httpClient.post = async (path: string) => {
    postCalls.push(path)
    throw new Error(`Mutation endpoint must not be called on result detail load: ${path}`)
  }

  try {
    const firstLoad = await loadAiResultDetail('res-42')
    const secondLoadAfterRefresh = await loadAiResultDetail('res-42')

    assert.equal(firstLoad.record.id, 'res-42')
    assert.equal(firstLoad.sourceCvId, 'cv-99')
    assert.equal(secondLoadAfterRefresh.record.id, 'res-42')
    assert.deepEqual(postCalls, [])
    assert.deepEqual(getCalls, ['/ai/results/res-42', '/cvs', '/ai/results/res-42', '/cvs'])
  } finally {
    httpClient.get = originalGet
    httpClient.post = originalPost
  }
})

test('15. routes /ai, /ai/history, /ai/results/:resultId, redirects /ai-chat to /ai, updates navigation label to CV Analysis, and validates query prefill', (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    },
  })
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })

  const headerHtml = renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: ['/ai'] }, createElement(ApplicantHeader)),
  )
  assert.match(headerHtml, /href="\/ai"[^>]*>CV Analysis<\/a>/)
  assert.doesNotMatch(headerHtml, /AI Chatting/)

  const applicantGroup = appRoutes.find((route) => {
    const children = route.children as Array<Record<string, unknown>> | undefined
    return Array.isArray(children) && children.some((child) => Array.isArray(child.children) && (child.children as Array<Record<string, unknown>>).some((leaf) => leaf.path === 'ai'))
  })
  assert.ok(applicantGroup, 'Expected Applicant route group containing /ai routes')

  const shellChildren = ((applicantGroup.children as Array<Record<string, unknown>>)[0].children as Array<Record<string, unknown>>)
  const paths = new Map(shellChildren.map((route) => [route.path, route.element as { props?: { to?: string; replace?: boolean } }]))

  assert.ok(paths.has('ai'))
  assert.ok(paths.has('ai/history'))
  assert.ok(paths.has('ai/results/:resultId'))
  assert.ok(paths.has('ai-chat'))
  assert.equal(paths.get('ai-chat')?.props?.to, '/ai')
  assert.equal(paths.get('ai-chat')?.props?.replace, true)

  // Verify history items render stable links to /ai/results/:resultId
  const historyItems = adaptAiHistory([makeRecord({ id: 'stable-id-123' })], [])
  const historyHtml = renderToStaticMarkup(
    createElement(AiResultHistory, {
      items: historyItems,
      loading: false,
      error: null,
      onRetry: () => undefined,
    }),
  )
  assert.match(historyHtml, /href="\/ai\/results\/stable-id-123"/)

  // Verify composer prefill validates cvId against API CVs and rejects unknown/unavailable cvId
  const availableCvs = [
    { id: 'cv-valid', title: 'Valid.pdf', status: 'available', fileType: 'PDF', fileSize: 1024, uploadedAt: '2026-10-01' },
    { id: 'cv-disabled', title: 'Disabled.pdf', status: 'deleted', fileType: 'PDF', fileSize: 1024, uploadedAt: '2026-10-01' },
  ]
  assert.deepEqual(
    resolveAiComposerPrefill(availableCvs, { cvId: 'cv-valid', action: 'translate' }),
    { selectedCvId: 'cv-valid', selectedAction: 'translate' },
  )
  assert.deepEqual(
    resolveAiComposerPrefill(availableCvs, { cvId: 'forged-cv-id', action: 'translate' }),
    { selectedCvId: '', selectedAction: 'translate' },
  )
  assert.deepEqual(
    resolveAiComposerPrefill(availableCvs, { cvId: 'cv-disabled', action: 'invalid-action' }),
    { selectedCvId: '', selectedAction: '' },
  )
})
