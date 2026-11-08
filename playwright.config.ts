import { defineConfig, devices } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const E2E_MONGO_TMP_DIR = path.join(os.tmpdir(), 'cvbuddy-e2e-mongo');
const BACKEND_DIR = process.env.CVBUDDY_BACKEND_DIR
  ? path.resolve(process.env.CVBUDDY_BACKEND_DIR)
  : path.resolve(__dirname, '../backend');

if (!process.env.TEST_WORKER_INDEX) {
  process.on('exit', () => {
    try {
      fs.rmSync(E2E_MONGO_TMP_DIR, {
        recursive: true,
        force: true,
      });
    } catch {
      try {
        const cleanupChild = spawn(
          process.execPath,
          [
            '-e',
            `const fs=require('fs'),p=${JSON.stringify(E2E_MONGO_TMP_DIR)};setTimeout(()=>{try{fs.rmSync(p,{recursive:true,force:true,maxRetries:10,retryDelay:150})}catch{}},250);`,
          ],
          { detached: true, stdio: 'ignore', windowsHide: true }
        );
        cleanupChild.unref();
      } catch {
        // Best-effort cleanup after webServer teardown
      }
    }
  });
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node scripts/start-e2e-mongo.js',
      cwd: BACKEND_DIR,
      port: 27017,
      reuseExistingServer: false,
    },
    {
      command: 'node scripts/start-e2e-mongo.js --wait-and-run-server',
      cwd: BACKEND_DIR,
      port: 5000,
      reuseExistingServer: false,
      env: {
        MONGO_URI: 'mongodb://127.0.0.1:27017/cvbuddy_playwright_test',
        PORT: '5000',
        NODE_ENV: 'test',
        JWT_SECRET: 'playwright-test-jwt-secret-at-least-32-chars-length',
        JWT_EXPIRES_IN: '7d',
        BCRYPT_SALT_ROUNDS: '4',
        CORS_ORIGIN: 'http://localhost:5173',
        CLIENT_URL: 'http://localhost:5173',
        GOOGLE_CLIENT_ID: 'e2e-google-client-id.apps.googleusercontent.com',
        UPLOAD_DIR: 'uploads',
      },
    },
    {
      command: 'npx vite --port 5173',
      cwd: path.resolve(__dirname, '.'),
      port: 5173,
      reuseExistingServer: false,
      env: {
        VITE_API_URL: 'http://localhost:5000/api',
      },
    },
  ],
});
