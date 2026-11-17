# SEO implementation and release checklist

The owner approved all repository implementation phases after Phase 0. No commit, push, deployment, DNS change, production hosting change or Search Console submission is authorized by this document.

## Phase 1: technical essentials

- Branded, intent-specific page/share titles through the shared metadata helper. Canonical origin, trailing slash routes and all seven sitemap entries unchanged.
- Indexing directives belong to real pages rather than the root layout, preventing public index/follow metadata from leaking into automatic noindex error pages. Existing preview and explicit staging protections remain.
- Build-rendered WebSite identity on Home and SoftwareApplication on Product/Downloads, using the approved release record. A tested serializer escapes HTML script delimiters. No invented organization identity, price, rating, review or social profiles; no promise of a Google software rich result.
- PNG MIME configuration for the extensionless social image. Actual production headers remain a post-deployment check.

## Phase 2: content

Clearer existing page introductions/headings and the hero product eyebrow. Premium headline styling, navigation, layout, original artwork, Windows installer, release metadata and planned platform information are retained. Privacy details explicitly refer to released Windows 1.0.1 build 014, rather than unreleased desktop security work; hosting text reflects Cloudflare/GitHub.

## Phase 3: performance

The same three SVG point paths are generated before build into one shared static asset. Page HTML uses SVG use references, retaining inherited theme gradients and original geometry. Runtime no longer computes the large preview on every document initialization. Layout positioning becomes compositor transforms, fixing the reproduced fallback-induced shift without removing scroll composition or WebGL. Screenshot picture markup requests one system-theme variant by default and responds to saved site theme changes. A saved theme opposite the OS can still require correction after hydration; do not claim zero duplicate requests in every possible preference state.

The full-resolution WebGL scene, particle count, shader choreography, one-canvas composition, mobile capability gates, manual pause and hidden-tab handling are retained. No new production dependency or runtime server is added.

## Phase 4: growth material

keyword-map.md, content-plan.md and three owner-review drafts supply distinct intent, evidence requirements and maintenance ownership. No thin pages, new routes or unreviewed articles were published. FAQ rich-result markup is not pursued; Google's current guidance reports that feature ended in May 2026. Software schema remains factual even though missing genuine price/review data prevents a claim of rich-result eligibility.

## Phase 5: validation and measurement

Run npm run lint, typecheck, build, verify:export, verify:seo, verify:browser, verify:navigation and verify:particles. Use verify:motion for the broader existing premium-motion checks. Results and limitations will be appended after execution. Build/QA outputs stay ignored. SEO browser checks cover actual static HTML on loopback, seven routes at 320/390/1440, screenshot theme selection, no-JS content and Downloads layout stability. Software WebGL is not a physical-device benchmark or field CWV result.

Manual actions remain in cloudflare-manual-checklist.md and GOOGLE_SEARCH_CONSOLE_CHECKLIST.md. Indexing and rankings are controlled by Google, not guaranteed by these changes. Approval for this implementation does not publish installers, enable support channels, or modify the desktop application.

References: https://developers.google.com/search/docs/appearance/title-link ; https://developers.google.com/search/docs/appearance/site-names ; https://developers.google.com/search/docs/appearance/structured-data/software-app ; https://developers.google.com/search/updates ; https://web.dev/articles/vitals .

## Final results (17 November 2026)

Passed: npm run lint; npm run typecheck; npm run build (including preview prebuild and static-segment postbuild); npm run verify:export; npm run verify:seo; npm run verify:navigation; npm run verify:particles; npm run verify:browser; npm run verify:motion. Export checks include 13 automated cases and 775 local references. Seven sitemap routes remain unchanged. All pages are static.

The SEO browser suite passed all seven routes at 320, 390 and 1440 px; the broader motion suite also checked layouts through 3840 px. Default system-theme loads requested one chats screenshot candidate, and saved theme switching worked. Home, Downloads and Documentation were checked with JavaScript disabled. Existing route/history/error recovery, product preview, screenshot dialog, reduced motion and GPU fallback checks passed. Captures were visually reviewed in desktop dark and mobile light.

- Downloads live scene: CLS 0.000107; 1 canvas.
- Downloads reduced motion: CLS 0.000121; 0 canvas.

Payloads: homepage HTML 258,671-byte live baseline -> 131,014-byte new local artifact (about 49% smaller); Downloads 206,144 -> 80,012 bytes (about 61% smaller). Inline fallback 129,491 -> 935 bytes; the exact point paths are now one 128,850-byte shared SVG asset. Total export 6,199,675 -> 4,935,203 bytes. These are artifact measurements, not a claim about real-user speed after deployment. The full 922,308-byte decoded renderer chunk is retained and loaded only for capable animated views.

The old Stage 2 browser script assumed an independent hero canvas and obsolete controls. Its replacement delegates to the maintained SEO and launch suites using the current shared-canvas harness; navigation and particles remain separately verified. One software-WebGL run warned that WEBGL_lose_context was unavailable; the particle recovery suite still passed and no console/hydration errors were reported.

Not performed: commit, push, deployment, DNS/redirect settings, production error-handler changes, Google account access, Search Console submission, independent installer re-hash or field CWV measurement. PageSpeed quota errors and absent private Search Console/CrUX data still limit field conclusions. New articles remain unpublished drafts. See the two owner checklists for the remaining live actions.

## Review inventory

Source and documentation files prepared for review (generated build and browser artifacts are ignored):

- docs/seo/GOOGLE_SEARCH_CONSOLE_CHECKLIST.md
- docs/seo/IMPLEMENTATION.md
- docs/seo/cloudflare-manual-checklist.md
- docs/seo/content-plan.md
- docs/seo/drafts/how-lan-messaging-works.md
- docs/seo/drafts/lan-chat-vs-cloud-chat.md
- docs/seo/drafts/troubleshoot-nearby-pcs.md
- docs/seo/keyword-map.md
- docs/seo/seo-measurement.md
- package.json
- public/_headers
- public/media/particle-fallback.svg
- scripts/generate-particle-preview.mjs
- scripts/seo.test.mjs
- scripts/verify-browser.mjs
- scripts/verify-cloudflare-export.mjs
- scripts/verify-network-motion.mjs
- scripts/verify-seo-ui.mjs
- src/app/about/page.tsx
- src/app/downloads/page.tsx
- src/app/layout.tsx
- src/app/page.tsx
- src/app/privacy/page.tsx
- src/app/products/lan-messenger/docs/page.tsx
- src/app/products/lan-messenger/page.tsx
- src/app/products/page.tsx
- src/components/animations/ParticleBackdrop.tsx
- src/components/living-network/LivingHero.tsx
- src/components/living-network/NetworkFallback.tsx
- src/components/site/StructuredData.tsx
- src/components/site/ThemeScreenshot.tsx
- src/lib/json-ld.mjs
- src/lib/site.ts
- src/lib/structured-data.ts
- src/styles/immersive-hero.css
- src/styles/particles.css
