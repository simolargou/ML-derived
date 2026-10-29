# Static hosting

ML, Derived builds to `dist/`. It requires static file hosting with HTTPS and JavaScript enabled. There is no server process, environment configuration, or API service.

Lesson and resource routes use query parameters, such as `?lesson=pca` and `?page=glossary`. Refreshing these links requests the same index document, so GitHub Pages does not need a single-page-app fallback or a custom 404 page.

## Local production preview

```sh
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. Vite preview is for local verification, not a production web server.

## Base paths

The default build serves from `/`. For a site hosted below a repository or another path, pass that path to Vite:

```sh
npm run build -- --base=/your-repository/
npm run preview -- --base=/your-repository/
```

Replace `your-repository` with the actual path. Include the leading and trailing slashes, then open **http://127.0.0.1:4173/your-repository/**. The build rewrites scripts, styles, favicon, and mathematical font URLs for that prefix. Downloads are created from bundled Python source and need no separate file server. The project license is copied from `public/LICENSE` to `dist/LICENSE`. Bundled dependency notices are included as `third-party-licenses.md` in each build.

`npm run test:pages` builds to `dist-pages/` with a fixed test prefix and checks asset requests, all lesson links, resource links, refresh, sharing, and a Python download. It leaves the normal `dist/` build alone.

## GitHub Pages

The [Pages workflow](../.github/workflows/pages.yml) runs **only through manual dispatch**. Pushing code runs CI but does not deploy.

1. Review the files to publish, including the [MIT License](../LICENSE) and third-party notices. Initialize Git if needed and review the first commit before pushing.
2. After creating and pushing to your chosen GitHub repository, confirm that the **Checks** workflow passes.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
4. Review the `github-pages` environment's branch restrictions and, if desired, add a required reviewer.
5. When deployment is authorized, open **Actions → Deploy Pages → Run workflow** on the reviewed default branch.

The workflow reads the base path from GitHub Pages metadata, so it does not assume a repository name or domain. It installs locked dependencies, checks formatting, types, numerical calculations, Python examples, and advisories, then checks Chromium workflows against the build that will be uploaded. A separate deployment job receives Pages and identity-token write permissions. No personal access token or repository secret is required.

Only dispatch the workflow for code you intend to publish. Once run, the deployment job publishes its artifact. Changing the Pages URL or adding a custom domain requires a new build so asset paths match the new location.

## Cloudflare Pages

For a site served at the domain root, the normal `npm run build` output is sufficient. Upload the entire `dist` folder through a Pages Direct Upload project in Workers & Pages. Its `index.html` must become the site's root document, with `assets`, `LICENSE`, and `third-party-licenses.md` alongside it. No Worker script, database, secrets, or Python runtime is needed.

With Git integration instead, use Node 24, build command `npm run build`, and output directory `dist`. `npm ci` installs the locked dependencies locally; the Cloudflare build environment also needs access to the npm registry. Choose the project name and domain in your own account. Neither is hardcoded here.

A Workers Static Assets project is a separate hosting option. Set `assets.directory` to `./dist`. This application uses query-string lesson routes, so its documented links request `index.html` directly. If you later introduce path-based routes, configure `assets.not_found_handling` as `single-page-application`.

Follow [Cloudflare's Direct Upload instructions](https://developers.cloudflare.com/pages/get-started/direct-upload/) or its [Workers SPA configuration](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/). No Cloudflare deployment has been run as part of local verification.

Progress belongs to the browser and origin. Records saved on localhost do not automatically appear on a deployed domain. Shared URLs transfer experiment parameters, not completion history.

## After the first deployment

Open the URL reported by the deployment job. Check a direct lesson link and refresh, equations and fonts, experiment controls, saved progress, a shared URL, and a Python download at desktop and mobile widths. A local subpath test does not verify GitHub's account settings, environment rules, HTTPS provisioning, or the hosted workflow.

For another static host, upload the contents of `dist/` and use a build base matching the public path. Do not upload dependency folders, source-review notes, test reports, or local environments.

## Hosting references

See [Vite's static deployment guide](https://vite.dev/guide/static-deploy) and [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
