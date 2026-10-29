import { test, expect } from '@playwright/test';
test('regression vertical slice renders and responds', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Linear regression', exact: true })).toBeVisible();
  const slope = page.getByRole('slider', { name: 'Slope · w' });
  await slope.fill('1.5');
  await expect(slope).toHaveValue('1.5');
  await page.getByRole('button', { name: 'Fit best line' }).click();
  await page.getByRole('tab', { name: 'Practice' }).click();
  await page.getByRole('button', { name: 'A −3' }).click();
  await expect(
    page.getByText('Correct. Our convention is prediction minus target: 5 − 8 = −3.'),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Understand' }).click();
  await page.screenshot({ path: 'test-results/regression-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});
