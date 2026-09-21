import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ADMIN_METRICS_OVERVIEW_PATH,
  beginAdminMetricsLoad,
  parseAdminMetricsOverview,
  rejectAdminMetricsLoad,
  resolveAdminMetricsLoad,
} from '../src/modules/admin/adminMetricsModel.ts'

const metrics = {
  totalUsers: 14,
  applicants: 10,
  companies: 4,
  activeUsers: 12,
  newUsersLast7Days: 3,
  generatedAt: '2026-09-11T04:00:00.000Z',
}

test('admin dashboard uses the protected metrics overview endpoint', () => {
  assert.equal(ADMIN_METRICS_OVERVIEW_PATH, '/admin/metrics/overview')
})

test('valid metrics are accepted without changing their values', () => {
  assert.deepEqual(parseAdminMetricsOverview(metrics), metrics)
})

for (const [field, value] of [
  ['totalUsers', -1],
  ['applicants', 1.5],
  ['companies', '4'],
  ['activeUsers', Number.NaN],
  ['newUsersLast7Days', undefined],
] as const) {
  test(`invalid ${field} values are rejected`, () => {
    assert.throws(() => parseAdminMetricsOverview({ ...metrics, [field]: value }))
  })
}

test('invalid generation timestamps are rejected', () => {
  assert.throws(() => parseAdminMetricsOverview({ ...metrics, generatedAt: 'not-a-date' }))
})

test('internally inconsistent totals are rejected', () => {
  assert.throws(() => parseAdminMetricsOverview({ ...metrics, totalUsers: 13 }))
  assert.throws(() => parseAdminMetricsOverview({ ...metrics, activeUsers: 15 }))
  assert.throws(() => parseAdminMetricsOverview({ ...metrics, newUsersLast7Days: 15 }))
})

test('zero total users produces an explicit empty state', () => {
  const state = resolveAdminMetricsLoad({
    ...metrics,
    totalUsers: 0,
    applicants: 0,
    companies: 0,
    activeUsers: 0,
    newUsersLast7Days: 0,
  })

  assert.equal(state.status, 'empty')
  assert.equal(state.data?.totalUsers, 0)
})

test('refresh and error states never retain stale metrics', () => {
  const readyState = resolveAdminMetricsLoad(metrics)
  assert.equal(readyState.status, 'ready')

  const loadingState = beginAdminMetricsLoad()
  assert.equal(loadingState.status, 'loading')
  assert.equal(loadingState.data, null)

  const errorState = rejectAdminMetricsLoad('Service unavailable')
  assert.equal(errorState.status, 'error')
  assert.equal(errorState.data, null)
  assert.equal(errorState.error, 'Service unavailable')
})
