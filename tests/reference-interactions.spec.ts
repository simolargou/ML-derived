import { test, expect } from '@playwright/test';

test('reference composition keeps a larger landscape beside the update rule', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lesson=gradient-descent');
  const sidebar = await page.locator('.sidebar').boundingBox();
  const header = await page.locator('.topbar').boundingBox();
  const reading = await page.locator('.reading-column').boundingBox();
  const lab = await page.locator('.experiment-column').boundingBox();
  const tabs = await page.getByRole('tablist').boundingBox();
  expect(sidebar!.width).toBe(240);
  expect(header!.x).toBe(0);
  expect(header!.height).toBe(64);
  expect(lab!.width).toBeGreaterThan(reading!.width);
  expect(Math.abs(lab!.y - reading!.y)).toBeLessThan(2);
  expect(tabs!.y + tabs!.height).toBeLessThanOrEqual(reading!.y);
  const formula = await page.locator('.update-rule').innerHTML();
  await page.getByRole('slider', { name: 'Learning rate · α' }).focus();
  await expect(page.locator('.update-rule')).not.toHaveJSProperty('innerHTML', formula);
  await page.getByRole('button', { name: /Learning rate/ }).click();
  await expect(page.locator('.term-explanation')).toContainText('overshoot');
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.locator('.lab-equation')).toContainText('iteration 1');
  for (let index = 0; index < 8; index++)
    await page.getByRole('button', { name: 'Step', exact: true }).click();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: 'disabled',
      path: 'test-results/reference/gradient-' + width + '.png',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    if (width === 390) {
      const parameters = await page.locator('.lab-equation').innerText();
      await page.getByRole('link', { name: 'Explore the lab' }).click();
      await expect(page.locator('.lab-equation')).toHaveText(parameters, { useInnerText: true });
      await page.screenshot({
        animations: 'disabled',
        path: 'test-results/reference/gradient-390-lab.png',
      });
    }
  }
});

test('vector endpoints drag and offer equivalent keyboard controls', async ({ page }) => {
  await page.goto('/?lesson=vectors');
  await page.getByRole('slider', { name: 'Feature · x₁' }).fill('3');
  await page.getByRole('slider', { name: 'Weight · w₁' }).fill('-2');
  await page.getByRole('slider', { name: 'Weight · w₂' }).fill('2');
  const handle = page.getByRole('button', { name: /^Move feature vector:/ });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const svg = await page.locator('.plot').boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(svg!.x + (299 / 420) * svg!.width, svg!.y + (98 / 286) * svg!.height, {
    steps: 6,
  });
  await page.mouse.up();
  expect(Number(await page.getByRole('slider', { name: 'Feature · x₁' }).inputValue())).toBeCloseTo(
    4,
    1,
  );
  expect(Number(await page.getByRole('slider', { name: 'Feature · x₂' }).inputValue())).toBeCloseTo(
    2,
    1,
  );
  await handle.focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('slider', { name: 'Feature · x₁' })).toHaveValue('0');
  await expect(page.locator('.stats-row .stat').nth(1)).toContainText('Undefined');
  expect(
    await handle
      .locator(':scope > :last-child')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth)),
  ).toBeGreaterThanOrEqual(3);

  const symbol = page.locator('.symbol-trigger').first();
  await symbol.click();
  await expect(page.getByRole('dialog', { name: 'Read the symbol' })).toContainText(
    'Feature column vector',
  );
  await page.keyboard.press('Escape');
  await expect(symbol).toBeFocused();
});

test('regression challenge uses the example MSE and resets all display state', async ({ page }) => {
  await page.goto('/?lesson=linear-regression');
  await page.locator('.challenge > summary').click();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Slope · w' })).toHaveValue('0');
  await expect(page.locator('.challenge')).toHaveAttribute('data-complete', 'false');
  await page.getByRole('button', { name: 'Fit best line' }).click();
  await expect(page.locator('.challenge')).toHaveAttribute('data-complete', 'true');
  await expect(page.locator('.challenge [role="status"]')).toContainText('Target reached');
  await page.getByRole('button', { name: 'Restart challenge' }).click();
  await expect(page.locator('.challenge')).toHaveAttribute('data-complete', 'false');
  await page.getByRole('spinbutton', { name: 'New point x' }).fill('0');
  await page.getByRole('spinbutton', { name: 'New point y' }).fill('0');
  await page.getByRole('button', { name: 'Add point', exact: true }).click();
  await page.getByRole('button', { name: 'Fit best line' }).click();
  await expect(page.locator('.challenge')).toHaveAttribute('data-complete', 'false');
  await expect(page.locator('.challenge-result')).toContainText('dataset changed');
  await page.getByRole('checkbox', { name: 'Squared errors' }).uncheck();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Squared errors' })).toBeChecked();
  await expect(page.getByRole('slider', { name: 'Slope · w' })).toHaveValue('0.8');
  await expect(page.locator('.challenge')).toHaveAttribute('data-complete', 'false');
});

test('section history preserves the live model and a restored URL starts a fresh path', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lesson=gradient-descent');
  await page.getByRole('link', { name: 'Explore the lab' }).click();
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  const model = await page.locator('.lab-equation').innerText();
  await page.goBack();
  await expect(page.locator('.lab-equation')).toHaveText(model, { useInnerText: true });
  await page.getByRole('link', { name: 'Explore the lab' }).click();
  await page.getByRole('button', { name: 'Share experiment' }).click();
  await page.goBack();
  await expect(page.locator('.lab-equation')).toContainText('iteration 0');
  await expect(page.locator('.stats-row .stat').first()).toContainText('0');
  await expect(page.locator('.trace')).toContainText('0 steps');
});
