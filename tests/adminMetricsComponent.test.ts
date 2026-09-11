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

let server: ViteDevServer
let DashboardView: ComponentType<DashboardViewProps>

before(async () => {
  server = await createServer({ appType: 'custom', server: { middlewareMode: true } })
  const module = await server.ssrLoadModule('/src/modules/admin/Home.tsx')
  DashboardView = module.AdminMetricsDashboardView as ComponentType<DashboardViewProps>
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
