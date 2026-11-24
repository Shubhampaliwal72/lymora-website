# Manual hosting and website activation

This is a standalone static Next.js website. No deployment, DNS, nameserver, GitHub push, or account setting is performed by the build.

## Build and upload

Run from D:\my-projects\lymora:

    npm.cmd ci
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run build
    npm.cmd run verify:export

Upload the CONTENTS of out/ to static hosting only if you do not need organization license requests or activation. Those APIs require Cloudflare Pages Functions and D1, which are not included in a static-only upload. For Cloudflare Pages with licenses enabled, use a Pages Git build that packages the root `functions/` directory alongside `out/`. Keep the existing postbuild step; it normalizes Windows-exported navigation filenames. Public pages remain static and require no Next.js server. Run npm ci only when dependencies need installation.

## Cloudflare Pages Git settings

Use **Workers & Pages > Create application > Pages > Import an existing Git repository**. Choose `Shubhampaliwal72/lymora-website`. The Pages option may appear under a separate "Get started" link in the application creation screen.

| Setting | Value |
| --- | --- |
| Product | Cloudflare Pages |
| Framework preset | Next.js (Static HTML Export) |
| Production branch | `main` |
| Root directory | Repository root (leave blank) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node.js | 22, selected by `.node-version` |
| Additional environment variables | None required for the static build |

Pages publishes the build output itself; there is no separate `wrangler deploy` command. Production exports now include public search metadata by default. Set `LYMORA_PUBLIC_LAUNCH=false` only for an intentionally non-indexable build. After creating a D1 database, add the `LICENSE_DB` binding and `LICENSE_SIGNING_PRIVATE_KEY` and `LICENSE_ADMIN_TOKEN` secrets to Production and Preview, then redeploy. Review the deployment before starting it; this guide does not authorize a deployment or domain change.

## Troubleshooting: build succeeds, Workers deployment fails

The 7 November 2026 log shows a successful Next.js build and static page export, followed by `npx wrangler deploy`. Wrangler detected Next.js and ran an OpenNext migration inside the Cloudflare build environment. That server adapter then failed looking for `.next/standalone/.next/server/pages-manifest.json`.

This project intentionally uses `output: "export"`. Its deployable website is `out/`, so a standalone server manifest is not expected. The failure is a **Workers deployment configuration mismatch**, not a TypeScript, animation, or static export error. The adapter's generated files in that CI checkout are not changes in this repository.

To use the intended Pages hosting, create/select a **Pages** project with the settings above. If the screen asks for a **Deploy command** such as `npx wrangler deploy`, it is the Workers workflow. Leave the existing Worker and its DNS records unchanged while preparing the Pages project; do not start another deployment or attach the production domain until approved. A push to a connected production branch can trigger a deployment automatically.

Do not change this project to `output: "standalone"`, add OpenNext, or create a fake manifest to satisfy that erroneous deployment step. Do not use `.next` as the Pages output directory. ESLint deprecation and missing build-cache warnings are separate from this failure.

Official reference: [Deploy a static Next.js site on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).

## Public search visibility

The public website uses https://lymora.in as its canonical origin. A normal `npm run build` (manual export or Cloudflare `main`) generates indexable pages, an allow-all robots.txt and eight sitemap URLs. No launch flag is required. The former opt-in default generated an empty sitemap, `Disallow: /` and noindex page metadata when the flag was absent.

`next dev` and named Cloudflare preview branches other than `main` remain noindex. An explicit `LYMORA_PUBLIC_LAUNCH=true` does not override preview protection. For an intentionally non-indexable manual/staging export, use the following environment for both build and verification:

    $env:LYMORA_PUBLIC_LAUNCH = 'false'
    npm.cmd run build
    npm.cmd run verify:export
    Remove-Item Env:LYMORA_PUBLIC_LAUNCH

Build and verification must use matching environment values. Removing a variable does not alter an already-generated or uploaded artifact. Preview uploads without a named branch must explicitly opt out. Noindex is not access control. The indexing policy is shared in src/lib/indexing.mjs and covered by regression tests in verify:export.

The sitemap contains /, /downloads/, /license/, /products/, /products/lan-messenger/, /products/lan-messenger/docs/, /about/ and /privacy/. The legacy release-notes handoff is explicitly noindex, points its canonical at /downloads/ and stays out of the sitemap. Error pages also remain excluded. All eight public pages have their own canonical, title and description.

After reviewing and deploying the new out/ through your existing hosting workflow, open https://lymora.in/sitemap.xml and confirm seven real loc URLs, then open https://lymora.in/robots.txt and confirm Allow: / plus Sitemap: https://lymora.in/sitemap.xml. Check the public pages for index, follow and the canonical origin. If an existing production environment sets LYMORA_PUBLIC_LAUNCH=false, remove that opt-out before rebuilding. Runtime environment changes alone cannot update these static files. Submit the sitemap in Google Search Console if you use it; search indexing is not immediate. No commit, push, deployment or hosting setting change is performed by these checks.

Canonical address: https://lymora.in . Connect your domain and www, check certificates, and configure www -> apex plus HTTP -> HTTPS redirects through your hosting dashboard when ready. DNS and certificate setup are managed separately from this repository; no hard-coded guessed hosting target is published.

## Downloads, support and releases

Release metadata is in src/lib/releases/windows.json, referenced by src/lib/public-links.ts. Update only after verification and owner approval, then rebuild:

- Windows 1.0.1 build 014 remains archived on GitHub Releases, but the Downloads page temporarily shows Coming soon while the next verified release/update flow is prepared. Its previous metadata remains in the central manifest as the version baseline; `available: false` hides all old download and release links. See WINDOWS_RELEASE.md.
- Windows is the only supported platform presented. Owner-approved macOS/Linux Coming soon information appears only on Downloads, without release dates or download controls. A verified release-sync sets `available: true` to restore the Windows download state.
- /downloads/ centralizes installer links, compatibility, version, checksum and release notes. Other pages use internal navigation CTAs. The older releases route keeps a working handoff and a Downloads canonical; it is excluded from the sitemap.
- A future approved release must update its build/version/date, Windows requirement, architecture, file size, checksum, actual changes/known issues and verified GitHub Releases URLs.
- support.email and support.issuesUrl remain null until their mailbox or tracker is configured and verified. The internal troubleshooting guide works now.
- Do not place Windows installers in public/. Plan distribution through approved GitHub Releases, independently of website deployment.

## License Pages Functions

The static export remains the site content, but organization requests and activation use Cloudflare Pages Functions from the repository-root `functions/` directory. A static direct upload of `out/` alone cannot include these API routes. Use the existing Cloudflare Pages Git project or another Pages build workflow that packages the root Functions directory with `out/`; keep the Next.js command and output directory unchanged.

Before enabling the flow, create a D1 database, bind it as `LICENSE_DB` for Production and Preview, apply `migrations/0001_organization_licenses.sql`, and set `LICENSE_SIGNING_PRIVATE_KEY` and `LICENSE_ADMIN_TOKEN` as Pages secrets. Generate the signing pair with `node scripts/setup-license-keys.mjs`; the public key is already configured for the desktop build, while the private PEM is stored under the ignored `functions/.secrets/` directory and must be added as a Cloudflare secret. Protect a backup of that private key. Never commit it. Admin request review and manual code issuance are in `scripts/license-admin.mjs`; no payment gateway is connected. See `docs/organization-licenses.md` for the request/activation details and limitations.

Pages Functions require a real D1 binding and secrets before `/api/license/*` can succeed. The activation UI fails with a clear service error while those are absent. The public request page is `/license/` and its static route is included in the sitemap.

The site origin/SEO defaults are in src/lib/site.ts. Screenshot inspection, current navigation and the new hero do not depend on any hosting account.

## What was kept and removed

Kept useful website work: Coming Soon/support/release components and one configuration file; screenshot enlargement; active navigation; canonical/share metadata, original-logo sharing PNG, robots/sitemap and static security/cache headers; export and browser checks.

Removed the unused production-redirect example and replaced the earlier account/DNS migration report with these manual instructions. No DNS-management script or Cloudflare CLI is installed. The Electron/Go project is untouched.

## Checks before uploading

- Pass lint, typecheck, build, verify:export and verify:launch.
- Inspect desktop/mobile in both themes, original screenshots, hero routes, keyboard controls, the centralized Windows download and generic Downloads navigation.
- Check public support/release configuration before activation; no placeholder links or demo email addresses.
- After upload: directly open nested pages, test the 404 page, verify HTTPS/canonical redirects, headers and actual production indexing.
- public/_headers is consumed by Cloudflare Pages. Another hosting provider may require equivalent dashboard/header configuration. The policy permits Next's inline scripts/styles and the current self-hosted visual stack; it is not a guarantee of XSS prevention.
- Browser checks use headless Edge/software WebGL, not a real-device FPS or field Core Web Vitals benchmark.
