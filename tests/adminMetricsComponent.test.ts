import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer, type ViteDevServer } from 'vite'
import type { AdminMetricsViewState } from '../src/modules/admin/adminMetricsModel.ts'

interface DashboardViewProps {
  state: AdminMetricsViewState
  onRefresh: () => void
}

interface PortfolioApiModule {
  PUBLIC_PORTFOLIO_ROUTE_PATH: string
  getPublicPortfolioRoute: (slug: string) => string
  getPublicPortfolio: (slug: string) => Promise<unknown>
  publishPortfolio: () => Promise<{ id: string; isPublic: boolean } | undefined>
  unpublishPortfolio: () => Promise<{ id: string; isPublic: boolean } | undefined>
  getPortfolioErrorMessage: (error: unknown, fallback: string) => string
}

interface HttpClientModule {
  httpClient: {
    get: (path: string) => Promise<unknown>
    patch: (path: string) => Promise<unknown>
  }
}

interface VisibilityControlProps {
  isPublic: boolean
  publicUrl: string
  busy: boolean
  onChange: (isPublic: boolean) => void
}

let server: ViteDevServer
let DashboardView: ComponentType<DashboardViewProps>
let portfolioApi: PortfolioApiModule
let httpClient: HttpClientModule['httpClient']
let VisibilityControl: ComponentType<VisibilityControlProps>

before(async () => {
  server = await createServer({ appType: 'custom', server: { middlewareMode: true, hmr: false } })
  const module = await server.ssrLoadModule('/src/modules/admin/Home.tsx')
  DashboardView = module.AdminMetricsDashboardView as ComponentType<DashboardViewProps>
  portfolioApi = await server.ssrLoadModule('/src/modules/portfolio/portfolioApi.ts') as PortfolioApiModule
  httpClient = (await server.ssrLoadModule('/src/apis/httpClient.ts') as HttpClientModule).httpClient
  VisibilityControl = (await server.ssrLoadModule('/src/modules/portfolio/PortfolioVisibilityControl.tsx'))
    .PortfolioVisibilityControl as ComponentType<VisibilityControlProps>
})

after(async () => {
  await server.close()
})

function render(state: AdminMetricsViewState) {
  return renderToStaticMarkup(createElement(DashboardView, { state, onRefresh: () => undefined }))
}

test('dashboard component renders an accessible loading state', () => {
  const html = render({ status: 'loading', data: null, error: null })

  assert.match(html, /aria-busy="true"/)
  assert.match(html, /Loading admin user metrics/)
  assert.match(html, /Refreshing/)
})

test('dashboard component renders all successful metrics and timestamp', () => {
  const html = render({
    status: 'ready',
    error: null,
    data: {
      totalUsers: 14,
      applicants: 10,
      companies: 4,
      activeUsers: 12,
      newUsersLast7Days: 3,
      generatedAt: '2026-09-11T04:00:00.000Z',
    },
  })

  assert.match(html, /Total users/)
  assert.match(html, />14</)
  assert.match(html, /Applicants/)
  assert.match(html, />10</)
  assert.match(html, /Companies/)
  assert.match(html, /Active users/)
  assert.match(html, /New users \(7 days\)/)
  assert.match(html, /dateTime="2026-09-11T04:00:00.000Z"/)
})

test('dashboard component renders empty and error states without stale totals', () => {
  const emptyHtml = render({
    status: 'empty',
    error: null,
    data: {
      totalUsers: 0,
      applicants: 0,
      companies: 0,
      activeUsers: 0,
      newUsersLast7Days: 0,
      generatedAt: '2026-09-11T04:00:00.000Z',
    },
  })
  assert.match(emptyHtml, /No users yet/)

  const errorHtml = render({ status: 'error', data: null, error: 'Service unavailable' })
  assert.match(errorHtml, /Metrics are unavailable/)
  assert.match(errorHtml, /Service unavailable/)
  assert.doesNotMatch(errorHtml, />14</)
})

test('public Portfolio route and API encode the slug without using an authenticated endpoint', async () => {
  const originalGet = httpClient.get
  const calls: string[] = []
  httpClient.get = async (path) => {
    calls.push(path)
    return { data: { success: true, message: 'OK', data: { portfolio: {}, experiences: [], moments: [] } } }
  }

  try {
    assert.equal(portfolioApi.PUBLIC_PORTFOLIO_ROUTE_PATH, 'p/:slug')
    assert.equal(portfolioApi.getPublicPortfolioRoute('alex nguyen/2026'), '/p/alex%20nguyen%2F2026')
    await portfolioApi.getPublicPortfolio('alex nguyen/2026')
    assert.deepEqual(calls, ['/portfolio/public/alex%20nguyen%2F2026'])
  } finally {
    httpClient.get = originalGet
  }
})

test('Portfolio visibility calls the canonical publish and unpublish endpoints', async () => {
  const originalPatch = httpClient.patch
  const calls: string[] = []
  httpClient.patch = async (path) => {
    calls.push(path)
    return { data: { success: true, message: 'OK', data: { portfolio: { id: 'portfolio-1', isPublic: path.endsWith('/publish') } } } }
  }

  try {
    assert.deepEqual(await portfolioApi.publishPortfolio(), { id: 'portfolio-1', isPublic: true })
    assert.deepEqual(await portfolioApi.unpublishPortfolio(), { id: 'portfolio-1', isPublic: false })
    assert.deepEqual(calls, ['/portfolio/me/publish', '/portfolio/me/unpublish'])
  } finally {
    httpClient.patch = originalPatch
  }
})

test('Portfolio visibility failure preserves the stable server message for the UI', async () => {
  const originalPatch = httpClient.patch
  httpClient.patch = async () => {
    throw { response: { status: 503, data: { success: false, code: 'SERVICE_UNAVAILABLE', message: 'Portfolio publishing is temporarily unavailable.', errors: [] } } }
  }

  try {
    await assert.rejects(
      portfolioApi.publishPortfolio(),
      (error: unknown) => portfolioApi.getPortfolioErrorMessage(error, 'fallback') === 'Portfolio publishing is temporarily unavailable.',
    )
  } finally {
    httpClient.patch = originalPatch
  }
})

test('Portfolio visibility control exposes public and private states without leaking a link while private', () => {
  const privateHtml = renderToStaticMarkup(createElement(VisibilityControl, {
    isPublic: false,
    publicUrl: 'https://app.example.com/p/alex',
    busy: false,
    onChange: () => undefined,
  }))
  assert.match(privateHtml, /Make public/)
  assert.doesNotMatch(privateHtml, /portfolio-public-url/)

  const publicHtml = renderToStaticMarkup(createElement(VisibilityControl, {
    isPublic: true,
    publicUrl: 'https://app.example.com/p/alex',
    busy: false,
    onChange: () => undefined,
  }))
  assert.match(publicHtml, /Make private/)
  assert.match(publicHtml, /portfolio-public-url/)
  assert.match(publicHtml, /https:\/\/app.example.com\/p\/alex/)
})
