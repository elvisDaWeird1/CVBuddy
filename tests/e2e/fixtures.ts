import { expect, type Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
  role: 'APPLICANT' | 'COMPANY' | 'ADMIN';
  token?: string;
}

export const API_BASE = 'http://localhost:5000/api';

/**
 * Register a fresh applicant account via API
 */
export async function registerTestApplicant(page: Page, overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const user: TestUser = {
    email: overrides.email || `applicant-${unique}@example.com`,
    password: overrides.password || 'ApplicantPass123!',
    fullName: overrides.fullName || `Applicant User ${unique}`,
    role: 'APPLICANT',
  };

  const response = await page.request.post(`${API_BASE}/auth/register/applicant`, {
    data: {
      email: user.email,
      password: user.password,
      fullName: user.fullName,
    },
  });

  expect(response.status()).toBe(201);
  return user;
}

/**
 * Register a fresh company account via API
 */
export async function registerTestCompany(page: Page, overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const user: TestUser = {
    email: overrides.email || `company-${unique}@example.com`,
    password: overrides.password || 'CompanyPass123!',
    companyName: overrides.companyName || `Acme Corp ${unique}`,
    role: 'COMPANY',
  };

  const response = await page.request.post(`${API_BASE}/auth/register/company`, {
    data: {
      email: user.email,
      password: user.password,
      companyName: user.companyName,
    },
  });

  expect(response.status()).toBe(201);
  return user;
}

/**
 * Login a user via the UI
 */
export async function loginViaUi(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  // Verify navigation to respective workspace
  if (user.role === 'APPLICANT') {
    await page.waitForURL('**/profile', { timeout: 10000 });
  } else if (user.role === 'ADMIN') {
    await page.waitForURL('**/admin', { timeout: 10000 });
  } else if (user.role === 'COMPANY') {
    await page.waitForURL('**/company', { timeout: 10000 });
  }
}

/**
 * Create a dummy PDF buffer for file upload testing
 */
export function createSamplePdf(): { name: string; mimeType: string; buffer: Buffer } {
  const stream = "BT /F1 12 Tf 72 720 Td (CVBuddy Playwright Test CV Document) Tj ET\n";
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    "4 0 obj\n<< /Length " + Buffer.byteLength(stream) + " >>\nstream\n" + stream + "endstream\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += "xref\n0 " + (objects.length + 1) + "\n";
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += String(offsets[index]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\n";
  pdf += "startxref\n" + xrefOffset + "\n%%EOF\n";

  return {
    name: 'test-sample.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(pdf),
  };
}

/**
 * Minimal 1x1 PNG image buffer
 */
export function createSampleImage(): { name: string; mimeType: string; buffer: Buffer } {
  return {
    name: 'sample-image.png',
    mimeType: 'image/png',
    buffer: Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]),
  };
}
