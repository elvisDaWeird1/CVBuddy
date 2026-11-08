import { test, expect } from '@playwright/test';
import { registerTestApplicant, loginViaUi, createSamplePdf } from './fixtures';

test.describe('AI CV Scoring & Translation E2E', () => {
  test('uploads CV, redirects /ai-chat to /ai, executes scoring & translation, and preserves stable result URLs on reload and history', async ({ page }) => {
    test.setTimeout(90000); // AI calls may take several seconds
    const user = await registerTestApplicant(page);
    await loginViaUi(page, user);

    // 1. Upload CV in /cv
    await page.goto('/cv');
    const pdf = createSamplePdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'ai-test-cv.pdf',
      mimeType: 'application/pdf',
      buffer: pdf.buffer,
    });

    const uploadBtn = page.locator('button[type="submit"]:has-text("Upload CV")');
    await uploadBtn.click();
    await expect(page.getByRole('heading', { name: 'ai-test-cv', exact: true })).toBeVisible({ timeout: 15000 });

    // 2. Verify /ai-chat compatibility redirect to /ai and CV Analysis label
    await page.goto('/ai-chat');
    await expect(page).toHaveURL(/\/ai$/);
    await expect(page.getByRole('heading', { name: 'CV Analysis', level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Applicant sections' }).getByRole('link', { name: 'CV Analysis' })).toBeVisible();

    // 3. Step 1: Select the uploaded CV on /ai
    const cvRadio = page.locator('input[name="ai-cv"]').first();
    await expect(cvRadio).toBeVisible();
    await cvRadio.check();

    // 4. Step 2: Choose "Chấm điểm và review CV"
    const analyzeRadio = page.locator('input[value="analyze"]');
    await analyzeRadio.check();

    // 5. Step 3: Select Industry -> Specialization -> Target Role via selectOption
    const industrySelect = page.locator('#ai-industry');
    await industrySelect.selectOption('ai_software');
    await page.locator('#ai-vertical').selectOption('machine_learning');
    await page.locator('#ai-target-role').selectOption('AI Engineer');

    // 6. Submit Scoring Request and verify navigation to /ai/results/:id
    const submitScoreBtn = page.getByRole('button', { name: 'Chấm điểm và review' });
    await expect(submitScoreBtn).toBeEnabled();
    await submitScoreBtn.click();

    await expect(page).toHaveURL(/\/ai\/results\/[^/?#]+$/, { timeout: 45000 });
    const scoreResultUrl = page.url();
    const scoreResultPath = new URL(scoreResultUrl).pathname;

    await expect(page.locator('#overall-score-heading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CV analysis', exact: true })).toBeVisible();

    // 7. Reload result URL and confirm no new AI mutation request is created
    let aiMutationRequestsOnReload = 0;
    const onRequest = (request: { method: () => string; url: () => string }) => {
      if (request.method() === 'POST' && request.url().includes('/api/ai/cvs/')) {
        aiMutationRequestsOnReload += 1;
      }
    };
    page.on('request', onRequest);
    await page.reload();
    await expect(page).toHaveURL(scoreResultUrl);
    await expect(page.locator('#overall-score-heading')).toBeVisible();
    expect(aiMutationRequestsOnReload).toBe(0);
    page.off('request', onRequest);

    // 8. Navigate to /ai/history and verify the history item opens the same stable result URL
    await page.goto('/ai/history');
    await expect(page.getByRole('heading', { name: 'CV Analysis History', level: 1 })).toBeVisible();

    const historyItemLink = page.locator(`a[href="${scoreResultPath}"]`).first();
    await expect(historyItemLink).toBeVisible();
    await historyItemLink.click();
    await expect(page).toHaveURL(scoreResultUrl);
    await expect(page.locator('#overall-score-heading')).toBeVisible();

    // 9. Test Translation Flow from Next Actions ("Translate this CV" prefill) or /ai
    const translateActionLink = page.getByRole('link', { name: 'Translate this CV' });
    await expect(translateActionLink).toBeVisible();
    await translateActionLink.click();

    await expect(page).toHaveURL(/\/ai\?cvId=.*&action=translate$/);
    await expect(page.locator('input[value="translate"]')).toBeChecked();

    const submitTranslateBtn = page.getByRole('button', { name: 'Dịch CV' });
    await expect(submitTranslateBtn).toBeEnabled();
    await submitTranslateBtn.click();

    // 10. Verify translation result at stable /ai/results/:id URL
    await expect(page).toHaveURL(/\/ai\/results\/[^/?#]+$/, { timeout: 45000 });
    await expect(page.getByRole('heading', { name: 'English translation', exact: true })).toBeVisible();
  });
});
