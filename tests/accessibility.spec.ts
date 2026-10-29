import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function check(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  await test.info().attach(label, {
    body: JSON.stringify(result.violations, null, 2),
    contentType: 'application/json',
  });
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
    label,
  ).toEqual([]);
}
test('lessons, expanded calculations, resources, and search pass automated accessibility checks', async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    for (const id of [
      'linear-regression',
      'vectors',
      'gradient-descent',
      'logistic-regression',
      'pca',
      'k-means',
      'neural-network',
    ]) {
      await page.goto('/?lesson=' + id);
      await page
        .locator('details')
        .evaluateAll((elements) =>
          elements.forEach((element) => ((element as HTMLDetailsElement).open = true)),
        );
      await check(page, id + '-' + width);
    }
    for (const name of ['glossary', 'references']) {
      await page.goto('/?page=' + name);
      await check(page, name + '-' + width);
    }
    await page.goto('/');
    for (const name of ['Python', 'Practice']) {
      await page.getByRole('tab', { name }).click();
      if (name === 'Practice')
        await page.locator('.quiz fieldset').first().getByRole('button').first().click();
      await check(page, name + '-' + width);
    }
  }
  await page.getByRole('button', { name: 'Search lessons and symbols' }).click();
  await check(page, 'search-dialog');
});
