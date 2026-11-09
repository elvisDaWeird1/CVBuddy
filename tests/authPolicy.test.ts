import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTH_ROLES,
  classifySessionVerificationFailure,
  extractGoogleLinkChallenge,
  getAuthRole,
  getGooglePostAuthRedirectPath,
  getInitialAuthStatus,
  getWorkspacePathForAccount,
  hydrateAccountWithProfile,
  isGoogleProfileIncomplete,
  isRoleAllowed,
} from '../src/modules/auth/authPolicy.ts'
import { disableGoogleAutoSelect, resolveGoogleClientId } from '../src/modules/auth/googleIdentity.ts'

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

test('resolveGoogleClientId trims configured client IDs and rejects blank values', () => {
  assert.equal(resolveGoogleClientId('  client-123.apps.googleusercontent.com  '), 'client-123.apps.googleusercontent.com')
  assert.equal(resolveGoogleClientId('   '), null)
  assert.equal(resolveGoogleClientId(undefined), null)
})

test('extractGoogleLinkChallenge detects account-link-required responses from both 409 errors and payloads', () => {
  const fromAxiosError = extractGoogleLinkChallenge({
    response: {
      status: 409,
      data: {
        success: false,
        code: 'GOOGLE_ACCOUNT_LINK_REQUIRED',
        requireLink: true,
        email: 'existing@example.com',
        linkToken: 'challenge-jwt-123',
      },
    },
  })
  assert.deepEqual(fromAxiosError, {
    email: 'existing@example.com',
    linkToken: 'challenge-jwt-123',
  })

  const fromNormalLogin = extractGoogleLinkChallenge({
    success: true,
    data: {
      token: 'jwt-token',
      account: { email: 'user@example.com', role: 'APPLICANT' },
    },
  })
  assert.equal(fromNormalLogin, null)
})

test('getGooglePostAuthRedirectPath redirects incomplete or placeholder profiles to /profile/edit and complete profiles to /profile', () => {
  // Explicit needsProfileCompletion signal from backend
  assert.equal(
    isGoogleProfileIncomplete({
      needsProfileCompletion: true,
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: 'Applicant', isComplete: false },
    }),
    true,
  )
  assert.equal(
    getGooglePostAuthRedirectPath({
      needsProfileCompletion: true,
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: 'Applicant', isComplete: false },
    }),
    '/profile/edit',
  )

  // Placeholder or blank fullName fallback detection
  assert.equal(
    getGooglePostAuthRedirectPath({
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: 'Applicant' },
    }),
    '/profile/edit',
  )
  assert.equal(
    getGooglePostAuthRedirectPath({
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: ' ' },
    }),
    '/profile/edit',
  )

  // Complete applicant profile continues to /profile
  assert.equal(
    isGoogleProfileIncomplete({
      needsProfileCompletion: false,
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: 'Nguyen Minh Anh', isComplete: true },
    }),
    false,
  )
  assert.equal(
    getGooglePostAuthRedirectPath({
      needsProfileCompletion: false,
      account: { role: AUTH_ROLES.APPLICANT },
      profile: { fullName: 'Nguyen Minh Anh', isComplete: true },
    }),
    '/profile',
  )
})

test('hydrateAccountWithProfile preserves Google authMethods and profile completion across session reload without affecting password-only accounts', () => {
  const hydratedIncompleteGoogle = hydrateAccountWithProfile(
    {
      id: 'acc-google-1',
      email: 'incomplete@example.com',
      role: AUTH_ROLES.APPLICANT,
      authMethods: ['GOOGLE'],
      needsProfileCompletion: true,
    },
    {
      id: 'prof-1',
      fullName: 'Applicant',
      avatarUrl: '',
      isComplete: false,
    },
    true,
  )

  assert.deepEqual(hydratedIncompleteGoogle.authMethods, ['GOOGLE'])
  assert.equal(hydratedIncompleteGoogle.needsProfileCompletion, true)
  assert.equal(hydratedIncompleteGoogle.isComplete, false)
  assert.equal(getGooglePostAuthRedirectPath({ account: hydratedIncompleteGoogle }), '/profile/edit')

  const hydratedCompleteGoogle = hydrateAccountWithProfile(
    {
      id: 'acc-google-2',
      email: 'complete@example.com',
      role: AUTH_ROLES.APPLICANT,
      authMethods: ['GOOGLE'],
      needsProfileCompletion: false,
    },
    {
      id: 'prof-2',
      fullName: 'Nguyen Minh Anh',
      avatarUrl: 'https://example.com/a.png',
      isComplete: true,
    },
    false,
  )

  assert.equal(hydratedCompleteGoogle.needsProfileCompletion, false)
  assert.equal(hydratedCompleteGoogle.isComplete, true)
  assert.equal(getGooglePostAuthRedirectPath({ account: hydratedCompleteGoogle }), '/profile')

  const hydratedPasswordOnly = hydrateAccountWithProfile(
    {
      id: 'acc-pw-1',
      email: 'pw@example.com',
      role: AUTH_ROLES.APPLICANT,
      authMethods: ['PASSWORD'],
      needsProfileCompletion: false,
    },
    {
      id: 'prof-3',
      fullName: 'A',
      avatarUrl: '',
      isComplete: false,
    },
    false,
  )

  assert.equal(isGoogleProfileIncomplete({ account: hydratedPasswordOnly }), false)
  assert.equal(getGooglePostAuthRedirectPath({ account: hydratedPasswordOnly }), '/profile')
})

test('disableGoogleAutoSelect invokes window.google.accounts.id.disableAutoSelect when available', () => {
  let called = 0
  const previousWindow = (globalThis as { window?: unknown }).window
  ;(globalThis as { window?: unknown }).window = {
    google: {
      accounts: {
        id: {
          disableAutoSelect: () => {
            called += 1
          },
        },
      },
    },
  }

  try {
    disableGoogleAutoSelect()
    assert.equal(called, 1)
  } finally {
    ;(globalThis as { window?: unknown }).window = previousWindow
  }
})
