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
const headings = [
  'Vectors & dot products',
  'Linear regression',
  'Gradient descent',
  'Logistic regression',
  'Principal component analysis',
  'K-means clustering',
  'A tiny neural network',
];
test('every lesson has rendered mathematics, derivation, original code, and three questions', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (let i = 0; i < ids.length; i++) {
    await page.goto('/?lesson=' + ids[i]);
    await expect(page.getByRole('heading', { name: headings[i], exact: true })).toBeVisible();
    await expect(page.locator('.formula-card .katex:visible')).toBeVisible();
    await page.getByRole('tab', { name: 'Derivation' }).click();
    expect(await page.locator('.derivation>li').count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    await page.getByRole('tab', { name: 'Python' }).click();
    await expect(page.locator('pre code')).toContainText('if __name__');
    await expect(page.locator('.code-toolbar')).toContainText(ids[i] + '.py');
    await page.getByRole('tab', { name: 'Practice' }).click();
    await expect(page.locator('.quiz fieldset')).toHaveCount(3);
    for (const field of await page.locator('.quiz fieldset').all()) {
      for (const answer of await field.getByRole('button').all()) {
        await answer.click();
        await expect(field.locator('.answer-explanation')).toBeVisible();
      }
    }
  }
  expect(errors).toEqual([]);
});
test('regression supports accessible point editing and finite calculations', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('spinbutton', { name: 'New point x' }).fill('3');
  await page.getByRole('spinbutton', { name: 'New point y' }).fill('4');
  await page.getByRole('button', { name: 'Add point', exact: true }).click();
  await page.getByText('Inspect the data').click();
  await expect(page.getByRole('button', { name: 'Remove point 9', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove point 9', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove point 9', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Fit best line' }).click();
  await expect(page.locator('.stats-row .stat').first()).toContainText('0.203');
  await page.getByRole('checkbox', { name: 'Squared errors' }).uncheck();
  await page.getByText('Show the calculation', { exact: true }).click();
  await expect(page.locator('.calculation[open]')).toContainText('∂J/∂w');
});
test('gradient descent steps, runs, pauses, resets, and reports divergence', async ({ page }) => {
  await page.goto('/?lesson=gradient-descent');
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.locator('.lab-equation')).toContainText('iteration 1');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await page.locator('.lab-equation').innerText();
  await page.waitForTimeout(350);
  expect(await page.locator('.lab-equation').innerText()).toBe(paused);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.lab-equation')).toContainText('iteration 0');
  await page.getByRole('button', { name: 'Diverge', exact: true }).click();
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByText(/Divergence safety stop:/)).toBeVisible({ timeout: 12000 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
});
test('logistic threshold changes metrics without retraining', async ({ page }) => {
  await page.goto('/?lesson=logistic-regression');
  const loss = await page.locator('.lab-equation').last().innerText();
  await page.getByRole('slider', { name: 'Decision threshold · τ' }).fill('1');
  await expect(page.locator('.stats-row .stat').first()).toContainText('Undefined');
  expect(await page.locator('.lab-equation').last().innerText()).toBe(loss);
  await page.getByRole('button', { name: 'Train one step' }).click();
  expect(await page.locator('.lab-equation').last().innerText()).not.toBe(loss);
});
test('PCA rotates, reveals, standardizes, and explains a zero-variance cloud', async ({ page }) => {
  await page.goto('/?lesson=pca');
  await page.getByRole('slider', { name: 'Candidate axis angle' }).fill('45');
  await page.getByRole('button', { name: 'Reveal principal axes' }).click();
  await expect(page.locator('.pca-results')).toContainText('PC1 explained variance');
  await page.getByRole('button', { name: 'Use PC1' }).click();
  await expect(page.locator('.pca-results')).toContainText('Candidate excess error: 0.000');
  await page.getByRole('checkbox', { name: 'Standardize features' }).check();
  await page.getByRole('combobox', { name: 'Point cloud' }).selectOption('constant');
  await expect(
    page.getByText(/Equal eigenvalues: a principal direction is non-unique/),
  ).toBeVisible();
  await expect(page.locator('.pca-results')).toContainText('Undefined');
});
test('K-means alternates phases and compares actual initializations', async ({ page }) => {
  await page.goto('/?lesson=k-means');
  await page.getByRole('combobox', { name: 'Number of clusters' }).selectOption('2');
  await page.getByRole('button', { name: 'Assign points', exact: true }).click();
  const loss = Number(await page.locator('.stats-row .stat strong').first().textContent());
  await page.getByRole('button', { name: 'Update centroids', exact: true }).click();
  expect(
    Number(await page.locator('.stats-row .stat strong').first().textContent()),
  ).toBeLessThanOrEqual(loss);
  await page.getByRole('button', { name: 'Compare three deterministic initializations' }).click();
  await expect(
    page.getByRole('table', { name: 'Same data and k; each run bounded at 50 iterations' }),
  ).toBeVisible();
});
test('neural network exposes real values, local derivatives, and a bounded training session', async ({
  page,
}) => {
  await page.goto('/?lesson=neural-network');
  await page.getByText('Show the calculation', { exact: true }).click();
  await expect(page.locator('.calculation[open]')).toContainText('Local tanh derivatives');
  await expect(page.locator('.network')).toContainText('0.246');
  await page.getByRole('button', { name: 'One step', exact: true }).click();
  await expect(page.locator('.stats-row .stat').nth(1)).toContainText('1');
  await page.getByRole('button', { name: 'Train 1,000', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Train 1,000', exact: true })).toBeVisible({
    timeout: 12000,
  });
  expect(Number(await page.locator('.stats-row .stat strong').first().textContent())).toBeLessThan(
    0.05,
  );
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.stats-row .stat').nth(1)).toContainText('0');
});
test('completion persists only through the explicit action and can be reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.progress-block')).toContainText('0 / 7');
  await page.getByRole('button', { name: 'Mark as complete' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Lesson completed' })).toBeVisible();
  await expect(page.locator('.progress-block')).toContainText('1 / 7');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.reload();
  await expect(page.locator('.progress-block')).toContainText('0 / 7');
});
test('shared URLs recover parameters and show safe defaults for invalid input', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Test clipboard denied');
        },
      },
      configurable: true,
    }),
  );
  await page.goto('/?lesson=vectors');
  await page.getByRole('slider', { name: 'Feature · x₁' }).fill('3.5');
  await page.getByRole('button', { name: 'Share experiment' }).click();
  await expect(page.getByRole('textbox', { name: 'Shared experiment URL' })).toBeVisible();
  const shared = page.url();
  await page.goto(shared);
  await expect(page.getByRole('slider', { name: 'Feature · x₁' })).toHaveValue('3.5');
  await page.goto(
    '/?lesson=logistic-regression&experiment=' + encodeURIComponent('{"w":null,"threshold":9}'),
  );
  await expect(page.getByRole('status').last()).toContainText(
    'Some shared parameters were invalid',
  );
  await expect(page.getByRole('slider', { name: 'Decision threshold · τ' })).toHaveValue('0.5');
});
test('code downloads a Python file and reports clipboard or download failures', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Test clipboard denied');
        },
      },
      configurable: true,
    }),
  );
  await page.goto('/?lesson=pca');
  await page.getByRole('tab', { name: 'Python' }).click();
  await page.getByRole('button', { name: 'Copy code' }).click();
  await expect(page.locator('.code-block .feedback')).toContainText('Copy failed');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '.py', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('pca.py');
  expect(await download.failure()).toBeNull();
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error('Test download failure');
    };
  });
  await page.getByRole('button', { name: '.py', exact: true }).click();
  await expect(page.locator('.code-block .feedback')).toContainText('Download failed');
});
test('search connects symbols, concepts, and linked glossary explanations', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page
    .getByRole('textbox', { name: 'Search lessons, concepts, and symbols' })
    .fill('eigenvector');
  await page.getByRole('button', { name: /u, λ Eigenvector/ }).click();
  await expect(page.getByRole('heading', { name: 'Eigenvector', exact: true })).toBeVisible();
  await page
    .locator('#term-eigenvector')
    .getByRole('button', { name: 'See it in a lesson' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Principal component analysis', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sources & references' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sources & references', exact: true }),
  ).toBeVisible();
  expect(await page.locator('.reference a').count()).toBeGreaterThanOrEqual(6);
});
test('desktop and narrow mobile layouts have no horizontal document overflow', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    for (const id of ids) {
      await page.goto('/?lesson=' + id);
      await expect(page.locator('.experiment-column')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.getByRole('tab', { name: 'Derivation' }).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.getByRole('tab', { name: 'Understand' }).click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: 'test-results/' + id + '-' + width + '.png', fullPage: true });
      if (id === 'linear-regression' || id === 'neural-network' || id === 'gradient-descent')
        await page.screenshot({ path: 'test-results/' + id + '-' + width + '-viewport.png' });
    }
  }
});
test('mobile main controls are keyboard usable and curriculum navigation works', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('slider', { name: 'Slope · w' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('slider', { name: 'Slope · w' })).toHaveValue('0.9');
  await page.getByRole('button', { name: 'Open curriculum' }).click();
  await page.getByRole('button', { name: /03 Gradient descent/ }).click();
  await expect(page.getByRole('heading', { name: 'Gradient descent', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.locator('.lab-equation')).toContainText('iteration 1');
});

test('mobile controls remain operable across every algorithm', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?lesson=vectors');
  await expect(page.locator('.sidebar')).toHaveJSProperty('inert', true);
  await page.getByRole('button', { name: 'Try a zero vector' }).click();
  await expect(page.locator('.stats-row')).toContainText('Undefined');
  await page.getByRole('button', { name: 'Open curriculum' }).click();
  await expect(page.getByRole('button', { name: '01 Vectors & predictions' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open curriculum' })).toBeFocused();
  expect(
    await page.locator('.sidebar').evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe('0s');
  await page.goto('/?lesson=logistic-regression');
  await page.getByRole('slider', { name: 'Decision threshold · τ' }).fill('0.9');
  await page.getByRole('button', { name: 'Train one step' }).click();
  await expect(page.locator('.feedback').first()).toContainText('update 1 applied');
  await page.goto('/?lesson=pca');
  await page.getByRole('slider', { name: 'Candidate axis angle' }).fill('90');
  await page.getByRole('checkbox', { name: 'Standardize features' }).check();
  await page.getByRole('button', { name: 'Use PC1' }).click();
  await expect(page.locator('.pca-results')).toContainText('Candidate excess error: 0.000');
  await page.goto('/?lesson=k-means');
  await page.getByRole('button', { name: 'Assign points', exact: true }).click();
  await page.getByRole('button', { name: 'Update centroids', exact: true }).click();
  await expect(page.locator('.lab-equation')).toContainText('2 phases');
  await page.goto('/?lesson=neural-network');
  await page.getByRole('button', { name: 'One step', exact: true }).click();
  await expect(page.locator('.stats-row .stat').nth(1)).toContainText('1');
  await page.getByRole('tab', { name: 'Practice' }).click();
  await page.locator('.quiz fieldset').first().getByRole('button').nth(1).click();
  await expect(page.locator('.answer-explanation')).toContainText('Correct.');
});
test('keyboard tabs and named search dialog restore focus', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('tab', { name: 'Understand' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Derivation' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Derivation' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Find your next connection' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tab', { name: 'Derivation' })).toBeFocused();
});
test('duplicate stored lesson identifiers cannot inflate progress', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'ml-derived-progress-v1',
      JSON.stringify(['vectors', 'vectors', 'unknown', null]),
    ),
  );
  await page.goto('/');
  await expect(page.locator('.progress-block')).toContainText('1 / 7');
});
