import { test, expect } from '@playwright/test';
import { registerTestApplicant, loginViaUi } from './fixtures';

test.describe('Applicant Authentication & Profile Flow', () => {
  test('User Registration via UI: register -> login redirect -> login -> profile', async ({ page }) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const email = `test-ui-${unique}@example.com`;
    const password = 'Password123!';
    const fullName = `Jane Doe ${unique}`;

    // 1. Visit Register Page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Join CVBuddy');

    // 2. Fill registration form
    await page.fill('input[placeholder="Alex Walker"]', fullName);
    await page.fill('input[placeholder="alex@example.com"]', email);
    await page.fill('input[placeholder="Enter a password"]', password);
    await page.fill('input[placeholder="Re-enter password"]', password);
    await page.click('button:has-text("Create Account")');

    // 3. Should redirect to login page with success notice
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('CVBuddy');

    // 4. Log in with registered credentials
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign In")');

    // 5. Lands on Profile Page
    await page.waitForURL('**/profile', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(fullName);
  });

  test('Profile Update: edit profile form -> save -> verify updated fields', async ({ page }) => {
    // Register and login an applicant
    const user = await registerTestApplicant(page, { fullName: 'Alex Original' });
    await loginViaUi(page, user);

    // Navigate to profile edit
    await page.goto('/profile/edit');
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();

    // Update headline, location, summary
    const newHeadline = 'Senior AI Engineer';
    const newLocation = 'Ho Chi Minh City';

    await page.fill('input[name="headline"]', newHeadline);
    await page.fill('input[name="location"]', newLocation);

    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify redirected back to profile and shows updated info
    await page.waitForURL('**/profile', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(newHeadline);
  });

  test('Password Change and Session Revocation', async ({ page }) => {
    const user = await registerTestApplicant(page, { password: 'InitialPass123!' });
    await loginViaUi(page, user);

    // Go to change password
    await page.goto('/change-password');
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();

    const newPassword = 'UpdatedPass123!';
    await page.fill('input[name="currentPassword"]', user.password);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.getByRole('button', { name: /update password/i }).click();

    // Verify success feedback
    await expect(page.getByText(/password changed successfully/i)).toBeVisible({ timeout: 10000 });

    // Clear session to simulate logout
    await page.evaluate(() => localStorage.clear());

    // Try login with OLD password -> should fail
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });

    // Login with NEW password -> should succeed
    await page.fill('input[type="password"]', newPassword);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/profile', { timeout: 10000 });
    await expect(page).toHaveURL(/\/profile/);
  });
});
