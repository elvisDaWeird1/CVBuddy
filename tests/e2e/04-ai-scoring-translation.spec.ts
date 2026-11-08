import { test, expect } from '@playwright/test';
import { registerTestApplicant, loginViaUi, createSamplePdf } from './fixtures';
import type { AiResultRecord } from '../../src/modules/ai/aiApi';

function createScoreResultRecord(
  id: string,
  cvDocumentId: string,
  payload: Record<string, unknown> | null,
): AiResultRecord {
  const industrySlug = typeof payload?.industrySlug === 'string' ? payload.industrySlug : 'ai_software';
  const verticalSlug = typeof payload?.verticalSlug === 'string' ? payload.verticalSlug : 'machine_learning';
  const targetRole = typeof payload?.targetRole === 'string' ? payload.targetRole : 'AI Engineer';

  return {
    id,
    accountId: 'e2e-applicant-account',
    cvDocumentId,
    aiType: 'CV_SCORING',
    status: 'COMPLETED',
    score: 78,
    industrySlug,
    verticalSlug,
    targetRole,
    createdAt: '2026-10-20T09:00:00.000Z',
    completedAt: '2026-10-20T09:00:02.000Z',
    result: {
      overall_score: 78,
      confidence: 0.91,
      company_model_feedback: 'Strong alignment with machine learning teams building production inference services.',
      disclaimer: 'AI feedback is advisory. Verify every suggested claim before submitting applications.',
      meta: {
        source: 'groq',
        model: 'llama-3.3-70b-versatile',
        language: 'en',
      },
      dimensions: {
        layout_ats: {
          score: 84,
          description: 'Clean single-column structure that ATS parsers can read reliably.',
          issues: [],
          fixes: ['Keep project dates aligned on the right margin'],
          gaps: [],
        },
        language: {
          score: 88,
          description: 'Clear action-oriented bullet points with concise technical phrasing.',
          issues: [],
          fixes: [],
          gaps: [],
        },
        keywords: {
          score: 68,
          description: 'Core Python stack is present, but deployment keywords are underrepresented.',
          issues: ['Missing inference serving and containerization keywords'],
          fixes: ['Mention FastAPI, Docker, and ONNX where used in projects'],
          missing: ['FastAPI', 'Docker', 'ONNX'],
          suggested_bullets: [
            'Deployed a FastAPI inference service in Docker handling 1,200 requests per minute.',
          ],
          gaps: [],
        },
        jd_fit: {
          score: 72,
          description: 'Good academic and project foundation for an AI Engineer role.',
          issues: [],
          fixes: ['Highlight model evaluation metrics and latency benchmarks'],
          gaps: ['Add production monitoring and evaluation benchmark details'],
        },
      },
      rewrites: [
        {
          section: 'projects',
          original: 'Trained a classification model in Python.',
          suggested: 'Trained and evaluated a PyTorch classification pipeline achieving [X]% F1-score.',
          reason: 'Add framework details and measurable evaluation metrics.',
          needs_user_fact: true,
        },
      ],
    },
  };
}

function createTranslationResultRecord(id: string, cvDocumentId: string): AiResultRecord {
  return {
    id,
    accountId: 'e2e-applicant-account',
    cvDocumentId,
    aiType: 'CV_TRANSLATION',
    status: 'COMPLETED',
    score: null,
    createdAt: '2026-10-20T09:05:00.000Z',
    completedAt: '2026-10-20T09:05:02.000Z',
    result: {
      translated_text: 'SUMMARY\nAI Engineer specializing in machine learning pipelines and model deployment.',
      sections: [
        {
          heading: 'Summary',
          content: 'AI Engineer specializing in machine learning pipelines and model deployment.',
        },
        {
          heading: 'Experience',
          content: 'Built and deployed computer vision and NLP models for production workloads.',
        },
      ],
      notes: ['Verify organization names and project metrics before exporting.'],
      meta: {
        source: 'groq',
        model: 'llama-3.3-70b-versatile',
        language: 'en',
      },
    },
  };
}

test.describe('AI CV Scoring & Translation E2E', () => {
  test('uploads CV, redirects /ai-chat to /ai, executes scoring & translation, and preserves stable result URLs on reload and history', async ({ page }) => {
    const savedResults = new Map<string, AiResultRecord>();
    const savedOrder: string[] = [];
    let scorePostCount = 0;
    let translatePostCount = 0;

    await page.route('**/api/ai/**', async (route) => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());
      const pathname = url.pathname;

      const scoreMatch = method === 'POST' ? /\/api\/ai\/cvs\/([^/]+)\/score$/.exec(pathname) : null;
      if (scoreMatch) {
        scorePostCount += 1;
        const cvId = decodeURIComponent(scoreMatch[1]);
        const body = request.postDataJSON() as Record<string, unknown> | null;
        const record = createScoreResultRecord(`e2e-score-result-${scorePostCount}`, cvId, body);
        savedResults.set(record.id, record);
        savedOrder.unshift(record.id);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'CV scored successfully.',
            data: { aiResult: record },
          }),
        });
        return;
      }

      const translateMatch = method === 'POST' ? /\/api\/ai\/cvs\/([^/]+)\/translate-to-english$/.exec(pathname) : null;
      if (translateMatch) {
        translatePostCount += 1;
        const cvId = decodeURIComponent(translateMatch[1]);
        const record = createTranslationResultRecord(`e2e-translation-result-${translatePostCount}`, cvId);
        savedResults.set(record.id, record);
        savedOrder.unshift(record.id);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'CV translated successfully.',
            data: { aiResult: record },
          }),
        });
        return;
      }

      const detailMatch = method === 'GET' ? /\/api\/ai\/results\/([^/]+)$/.exec(pathname) : null;
      if (detailMatch) {
        const resultId = decodeURIComponent(detailMatch[1]);
        const record = savedResults.get(resultId);
        if (!record) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: 'Saved AI result not found.',
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'AI result retrieved.',
            data: { aiResult: record },
          }),
        });
        return;
      }

      if (method === 'GET' && pathname.endsWith('/api/ai/results')) {
        const aiResults = savedOrder
          .map((id) => savedResults.get(id))
          .filter((item): item is AiResultRecord => Boolean(item));

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'AI results retrieved.',
            data: { aiResults },
          }),
        });
        return;
      }

      await route.continue();
    });

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
    await expect(page.getByRole('heading', { name: 'ai-test-cv', exact: true })).toBeVisible();

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

    await expect(page).toHaveURL(/\/ai\/results\/e2e-score-result-1$/);
    const scoreResultUrl = page.url();
    const scoreResultPath = new URL(scoreResultUrl).pathname;

    await expect(page.locator('#overall-score-heading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CV analysis', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fix-first priorities', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Strongest area: Language clarity', exact: true })).toBeVisible();
    expect(scorePostCount).toBe(1);

    // 7. Reload result URL and confirm no new AI mutation request is created
    await page.reload();
    await expect(page).toHaveURL(scoreResultUrl);
    await expect(page.locator('#overall-score-heading')).toBeVisible();
    expect(scorePostCount).toBe(1);
    expect(translatePostCount).toBe(0);

    // 8. Navigate to /ai/history and verify the history item opens the same stable result URL
    await page.goto('/ai/history');
    await expect(page.getByRole('heading', { name: 'CV Analysis History', level: 1 })).toBeVisible();

    const historyItemLink = page.locator(`a[href="${scoreResultPath}"]`).first();
    await expect(historyItemLink).toBeVisible();
    await historyItemLink.click();
    await expect(page).toHaveURL(scoreResultUrl);
    await expect(page.locator('#overall-score-heading')).toBeVisible();

    // 9. Select "Translate this CV" from Next Actions
    const translateActionLink = page.getByRole('link', { name: 'Translate this CV' });
    await expect(translateActionLink).toBeVisible();
    await translateActionLink.click();

    await expect(page).toHaveURL(/\/ai\?cvId=.*&action=translate$/);
    await expect(page.locator('input[value="translate"]')).toBeChecked();

    // 10. Submit Translation and verify stable /ai/results/:id URL and TranslationPanel content
    const submitTranslateBtn = page.getByRole('button', { name: 'Dịch CV' });
    await expect(submitTranslateBtn).toBeEnabled();
    await submitTranslateBtn.click();

    await expect(page).toHaveURL(/\/ai\/results\/e2e-translation-result-1$/);
    await expect(page.getByRole('heading', { name: 'English translation', exact: true })).toBeVisible();
    await expect(page.getByText('AI Engineer specializing in machine learning pipelines and model deployment.')).toBeVisible();
    expect(scorePostCount).toBe(1);
    expect(translatePostCount).toBe(1);
  });
});
