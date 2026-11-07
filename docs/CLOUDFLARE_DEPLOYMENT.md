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

## Public search visibility

Development builds remain noindex. When YOU are ready for a public launch, build in PowerShell with:

    $env:LYMORA_PUBLIC_LAUNCH = 'true'
    npm.cmd run build
    npm.cmd run verify:export
    Remove-Item Env:LYMORA_PUBLIC_LAUNCH

This enables the robots metadata and sitemap for manual builds. A named Cloudflare preview branch still stays noindex; the Cloudflare main branch can opt in through the same flag. Removing the variable restores the development default for the next build; it does not alter an already-uploaded artifact. Noindex is not access control.

Canonical address: https://lymora.in . Connect your domain and www, check certificates, and configure www -> apex plus HTTP -> HTTPS redirects through your hosting dashboard when ready. DNS and certificate setup are managed separately from this repository; no hard-coded guessed hosting target is published.

## Downloads, support and releases

Edit src/lib/public-links.ts after information is verified and approved, then rebuild:

- release: null keeps a genuinely disabled Coming Soon button, with no fabricated public version or installer link.
- A future approved release supplies version/date, tested Windows requirement, architecture, file size, checksum, actual changes/known issues, and verified GitHub Releases download/notes URLs.
- support.email and support.issuesUrl remain null until their mailbox or tracker is configured and verified. The internal troubleshooting guide works now.
- Do not place Windows installers in public/. Plan distribution through approved GitHub Releases, independently of website deployment.

The site origin/SEO defaults are in src/lib/site.ts. Screenshot inspection, current navigation and the new hero do not depend on any hosting account.

## What was kept and removed

Kept useful website work: Coming Soon/support/release components and one configuration file; screenshot enlargement; active navigation; canonical/share metadata, original-logo sharing PNG, robots/sitemap and static security/cache headers; export and browser checks.

Removed the unused production-redirect example and replaced the earlier account/DNS migration report with these manual instructions. No DNS-management script or Cloudflare CLI is installed. The Electron/Go project is untouched.

## Checks before uploading

- Pass lint, typecheck, build, verify:export and verify:launch.
- Inspect desktop/mobile in both themes, original screenshots, hero routes, keyboard controls and Coming Soon state.
- Check public support/release configuration before activation; no placeholder links or demo email addresses.
- After upload: directly open nested pages, test the 404 page, verify HTTPS/canonical redirects, headers and actual production indexing.
- public/_headers is consumed by Cloudflare Pages. Another hosting provider may require equivalent dashboard/header configuration. The policy permits Next's inline scripts/styles and the current self-hosted visual stack; it is not a guarantee of XSS prevention.
- Browser checks use headless Edge/software WebGL, not a real-device FPS or field Core Web Vitals benchmark.
