import { test, expect } from '@playwright/test';
const ids = [
  'vectors',
  'linear-regression',
  'gradient-descent',
  'logistic-regression',
  'pca',
  'k-means',
  'neural-network',
];
test('mathematical scenery is correct, static, and outside the interaction tree', async ({
  page,
}) => {
  await page.goto('/?lesson=linear-regression');
  const scenery = page.locator('.mathematical-backdrop');
  await expect(scenery).toHaveAttribute('aria-hidden', 'true');
  await expect(scenery).toHaveJSProperty('inert', true);
  expect(await scenery.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
  await expect(scenery.locator('button,input,a,[tabindex]')).toHaveCount(0);
  const before = await scenery.innerHTML();
  const prediction = await page.locator('.lab-equation').innerText();
  await page.getByRole('slider', { name: 'Slope · w' }).fill('1.5');
  const action = page.getByRole('button', { name: 'Fit best line' });
  await action.hover();
  await page.waitForTimeout(180);
  const contrast = await action.evaluate((e) => {
    const c = getComputedStyle(e);
    const luminance = (color: string) => {
      const rgb = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((v) => v / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const a = luminance(c.color),
      b = luminance(c.backgroundColor);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator('.lab-equation').innerText()).not.toBe(prediction);
  expect(await scenery.innerHTML()).toBe(before);
  await page.getByRole('button', { name: '03 Gradient descent' }).click();
  await expect(scenery).toHaveAttribute('data-motif', 'gradient-descent');
  await expect(scenery.locator('ellipse')).toHaveCount(4);
  await expect(page.locator('.katex-error')).toHaveCount(0);
});
test('scientific figures and lesson sections reflow at wide, tablet, and compact widths', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [1920, 1024, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const id of ids) {
      await page.goto('/?lesson=' + id);
      await expect(page.locator('.experiment-column')).toBeVisible();
      if (width === 320)
        await page
          .locator('details')
          .evaluateAll((es) => es.forEach((e) => ((e as HTMLDetailsElement).open = true)));
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        id + ' at ' + width,
      ).toBe(true);
      await page.screenshot({ path: 'test-results/scientific-ui/' + id + '-' + width + '.png' });
      if (width === 768 || width === 320) {
        await page.getByRole('tab', { name: 'Derivation' }).click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        ).toBe(true);
        await page.screenshot({
          path: 'test-results/scientific-ui/' + id + '-' + width + '-derivation.png',
        });
        await page.getByRole('tab', { name: 'Python' }).click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        ).toBe(true);
        await page.getByRole('tab', { name: 'Practice' }).click();
        await page.locator('.quiz fieldset').first().getByRole('button').first().click();
        await expect(page.locator('.answer-explanation')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        ).toBe(true);
      }
    }
  }
});
test('two-hundred-percent enlargement keeps controls and internal scrolling usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lesson=linear-regression');
  await page.evaluate(() => (document.documentElement.style.zoom = '2'));
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  await page.getByRole('slider', { name: 'Slope · w' }).fill('1.3');

  await expect(page.getByRole('slider', { name: 'Slope · w' })).toHaveValue('1.3');
  await page.getByRole('tab', { name: 'Derivation' }).click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  await page.screenshot({ path: 'test-results/scientific-ui/regression-200-percent.png' });
});
