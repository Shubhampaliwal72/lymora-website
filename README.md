# Lymora website

Independent workspace: `D:\my-projects\lymora`.
The desktop application at `D:\my-projects\my-new-app` is a different project
and Git repository. Do not add website dependencies or code there.
Living Network Stages 1 and 2 are implemented: a lazy React Three Fiber hero, selectable direct connections, finite message/file sequences, and matching 2.5D fallbacks. See docs/LIVING_NETWORK_STAGE2.md for the current implementation and docs/LIVING_NETWORK_ASSET_AUDIT.md for original asset provenance. Stage 1 is preserved in commit 72a93bf. HERO_IMPLEMENTATION.md records the previous design.

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
npm ls --depth=0
npm audit --omit=dev
```

`build` generates `out/`. There is no `next start` command: production consists
of static files, without a Node server. Generated output and dependencies are
ignored by Git. No deployment or domain connection is configured.

## Future Cloudflare Pages configuration

- Build command: `npm run build`
- Output directory: `out`
- Production branch: `main`, after setup is approved and pushed
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

GSAP owns hero text and a finite six-second progress clock. R3F derives camera, device and signal geometry from that clock. Motion owns only independent DOM controls and the mobile navigation panel. Three.js is lazy-loaded on capable fine-pointer desktops; mobile/reduced-motion/low-power modes use the 2.5D fallback. Never let them control the same
property on one element. Use small client components, visible static content,
reduced-motion support, and scoped cleanup.

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

The separate remote was created private and empty. Website implementation is on
local `dev`; Stage 1 is committed as 72a93bf. No website files have been pushed or
deployed. Review subsequent stages with the owner before committing them; do not
push, deploy or connect `lymora.in` without approval.

## Dependency compatibility

The current Next.js ESLint preset includes plugins whose peer ranges stop at
ESLint 9. Testing ESLint 10 exposed invalid peer ranges; setup therefore pins
`eslint@9.39.5` without force flags. It is deprecated. Track upstream plugin
support before upgrading. The initial npm audit reports moderate development
findings involving minimatch; see the final verification report and rerun audit
before release. Do not force an incompatible update or downgrade Next.js to hide
findings. Production dependency audit is checked separately.

See [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) for commands, results and remaining tooling risks. The .node-version file selects Node 22 for compatible build services.

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
