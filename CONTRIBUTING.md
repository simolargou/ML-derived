# Contributing

Keep explanations, numerical behavior, and visible values in agreement. A useful change should help a learner trace one mathematical operation through the notation, calculation, plot, and code.

## Before changing behavior

Read the existing lesson and [mathematical conventions](docs/MATHEMATICS.md). Keep the notebook layout, midnight surfaces, ivory text, teal model outputs, and amber errors. The shared tokens and visual checks are described in [the design guide](docs/DESIGN.md). Use line styles, shapes, labels, or tables as well as color.

Keep the numerical engine independent of React. Do not add a backend, account requirement, paid service, or tracking to an introductory experiment.

## Mathematical changes

- Define dimensions and every symbol before using them.
- Keep loss normalization and residual signs consistent.
- Test gradients against central finite differences or another independent result.
- Add tests for the degenerate case affected by the change.
- Use full precision internally and round only for display.
- Update the downloadable Python companion when the algorithm changes.
- Cite primary educational materials or official library documentation, and write original explanations.

Avoid tests that simply recreate the implementation. Prefer known solutions, geometric identities, monotonicity properties, and finite-difference checks.

## Interface changes

Check desktop and narrow screens, keyboard access, focus, labels, and reduced motion. Run the browser workflows and inspect the actual page. A screenshot in the README should show the real application without browser chrome, personal data, or invented results.

Keep experiment parameters authoritative. Drag handles and keyboard controls must update the same state as the sliders. Optional challenges must evaluate engine outputs and identify the dataset they use. Section links should preserve the live model; restoring URL parameters should start matching transient history.

Keep each lesson's experiment guidance specific: name a control to try and a computed result to compare. Identify preset datasets by their contents, not by their size.

Each question needs feedback for every option. Progress changes only through the completion or reset control. Invalid URL state should produce safe defaults and clear feedback.

## Checks

```sh
npm ci
npx playwright install chromium
npm run format:check
npm run typecheck
npm test
python -I -S scripts/check_python.py
npm run test:e2e:production
```

Run `npm run format` if formatting needs updating. There is no separate ESLint configuration; TypeScript checks unused imports and variables, and Prettier checks formatting.

Keep the lockfile with dependency changes. Review `npm audit` findings before choosing a compatible fix. Never add credentials, local environments, generated builds, or browser artifacts to a commit.

A change description should say what behavior changed, why, and which checks actually ran. Distinguish local checks from CI runs and note any untested browser or device behavior.

## Publication files

Review tracked, untracked, and ignored files separately before a release:

```sh
git status --short
git ls-files
git ls-files --others --exclude-standard
git status --short --ignored
```

Keep the lockfile, source, Python companions, tests, configuration, public assets, documentation screenshot, workflows, and notices. Dependencies, build output, caches, test artifacts, local review folders, environment files, and the local design input are excluded by .gitignore. The design input stays on disk; docs/images/workspace.png is the screenshot used by the README.

Ignore rules do not remove already tracked files. Inspect the actual index and staged diff before publishing. Use a separate directory and npm ci to check the intended source contents without relying on existing dependencies or generated output.

## License

The project owner has not selected a project license. Do not invent a copyright holder or remove third-party notices.
