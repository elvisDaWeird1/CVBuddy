import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTH_ROLES,
  classifySessionVerificationFailure,
  getAuthRole,
  getInitialAuthStatus,
  getWorkspacePathForAccount,
  isRoleAllowed,
} from '../src/modules/auth/authPolicy.ts'

test('a visitor without a token starts anonymous', () => {
  assert.equal(getInitialAuthStatus(null), 'anonymous')
})

test('a stored token is checked before protected content can render', () => {
  assert.equal(getInitialAuthStatus('fresh-token'), 'checking')
})

for (const scenario of ['expired token', 'revoked token', 'malformed token']) {
  test(`${scenario} is cleared when the server returns 401`, () => {
    assert.equal(classifySessionVerificationFailure(401), 'invalid-session')
  })
}

test('a 403 from session verification invalidates the client session', () => {
  assert.equal(classifySessionVerificationFailure(403), 'invalid-session')
})

test('a network failure preserves the session for retry', () => {
  assert.equal(classifySessionVerificationFailure(undefined), 'verification-unavailable')
  assert.equal(classifySessionVerificationFailure(503), 'verification-unavailable')
})

test('supported roles resolve to isolated workspaces', () => {
  assert.equal(getWorkspacePathForAccount({ role: AUTH_ROLES.APPLICANT }), '/profile')
  assert.equal(getWorkspacePathForAccount({ role: AUTH_ROLES.ADMIN }), '/admin')
  assert.equal(getWorkspacePathForAccount({ role: AUTH_ROLES.COMPANY }), '/company')
  assert.equal(getWorkspacePathForAccount({ role: 'UNKNOWN' }), '/login')
})

test('role guards reject access to another workspace', () => {
  const applicantRole = getAuthRole({ role: AUTH_ROLES.APPLICANT })
  assert.equal(applicantRole, AUTH_ROLES.APPLICANT)
  assert.equal(isRoleAllowed(applicantRole, [AUTH_ROLES.APPLICANT]), true)
  assert.equal(isRoleAllowed(applicantRole, [AUTH_ROLES.ADMIN]), false)

  const adminRole = getAuthRole({ role: AUTH_ROLES.ADMIN })
  assert.equal(adminRole, AUTH_ROLES.ADMIN)
  assert.equal(isRoleAllowed(adminRole, [AUTH_ROLES.ADMIN]), true)
  assert.equal(isRoleAllowed(adminRole, [AUTH_ROLES.APPLICANT]), false)
})
