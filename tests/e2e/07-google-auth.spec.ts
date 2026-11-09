import { test, expect, type Page } from '@playwright/test';

const TEST_GOOGLE_CLIENT_ID = 'e2e-test-client-id.apps.googleusercontent.com';

async function installMockGisScript(page: Page, options: { failLoad?: boolean } = {}) {
  await page.addInitScript((clientId) => {
    window.__CVBUDDY_GOOGLE_CLIENT_ID__ = clientId;
  }, TEST_GOOGLE_CLIENT_ID);

  await page.route('https://accounts.google.com/gsi/client', async (route) => {
    if (options.failLoad) {
      await route.abort('failed');
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.__gisDisabledAutoSelectCount = 0;
        window.google = {
          accounts: {
            id: {
              initialize: function(config) {
                window.__gisConfig = config;
              },
              renderButton: function(parent) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('data-testid', 'mock-gis-button');
                btn.textContent = 'Continue with Google';
                btn.addEventListener('click', function() {
                  if (window.__gisConfig && window.__gisConfig.callback) {
                    window.__gisConfig.callback({
                      credential: window.__nextGoogleCredential || 'mock-google-id-token'
                    });
                  }
                });
                parent.appendChild(btn);
              },
              prompt: function() {
                if (window.__gisConfig && window.__gisConfig.callback) {
                  window.__gisConfig.callback({
                    credential: window.__nextGoogleCredential || 'mock-google-id-token'
                  });
                }
              },
              disableAutoSelect: function() {
                window.__gisDisabledAutoSelectCount = (window.__gisDisabledAutoSelectCount || 0) + 1;
              }
            }
          }
        };
      `,
    });
  });
}

test.describe('Phase 5 — Google Authentication UX & Accessibility E2E', () => {
  test('Unconfigured GIS displays clear error when Continue with Google is clicked', async ({ page }) => {
    await page.addInitScript(() => {
      window.__CVBUDDY_GOOGLE_CLIENT_ID__ = '';
    });

    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue with Google' }).click();

    await expect(page.locator('[role="alert"]')).toContainText(
      'Google Sign-In is not configured in this environment (VITE_GOOGLE_CLIENT_ID is missing).',
    );
  });

  test('GIS script load failure displays clear network/fallback error', async ({ page }) => {
    await installMockGisScript(page, { failLoad: true });

    await page.goto('/login');
    await expect(page.locator('[role="alert"]')).toContainText(
      'Unable to load Google Sign-In. Please check your network connection or use email and password.',
    );
  });

  test('First Google login with complete profile redirects to /profile and calls disableAutoSelect on logout', async ({
    page,
  }) => {
    await installMockGisScript(page);

    await page.route('**/api/auth/google', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Google account registered successfully',
          data: {
            requireLink: false,
            isNewAccount: true,
            needsProfileCompletion: false,
            token: 'e2e-google-jwt-complete',
            account: {
              id: '66a111111111111111111111',
              email: 'complete.google@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['GOOGLE'],
              needsProfileCompletion: false,
            },
            profile: {
              id: '66a222222222222222222222',
              fullName: 'Nguyen Minh Anh',
              avatarUrl: '',
              isComplete: true,
            },
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Current account fetched successfully',
          data: {
            needsProfileCompletion: false,
            account: {
              id: '66a111111111111111111111',
              email: 'complete.google@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['GOOGLE'],
              needsProfileCompletion: false,
            },
            profile: {
              id: '66a222222222222222222222',
              fullName: 'Nguyen Minh Anh',
              avatarUrl: '',
              isComplete: true,
            },
          },
        }),
      });
    });

    await page.route('**/api/applicant-profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Applicant profile fetched successfully',
          data: {
            profile: {
              id: '66a222222222222222222222',
              fullName: 'Nguyen Minh Anh',
              headline: 'Product Designer',
              location: 'Ho Chi Minh City',
              phone: '0901234567',
              summary: 'Ready for opportunities',
              avatarUrl: '',
            },
          },
        }),
      });
    });

    let logoutCalls = 0;
    await page.route('**/api/auth/logout', async (route) => {
      logoutCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Logged out successfully',
        }),
      });
    });

    await page.goto('/login');
    await page.getByTestId('mock-gis-button').click();

    await page.waitForURL('**/profile', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Nguyen Minh Anh');

    const tokenBeforeLogout = await page.evaluate(() => window.localStorage.getItem('cvbuddy.auth.token'));
    expect(tokenBeforeLogout).toBe('e2e-google-jwt-complete');

    // Trigger logout via the account menu in the header UI
    await page.getByRole('button', { name: 'Open account menu' }).click();
    await page.getByRole('menuitem', { name: /Logout/i }).click();

    await page.waitForURL('**/login', { timeout: 10000 });
    expect(logoutCalls).toBe(1);

    const storageAfterLogout = await page.evaluate(() => ({
      token: window.localStorage.getItem('cvbuddy.auth.token'),
      account: window.localStorage.getItem('cvbuddy.auth.account'),
      disabledAutoSelectCount: (
        window as unknown as { __gisDisabledAutoSelectCount?: number }
      ).__gisDisabledAutoSelectCount,
    }));

    expect(storageAfterLogout.token).toBeNull();
    expect(storageAfterLogout.account).toBeNull();
    expect(storageAfterLogout.disabledAutoSelectCount).toBe(1);
  });

  test('Google login with missing required profile data redirects to /profile/edit', async ({ page }) => {
    await installMockGisScript(page);

    await page.route('**/api/auth/google', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Google account registered successfully',
          data: {
            requireLink: false,
            isNewAccount: true,
            needsProfileCompletion: true,
            token: 'e2e-google-jwt-incomplete',
            account: {
              id: '66a111111111111111111112',
              email: 'incomplete.google@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['GOOGLE'],
              needsProfileCompletion: true,
            },
            profile: {
              id: '66a222222222222222222223',
              fullName: 'Applicant',
              avatarUrl: '',
              isComplete: false,
            },
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Current account fetched successfully',
          data: {
            needsProfileCompletion: true,
            account: {
              id: '66a111111111111111111112',
              email: 'incomplete.google@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['GOOGLE'],
              needsProfileCompletion: true,
            },
            profile: {
              id: '66a222222222222222222223',
              fullName: 'Applicant',
              avatarUrl: '',
              isComplete: false,
            },
          },
        }),
      });
    });

    await page.route('**/api/applicant-profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Applicant profile fetched successfully',
          data: {
            profile: {
              id: '66a222222222222222222223',
              fullName: 'Applicant',
              headline: '',
              location: '',
              phone: '',
              summary: '',
              avatarUrl: '',
            },
          },
        }),
      });
    });

    await page.goto('/register');
    await page.getByTestId('mock-gis-button').click();

    await page.waitForURL('**/profile/edit', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();

    // Reloading on /profile redirects back to /profile/edit after /api/auth/me verification
    await page.goto('/profile');
    await page.waitForURL('**/profile/edit', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();

    await page.reload();
    await page.waitForURL('**/profile/edit', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
  });

  test('Account linking dialog enforces accessibility: autofocus, aria attributes, live alert error, Escape close/restore focus, and loading lockout', async ({
    page,
  }) => {
    await installMockGisScript(page);

    let googleAuthCalls = 0;
    await page.route('**/api/auth/google', async (route) => {
      googleAuthCalls += 1;
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'GOOGLE_ACCOUNT_LINK_REQUIRED',
          message: 'An account with this email already exists. Confirm your password to link Google Sign-In.',
          errors: [],
          requireLink: true,
          email: 'existing.password@example.com',
          linkToken: 'signed-challenge-token-123',
        }),
      });
    });

    let linkCalls = 0;
    let notifyCorrectLinkStarted: (() => void) | null = null;
    const correctLinkStartedPromise = new Promise<void>((resolve) => {
      notifyCorrectLinkStarted = resolve;
    });
    let releaseCorrectLinkResponse: (() => void) | null = null;
    const releaseCorrectLinkPromise = new Promise<void>((resolve) => {
      releaseCorrectLinkResponse = resolve;
    });

    await page.route('**/api/auth/google/link', async (route) => {
      linkCalls += 1;
      const body = route.request().postDataJSON();

      if (body.password === 'WrongPassword!') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect',
            errors: [],
          }),
        });
        return;
      }

      notifyCorrectLinkStarted?.();
      await releaseCorrectLinkPromise;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Google account linked successfully',
          data: {
            needsProfileCompletion: false,
            token: 'linked-session-jwt-123',
            account: {
              id: '66a111111111111111111115',
              email: 'existing.password@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['PASSWORD', 'GOOGLE'],
              needsProfileCompletion: false,
            },
            profile: {
              id: '66a222222222222222222225',
              fullName: 'Existing Password User',
              avatarUrl: '',
              isComplete: true,
            },
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Current account fetched successfully',
          data: {
            needsProfileCompletion: false,
            account: {
              id: '66a111111111111111111115',
              email: 'existing.password@example.com',
              role: 'APPLICANT',
              status: 'ACTIVE',
              authMethods: ['PASSWORD', 'GOOGLE'],
              needsProfileCompletion: false,
            },
            profile: {
              id: '66a222222222222222222225',
              fullName: 'Existing Password User',
              avatarUrl: '',
              isComplete: true,
            },
          },
        }),
      });
    });

    await page.route('**/api/applicant-profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Applicant profile fetched successfully',
          data: {
            profile: {
              id: '66a222222222222222222225',
              fullName: 'Existing Password User',
              headline: 'Full Stack Developer',
              location: 'Da Nang',
              phone: '0909999999',
              summary: 'Experienced engineer',
              avatarUrl: '',
            },
          },
        }),
      });
    });

    await page.goto('/login');
    const gisButton = page.getByTestId('mock-gis-button');
    await gisButton.focus();
    await gisButton.click();

    // 1. Dialog opens with aria-labelledby and aria-describedby, and autofocuses password input
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-labelledby', 'google-link-dialog-title');
    await expect(dialog).toHaveAttribute('aria-describedby', 'google-link-dialog-description');

    const passwordInput = dialog.locator('#google-link-password');
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel' });
    const submitBtn = dialog.getByRole('button', { name: /Confirm & Link Account/i });
    await expect(passwordInput).toBeFocused();

    // 2. Focus trap: Shift+Tab on first element wraps to last element, Tab on last element wraps to first element
    await page.keyboard.press('Shift+Tab');
    await expect(submitBtn).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(cancelBtn).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(submitBtn).toBeFocused();

    // Programmatic focus on a background control behind the overlay is pulled back inside the dialog
    await page.locator('input[type="email"]').focus();
    await expect(passwordInput).toBeFocused();

    // 3. Escape closes the dialog when not submitting and restores focus to trigger
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(gisButton).toBeFocused();

    // 4. Re-open dialog and submit wrong password -> announces error via role="alert" live region
    await gisButton.click();
    await expect(dialog).toBeVisible();
    await expect(passwordInput).toBeFocused();

    await passwordInput.fill('WrongPassword!');
    await submitBtn.click();

    const errorAlert = dialog.locator('#google-link-error[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    await expect(errorAlert).toContainText('Current password is incorrect');
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

    // 5. Submit correct password -> while pending, verify loading state, Escape lockout, and duplicate submit prevention
    await passwordInput.fill('CorrectPassword123!');
    await submitBtn.click();
    await correctLinkStartedPromise;

    await expect(submitBtn).toBeDisabled();
    await expect(cancelBtn).toBeDisabled();
    await expect(passwordInput).toBeDisabled();

    // Attempt duplicate form submission and duplicate GIS callback while the link request is in-flight
    await dialog.locator('form').evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await page.evaluate(() => {
      const gisWindow = window as unknown as {
        __gisConfig?: { callback?: (res: { credential: string }) => void };
      };
      gisWindow.__gisConfig?.callback?.({ credential: 'duplicate-google-id-token' });
    });

    // Escape must NOT close the dialog while the link request is in-flight
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    expect(linkCalls).toBe(2);
    expect(googleAuthCalls).toBe(2);

    releaseCorrectLinkResponse?.();

    await page.waitForURL('**/profile', { timeout: 10000 });
    expect(linkCalls).toBe(2);
    expect(googleAuthCalls).toBe(2);
  });
});
