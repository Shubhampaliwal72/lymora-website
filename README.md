# Lymora website

Independent workspace: `D:\my-projects\lymora`.
The desktop application at `D:\my-projects\my-new-app` is a different project
and Git repository. Do not add website dependencies or code there.
The current UI is the Glass Network foundation: a multi-product brand homepage,
floating glass navigation, shared continuous network wallpaper, real screenshot
exploration, and dedicated product/documentation/download/about/privacy pages.
It reuses the committed Living Network Stage 1/2 scene and sanitized original
assets. See design/glass-network/FOUNDATION.md for the architecture, source
accuracy and motion ownership. Open design/glass-network/review.html for a local
manual desktop/tablet/mobile review while npm run dev is running.

Current manual build/upload instructions and future download/support activation:
[Cloudflare deployment guide](docs/CLOUDFLARE_DEPLOYMENT.md). Earlier checkpoint reports remain historical.

## Local development

Use Node.js 22.14 or newer (an active LTS release is recommended) and npm.

```powershell
cd D:\my-projects\lymora
npm ci
npm run dev
```

Open http://127.0.0.1:3100. The server is bound to localhost and uses a separate
port from the desktop frontend. Stop it with Ctrl+C.

```powershell
npm run lint
npm run typecheck
npm run build
node scripts/verify-static-links.mjs
npm ls --depth=0
npm audit --omit=dev
```

`build` generates `out/`. There is no `next start` command: production consists
of static files, without a Node server. Generated output and dependencies are
ignored by Git. Hosting and domain connections are configured separately in
the hosting dashboard; this build does not deploy.

## Cloudflare Pages configuration

Choose **Pages**, not the Workers deployment workflow. This static export does
not use `npx wrangler deploy` or OpenNext. If Next.js builds successfully but a
deploy step requests a missing standalone server manifest, follow the
[Pages settings and troubleshooting guide](docs/CLOUDFLARE_DEPLOYMENT.md#cloudflare-pages-git-settings).

- Build command: `npm run build`
- Output directory: `out`
- Production branch: `main` (deployment requires owner approval)
- Build environment: a Node version matching package.json engines

`next.config.ts` uses `output: "export"` and `trailingSlash: true`. Images use
`unoptimized: true`; resize/compress future product images ahead of time because
Pages cannot run Next.js's default image-optimization server. There are no
server actions, dynamic SSR, runtime API routes or backend dependencies. The
generated cache-components/partial-prefetch flags were removed for static export.

The site self-hosts Latin Manrope and DM Sans fonts with their OFL licences. No browser request goes to Google. It remains noindex until public release review. The Windows download action leads to an honest release-status section; no installer URL is invented.

## Animation foundation

Installed exact dependencies:

- `gsap@3.15.1`: sequences; ScrollTrigger is included.
- `@gsap/react@2.1.2`: scoped React setup and cleanup.
- `motion@14.10.1`: component interactions, imported from `motion/react`.

GSAP owns the hero entrance, finite network clock, independent wallpaper clock,
and one-time scroll reveals. Motion owns independent controls and tab transitions.
Large editorial chapter numbers run continuously from 01 to 05; the slogan
wraps without clipping. The owner requests always-on motion even when the OS
reports reduced motion. Desktop 3D remains lazy-loaded; mobile uses the animated
2.5D SVG view. A quieter perimeter ring replaces crossing background paths. Hidden/offscreen
work pauses. See [UI refinement](docs/UI_REFINEMENT.md) for the current chapter
sequence and animation ownership; earlier stage reports are historical.

The approved scene uses @react-three/fiber@9.8.2 and three@0.187.0, with matching @types/three@0.187.0. Spline, Drei, physics, Rive and Lottie are not installed. No other animation engine is needed.

Read both original, unmodified guides before design work:

- [AI animation rules](LYMORA_AI_ANIMATION_RULES.md)
- [Owner setup guide](LYMORA_ANIMATION_SETUP_GUIDE.md)

The guides assume SQLite/an existing Next.js site; verify claims against actual
product source. This is a new workspace and does not change desktop storage.
GSAP uses its standard no-charge license; Motion is MIT. Check official terms
and individual Canva asset licences before introducing promotional content.

## Git and review

Remote: https://github.com/Shubhampaliwal72/lymora-website

The website source has been pushed to the separate repository. Stage 1 is
committed as 72a93bf; later work is preserved in Git history. Work on `dev` and
review changes before updating `main`. A connected Cloudflare build can deploy
on push; do not push, deploy or connect `lymora.in` without owner approval.

## Dependency compatibility

The current Next.js ESLint preset includes plugins whose peer ranges stop at
ESLint 9. Testing ESLint 10 exposed invalid peer ranges; setup therefore pins
`eslint@9.39.5` without force flags. It is deprecated. Track upstream plugin
support before upgrading. The initial npm audit reports moderate development
findings involving minimatch; see the final verification report and rerun audit
before release. Do not force an incompatible update or downgrade Next.js to hide
findings. Production dependency audit is checked separately.

See [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) for commands, results and remaining tooling risks. The .node-version file selects Node 22 for compatible build services.

## Earlier stage checkpoints (historical)

The following reports describe their own stage, not the current launch status. Use docs/CLOUDFLARE_DEPLOYMENT.md and the current verify:launch / verify:export checks for launch preparation.

## Browser verification

After `npm run build`, run `npm run verify:browser`. This uses an installed Edge browser in headless mode and a temporary loopback static server. Set `LYMORA_BROWSER_PATH` to another installed Chromium browser executable if needed. Screenshots and JSON results are saved locally in ignored `.verification/`. No screenshots or source are uploaded. See docs/LIVING_NETWORK_STAGE2.md for coverage and limitations. Run `node scripts/verify-scene.mjs` for the shared animation boundary checks.

To exercise an already-running local development server instead of the static export:

```powershell
$env:LYMORA_TEST_URL = "http://127.0.0.1:3100"
npm run verify:browser
Remove-Item Env:LYMORA_TEST_URL
```

The test URL must use 127.0.0.1. Final production and development checks passed; see [HERO_IMPLEMENTATION.md](HERO_IMPLEMENTATION.md). The current design is the header/hero phase, with later showcase and documentation routes still to come.

## Living Network Stage 1

The current local preview is http://127.0.0.1:3100. It is a stage checkpoint: full interactive connection controls, scroll storytelling and the final product gallery remain later stages. The hero uses original renderer-demo captures labelled as test data. Clean release screenshots and a verified public installer URL are required before publication. See [Stage 1 verification](docs/LIVING_NETWORK_STAGE1.md).

## Glass Network pages

The product registry is in src/lib/products.ts. Add only real products; each
application can have its own overview, documentation, screenshots, release notes
and download destination. Current routes are listed in design/glass-network/FOUNDATION.md.
Original screenshot pixels and provenance are preserved. Public downloads remain
pending verified release metadata. The website is still noindex and local-only.

After a static build, node scripts/verify-static-links.mjs checks local navigation,
anchors and asset references without a browser or network requests. The older
verify:browser command remains available for later visual regression work; it
is not run automatically during this code-only foundation pass.

The setup walkthrough uses a reversible dashed-to-orange LAN route and a
connected three-step message story. The shared header has a measured SVG
edge beam; product/docs section navigation indicates the current reading
position. See docs/UI_REFINEMENT.md for animation ownership and verification.
