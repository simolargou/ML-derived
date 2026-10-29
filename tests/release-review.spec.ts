import { test, expect } from '@playwright/test';

test('a prerequisite opens its glossary entry after a different glossary filter', async ({
  page,
}) => {
  await page.goto('/?page=glossary');
  await page.getByRole('textbox', { name: 'Filter glossary' }).fill('mean');
  await page.locator('#term-mean').getByRole('button', { name: 'See it in a lesson' }).click();
  await page
    .locator('.prerequisites')
    .getByRole('button', { name: 'Derivative', exact: true })
    .click();
  await expect(page.locator('#term-derivative')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Filter glossary' })).toHaveValue('');
});

test('PCA identifies shared data by coordinates rather than point count', async ({ page }) => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 6 },
  ];
  const query = new URLSearchParams({ lesson: 'pca', experiment: JSON.stringify({ points }) });
  await page.goto('/?' + query);
  const cloud = page.getByRole('combobox', { name: 'Point cloud' });
  await expect(cloud).toHaveValue('custom');
  await expect(cloud.locator('option:checked')).toHaveText('Custom shared cloud');
  await page.getByRole('button', { name: 'Share experiment' }).click();
  expect(JSON.parse(new URL(page.url()).searchParams.get('experiment')!).points).toEqual(points);
  await cloud.selectOption('isotropic');
  await expect(cloud).toHaveValue('isotropic');
  await expect(
    page.getByText('Equal eigenvalues: a principal direction is non-unique.', { exact: false }),
  ).toBeVisible();
});

test('neural training keeps live announcements quiet until paused', async ({ page }) => {
  await page.goto('/?lesson=neural-network');
  await page.getByRole('button', { name: 'Train 1,000', exact: true }).click();
  const feedback = page.locator('#interactive-lab > .feedback');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(feedback).not.toHaveAttribute('role', 'status');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(feedback).toHaveAttribute('role', 'status');
  await expect(feedback).toContainText('Training paused.');
  const steps = await page.locator('.stats-row .stat').nth(1).locator('strong').innerText();
  await page.waitForTimeout(150);
  await expect(page.locator('.stats-row .stat').nth(1).locator('strong')).toHaveText(steps);
});
