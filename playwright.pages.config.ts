import { defineConfig } from '@playwright/test';
import config from './playwright.config';

const basePath = process.env.STATIC_BASE_PATH || '/publication-check/';
// This value becomes a CLI argument, so only accept simple static path segments.
if (!/^\/(?:[a-z0-9_.~-]+\/)*$/i.test(basePath)) {
  throw new Error('STATIC_BASE_PATH must be / or slash-terminated static path segments.');
}
const baseURL = 'http://127.0.0.1:4174' + basePath;

export default defineConfig({
  ...config,
  testMatch: '**/static-hosting.spec.ts',
  testIgnore: [],
  use: { ...config.use, baseURL },
  webServer: {
    command: 'npm run preview -- --outDir dist-pages --port 4174 --strictPort --base=' + basePath,
    url: baseURL,
    reuseExistingServer: false,
  },
});
