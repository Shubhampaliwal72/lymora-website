# Manual hosting and website activation

This is a standalone static Next.js website. No deployment, DNS, nameserver, GitHub push, or account setting is performed by the build.

## Build and upload

Run from D:\my-projects\lymora:

    npm.cmd ci
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run build
    npm.cmd run verify:export

Upload the CONTENTS of out/ to your static hosting provider. For Cloudflare Pages, choose a static upload or configure npm run build with output directory out. Keep the existing postbuild step; it normalizes Windows-exported navigation filenames. No next start, backend, runtime token or database is required. Run npm ci only when dependencies need installation.

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

Pages publishes the build output itself; there is no separate `wrangler deploy` command. Keep `LYMORA_PUBLIC_LAUNCH` unset until public indexing is approved. Review the deployment before starting it; this guide does not authorize a deployment or domain change.

## Troubleshooting: build succeeds, Workers deployment fails

The 7 November 2026 log shows a successful Next.js build and static page export, followed by `npx wrangler deploy`. Wrangler detected Next.js and ran an OpenNext migration inside the Cloudflare build environment. That server adapter then failed looking for `.next/standalone/.next/server/pages-manifest.json`.

This project intentionally uses `output: "export"`. Its deployable website is `out/`, so a standalone server manifest is not expected. The failure is a **Workers deployment configuration mismatch**, not a TypeScript, animation, or static export error. The adapter's generated files in that CI checkout are not changes in this repository.

To use the intended Pages hosting, create/select a **Pages** project with the settings above. If the screen asks for a **Deploy command** such as `npx wrangler deploy`, it is the Workers workflow. Leave the existing Worker and its DNS records unchanged while preparing the Pages project; do not start another deployment or attach the production domain until approved. A push to a connected production branch can trigger a deployment automatically.

Do not change this project to `output: "standalone"`, add OpenNext, or create a fake manifest to satisfy that erroneous deployment step. Do not use `.next` as the Pages output directory. ESLint deprecation and missing build-cache warnings are separate from this failure.

Official reference: [Deploy a static Next.js site on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).

## Public search visibility

Development builds remain noindex. When YOU are ready for a public launch, build in PowerShell with:

    $env:LYMORA_PUBLIC_LAUNCH = 'true'
    npm.cmd run build
    npm.cmd run verify:export
    Remove-Item Env:LYMORA_PUBLIC_LAUNCH

This enables the robots metadata and sitemap for manual builds. A named Cloudflare preview branch still stays noindex; the Cloudflare main branch can opt in through the same flag. Removing the variable restores the development default for the next build; it does not alter an already-uploaded artifact. Noindex is not access control.

Canonical address: https://lymora.in . Connect your domain and www, check certificates, and configure www -> apex plus HTTP -> HTTPS redirects through your hosting dashboard when ready. DNS and certificate setup are managed separately from this repository; no hard-coded guessed hosting target is published.

## Downloads, support and releases

Release metadata is in src/lib/releases/windows.json, referenced by src/lib/public-links.ts. Update only after verification and owner approval, then rebuild:

- Windows 1.0.1 build 014 is owner-approved and published on GitHub Releases. Its exact installer, size, SHA-256, publication date and known limitations are configured centrally. See WINDOWS_RELEASE.md.
- Windows is the only supported platform presented. No macOS/Linux Coming Soon promise is published. Setting release to null restores the disabled Windows state.
- /downloads/ centralizes installer links, compatibility, version, checksum and release notes. Other pages use internal navigation CTAs. The older releases route keeps a working handoff and a Downloads canonical; it is excluded from the sitemap.
- A future approved release must update its build/version/date, Windows requirement, architecture, file size, checksum, actual changes/known issues and verified GitHub Releases URLs.
- support.email and support.issuesUrl remain null until their mailbox or tracker is configured and verified. The internal troubleshooting guide works now.
- Do not place Windows installers in public/. Plan distribution through approved GitHub Releases, independently of website deployment.

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
