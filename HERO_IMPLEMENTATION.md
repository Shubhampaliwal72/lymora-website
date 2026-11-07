# Ember Signal: header and hero

Implemented in the independent website workspace, D:\my-projects\lymora.
The desktop application, its dependencies, and its repository were not changed.
No commit, push, deployment, domain connection or public release was made.

## What changed and why

| File | Purpose |
| --- | --- |
| src/styles/tokens.css | Semantic Ember light/dark colours, page spacing, shadows and readable status colours. White primary-button labels keep a darker orange hover colour for contrast. |
| src/app/globals.css | Responsive composition, typography, navigation, illustration and accessible focus styles. Native mobile disclosures work without JavaScript. Reduced motion also removes CSS transitions and smooth scrolling. |
| src/app/layout.tsx | Local variable fonts, truthful metadata and a tiny pre-paint theme bootstrap. Only the root attributes use hydration-warning suppression because this script sets them before React starts. Noindex remains until release approval. |
| src/app/page.tsx | Server-rendered homepage composing the header/hero, a short getting-started destination, release availability and footer. Every navigation anchor has a real destination. |
| src/components/site/SiteHeader.tsx | Original theme-specific logos and responsive navigation. Getting started replaces the concept's Docs label until a dedicated documentation route exists. |
| src/components/site/ThemeToggle.tsx | Local preference persistence, live system-theme changes when no choice is saved, cross-tab updates, and graceful blocked-storage handling. No account or cookie is needed. |
| src/components/site/MobileMenu.tsx | Native details/summary keyboard and no-JS behavior, with Motion enhancing the open panel. Escape returns focus; outside clicks, link selection and desktop resizing close it. |
| src/components/site/Icons.tsx | Small reusable interface SVGs, hidden from assistive technology when their controls already have labels. These do not replace the brand logo. |
| src/components/animations/HeroMotion.tsx | Scoped GSAP entrance on the hero copy only. Text is already visible in HTML; useGSAP and matchMedia revert animation on cleanup or a reduced-motion change. |
| src/components/sections/Hero.tsx | The approved product message, working exploration links and three verified capabilities. No invented app UI, statistics or release metadata. |
| src/components/sections/LanScene.tsx | Accessible SVG illustration of equal PCs with no central messaging server. GSAP moves one signal and its reply along an SVG curve. It plays once; Replay restarts it. Reduced motion makes the illustration static and disables Replay. It is explicitly labelled as illustration, not telemetry or latency measurement. |
| src/lib/motion.ts | Shared durations with explicit library ownership. Adjust these values to tune the sequence without searching through components. |
| public/brand/logo-dark.png, logo-light.png | Unmodified owner-supplied artwork, with original transparent padding preserved. Both canvases remain 1200 by 400. |
| public/brand/README.md | Logo provenance and preservation rules. |
| src/assets/fonts/ | Latin variable Manrope and DM Sans, their original OFL licences and retrieval URLs. Next serves them locally; visitors do not contact Google. |
| scripts/verify-browser.mjs | Local browser acceptance checks against the actual static export, using an installed Chromium browser. Saves local screenshots/results without uploading anything. |
| package.json | Adds verify:browser only. No new runtime or development dependencies were added in this phase. |
| .gitignore | Ignores local browser profiles, screenshots and verification output. |
| README.md | Current implementation, development/static-export commands and browser-check instructions. |
| AGENTS.md | Records approval and preserves the Next.js-generated guidance. |
| design/DIRECTION.md, design/figma-state.json | Records the transition from approved concept to implemented header/hero. The saved Figma IDs remain intact. |
| HERO_IMPLEMENTATION.md | This implementation explanation and verification record. |

The release-status section deliberately does not link to a guessed installer.
The richer app showcase, privacy page, release data and remaining routes are
later design phases. No test conversations have been published in this phase.

## Animation ownership and accessibility

GSAP controls hero-copy transform/opacity and signal/receipt geometry/opacity.
Motion controls only the mobile panel. CSS controls simple colour transitions.
No element is animated by both engines. There is no infinite loop or expensive
3D engine, and no scroll interception or long pinned section.

The initial HTML contains the headline and links. JavaScript adds interaction;
without it the system theme, content and native navigation remain available.
Theme/Replay buttons are hidden when enhancement is unavailable. A skip link,
44px header controls, visible focus and semantic headings support keyboard use.
Only the theme preference is written to localStorage. No analytics, feedback
submission, cloud account, tracking or external browser requests were added.

## Commands

- npm run dev: local Next.js development at http://127.0.0.1:3100.
- npm run lint: ESLint with zero allowed warnings.
- npm run typecheck: generate Next.js route types, then TypeScript checking.
- npm run build: production static export to out/; no production Node service.
- npm run verify:browser: local headless Edge acceptance checks against out/.
  On another machine set LYMORA_BROWSER_PATH to its installed Edge/Chrome path.
  This is a test-only executable path, not a deployed site dependency.

## Verification

Verified 2026-11-06 to 2026-11-07 (Asia/Calcutta).

| Check | Result |
| --- | --- |
| npm run lint | PASS, exit 0, zero warnings. |
| npm run typecheck | PASS, exit 0. Next route types and TypeScript. |
| npm run build | PASS, exit 0. Homepage and not-found prerendered; static out/ preserved. |
| npm run verify:browser | PASS, exit 0 against the production static export. |
| Development browser acceptance | PASS, exit 0 using LYMORA_TEST_URL=http://127.0.0.1:3100 and the existing Next dev server with Strict Mode. |
| Desktop repository | Clean on final inspection; no desktop files changed. |

Browser: Edg/156.0.4314.50. Both runs covered 320, 375, 390, 768, 1024 and 1440px in both themes, with no horizontal overflow. Tests also passed for original logo loading, real anchor destinations, persisted theme selection, native keyboard disclosure, Escape focus restoration, touch navigation, live reduced-motion changes, finite replay, and no-JavaScript content/navigation. No page runtime, hydration or console errors, missing local assets, or external page requests were observed.

Desktop and mobile screenshots in both themes are saved locally under .verification/. Full-page desktop/light and mobile/dark captures were visually reviewed. These are development screenshots, so Next's own development indicator can appear; it is absent from the production export. Browser JSON results are .verification/browser-results.json and .verification/development-results.json.

The local static run observed CLS=0 at all sampled widths and LCP between 116 and 228ms. These are unthrottled loopback observations, not field results or performance guarantees. INP was not measured. The export contains 35 files / 1,073,667 bytes; all emitted JS totals 736,434 bytes raw / 235,729 bytes individually gzipped, including framework chunks. This is an output inventory, not a measured first-load transfer budget.

Exploratory checks initially caught an ESLint warning and punctuation encoding issue, both corrected. The headless keyboard test needed focused-target/Enter-text input, and the replay assertion needed a bounded wait for actual completion. Final production and development acceptance runs passed; there are no outstanding failures in this phase.

A second attempt to start port 3100 found it already occupied. Its existing website returned HTTP 200 with the new hero, and was reused without terminating a process or changing the port. The local QA server/browser created by the test script were stopped by its cleanup.

## Limits and remaining work

Figma's Starter-plan MCP quota prevented a fresh design-context export. This
implementation uses the previously saved concept specification and original
assets; pixel-perfect comparison to a fresh Figma render is not claimed.

Browser automation covers a local Chromium engine, not every browser or physical
device. Lab timings cannot establish field LCP/CLS/INP performance or accessibility
certification. No Windows installer or desktop behavior was tested in this phase.

The initial setup's eight moderate development-toolchain audit findings and
ESLint 9 deprecation remain; no dependency changes were made to hide them.
Production dependencies were separately clean during setup. Review again before
release. No public installer URL is available yet. Keep noindex and do not deploy
or connect lymora.in without owner approval.
