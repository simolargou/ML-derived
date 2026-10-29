import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = new URL(process.argv[2] || 'http://127.0.0.1:5173/');
  await mkdir('docs/images', { recursive: true });
  await mkdir('test-results/reference', { recursive: true });
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(new URL('?lesson=gradient-descent', base).href);
    await page.locator('.gradient-experiment .plot').waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (let i = 0; i < 9; i++)
      await page.getByRole('button', { name: 'Step', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: 'disabled',
      path: 'test-results/reference/gradient-' + width + '.png',
    });
    if (width === 1440)
      await page.screenshot({ animations: 'disabled', path: 'docs/images/workspace.png' });
    if (width === 390) {
      await page.getByRole('link', { name: 'Explore the lab' }).click();
      await page.screenshot({
        animations: 'disabled',
        path: 'test-results/reference/gradient-390-lab.png',
      });
    }
  }
  console.log('Captured the actual gradient lesson at 1440, 1024, and 390 px after nine steps.');
} finally {
  await browser.close();
}
