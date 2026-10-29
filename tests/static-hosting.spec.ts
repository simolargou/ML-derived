import { test, expect } from '@playwright/test';

test('static hosting serves bundled assets and preserves lesson and resource paths', async ({
  page,
  request,
  baseURL,
}) => {
  const base = new URL(baseURL!);
  const failed: string[] = [];
  const fonts = new Set<string>();
  page.on('pageerror', (error) => failed.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin !== base.origin) return;
    if (response.status() >= 400) failed.push(url.pathname + ': ' + response.status());
    if (/\.(js|css|woff2?|svg)$/.test(url.pathname)) {
      if (!url.pathname.startsWith(base.pathname))
        failed.push('Asset outside base: ' + url.pathname);
      if (/\.woff2?$/.test(url.pathname)) fonts.add(url.pathname);
    }
  });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.formula-card .katex')).toBeVisible();
  await expect(page.locator('.katex-error')).toHaveCount(0);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(new URL(favicon!, base).pathname).toBe(base.pathname + 'favicon.svg');
  expect((await request.get(new URL(favicon!, base).href)).status()).toBe(200);
  expect(fonts.size).toBeGreaterThan(0);
  const notices = await request.get(new URL('third-party-licenses.md', base).href);
  expect(notices.status()).toBe(200);
  expect(await notices.text()).toContain('MIT License');
  await page.screenshot({ path: 'test-results/static-desktop.png', fullPage: true });

  const headings = [
    'Vectors & dot products',
    'Linear regression',
    'Gradient descent',
    'Logistic regression',
    'Principal component analysis',
    'K-means clustering',
    'A tiny neural network',
  ];
  for (let index = 0; index < headings.length; index++) {
    await page.locator('.sidebar nav button').nth(index).click();
    await expect(page.getByRole('heading', { name: headings[index], exact: true })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(base.pathname);
    await page.reload();
    await expect(page.getByRole('heading', { name: headings[index], exact: true })).toBeVisible();
  }
  for (const [control, heading] of [
    ['Mathematical glossary', 'A small mathematical glossary'],
    ['Sources & references', 'Sources & references'],
  ]) {
    await page.getByRole('button', { name: control, exact: true }).click();
    expect(new URL(page.url()).pathname).toBe(base.pathname);
    await page.reload();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(failed).toEqual([]);
});

test('a static subpath supports sharing, downloads, and mobile experiments', async ({
  page,
  baseURL,
}) => {
  await page.goto('./?lesson=linear-regression');
  const slope = page.getByRole('slider', { name: 'Slope · w' });
  await slope.fill('1.5');
  await page.getByRole('button', { name: 'Share experiment' }).click();
  const shared = page.url();
  expect(new URL(shared).pathname).toBe(new URL(baseURL!).pathname);
  expect(new URL(shared).searchParams.has('experiment')).toBe(true);
  await page.goto(shared);
  await expect(slope).toHaveValue('1.5');
  await page.getByRole('tab', { name: 'Python' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '.py', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('linear-regression.py');
  expect(await download.failure()).toBeNull();
  const stream = await download.createReadStream();
  let code = '';
  for await (const chunk of stream) code += chunk.toString();
  expect(code).toContain('def loss_and_gradient');
  expect(code).toContain('if __name__');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(shared);
  await expect(slope).toHaveValue('1.5');
  const previous = await page.locator('.stats-row .stat').first().innerText();
  await slope.fill('2');
  await expect(page.locator('.stats-row .stat').first()).not.toHaveText(previous);
  await expect(page.locator('.skip-link')).not.toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.stats-row')).toContainText('Mean squared error');
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
  await page.screenshot({ path: 'test-results/static-mobile.png', fullPage: true });
});
