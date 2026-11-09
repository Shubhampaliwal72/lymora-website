# Navigation feedback and loading UX

## Audit and root causes

This is an App Router static export with eight public HTML routes, one root
layout, server-rendered page content, shared client animations and a dynamically
imported NetworkCanvas. There are no request-time page APIs or server loaders.
Internal route links already used next/link with production prefetch enabled;
hash anchors and native external/download links are appropriate as they are.

A loopback production-export baseline under 450 ms latency / 64 KiB per second
reproduced an uncached About-to-Privacy transition of 1,262 ms. After 220 ms the
old About page was still visible and no navigation feedback existed. This is
a controlled local observation, not a Cloudflare production speed benchmark.

Uncached RSC/static route files and JavaScript must arrive before React can
commit a destination. PageRevealMotion then separately animated page titles
and introductory paragraphs for 850 ms plus staggering, making arrival feel
slower. The shared background also rebuilt its GSAP context on every route.
The largest existing lazy Three.js chunk is about 931 kB before compression;
previous initialization loaded it after two frames even for an offscreen hero.

## What changed

- NavigationLink keeps the public Next Link API, default prefetch behavior,
  native hrefs, modifier keys and cancellation. Its null-rendering descendant
  uses the installed Next 16 useLinkStatus hook. Only a real pending navigation
  starts the shared indicator; no document click interception or router/history
  monkey patching is used. Route files remain Server Components.
- navigation-feedback.ts is a small request-specific external store. The
  indicator alone subscribes, so progress updates do not rerender the page.
  A 100 ms reveal threshold skips instant/cached transitions; it never delays
  the router. Completion clears a visible bar after 180 ms. Request IDs prevent
  stale cancellations/completions from ending a newer request. Same-route and
  same-page hash links are ignored. A stalled request resets after 15 seconds,
  without claiming it loaded or cancelling Next's underlying request.
- NavigationFeedback persists in the root layout, under a local Suspense
  boundary because useSearchParams needs it during static export. Path/query
  commits complete matching work; popstate supports delayed back/forward
  navigation; pagehide/pageshow clear abandoned or restored states. An aria-live
  status communicates genuine loading. The 2 px bar uses the requested scoped
  #c2410c accent; existing theme colors are unchanged. It is indeterminate,
  not a byte-accurate download percentage. Homepage reading progress yields
  the top edge while navigation feedback is visible.
- template.tsx gives the arriving route a readable 180 ms opacity adjustment
  from .88 to 1. There is no exit delay, scale/position change or opacity:0
  gate. The persistent header/footer are not transitioned. Page titles and
  introductory copy no longer wait for SplitText; existing marketing heading
  and below-fold paragraph reveals retain their GSAP ownership.
- NetworkWallpaper keeps its existing animation across routes and refreshes
  only its scroll range after navigation. LivingNetwork requests the optional
  WebGL renderer only after its hero intersects the viewport. Its existing
  useful SVG preview remains visible until textures and the first 3D frame
  are ready, and remains the fallback if WebGL is unavailable.
- Motion policy was corrected after this checkpoint: the owner explicitly
  requests always-on brand scenes and scroll storytelling. The initial inline
  attribute and shared scene hook both keep brand motion enabled. OS reduced
  motion applies only to the new page arrival, navigation indicator and anchor
  scrolling; it does not disable the whole website. See MOTION_STABILITY.md.

## Where skeletons were avoided

No skeletons were added to headings, navigation, hero copy, static articles,
buttons or already available content. There is no asynchronous page data to
justify a loading.tsx page replacement. The SVG network preview is a useful
placeholder for the genuinely expensive 3D upgrade. Screenshots already have
explicit 1800 x 1020 dimensions and an aspect-ratio frame; adding animated
skeleton components would add client JavaScript without fixing a measured
layout problem. Original screenshots, logos and product claims are unchanged.

## Files

New runtime files: src/lib/navigation-feedback.ts,
src/components/site/NavigationLink.tsx, NavigationFeedback.tsx,
src/app/template.tsx and src/styles/navigation.css. The existing root layout
mounts the indicator; globals.css imports its styles. Existing route pages,
LivingHero and shared navigation/footer/support components only change their
Link import to reuse NavigationLink. ActiveLink still supplies aria-current.
PageRevealMotion, NetworkWallpaper, LivingNetwork, useScenePreferences and
ConnectionStory contain the animation/performance changes described above.
AGENTS.md records the latest motion policy. No deployment settings change.

## Verification

Run npm run lint, npm run typecheck, npm run build, npm run verify:export,
npm run verify:navigation and npm run verify:motion. verify:navigation is a
new convenience command for deterministic state/race tests and a browser run
against the actual export. It reuses the existing Edge loopback harness.
Test-only delay/503 injection stays in that Node harness, never production.

Coverage includes initial and direct nested loads, all eight client routes,
rapid and duplicate clicks, cached back/forward, same-route/hash exclusions,
slow network/payloads, failed RSC recovery, prefetched/cached transitions,
mobile/desktop, reduced motion, offscreen 3D deferral, SVG-to-WebGL layout
stability and JavaScript-disabled static content. Deterministic timer tests
also cover external URLs, query changes, history tracking and 15-second
stalled recovery. Browser captures/results stay ignored in .verification/.
No new dependencies, APIs, SSR/runtime requirements, DNS, deployment or
installer changes are introduced. The checks use software WebGL; they are
not a hardware FPS or field Core Web Vitals benchmark.

References: installed Next.js 16.4.5 documentation for useLinkStatus, Link,
router events and template.js. Pages remain prerendered static HTML and RSC
files with output: export, compatible with the existing Workers assets config.

## Complete changed-file inventory

| File | Purpose |
| --- | --- |
| AGENTS.md | Record the current reduced-motion and shared-link policy. |
| README.md | Link the implementation guide/test command and correct the old motion policy. |
| docs/NAVIGATION_UX.md | Audit findings, design decisions, file inventory and validation. |
| package.json | Add verify:navigation; no dependency/version change. |
| scripts/verify-navigation-state.mjs | Deterministic timer/race tests for fast, failed, repeated and history navigation. |
| scripts/verify-navigation-ui.mjs | Static-export browser scenarios, throttling/failure fixtures and scene fallback checks. |
| scripts/verify-network-motion.mjs | Reuse the Edge harness with navigation-only mode and test-only request faults. |
| scripts/verify-premium-ui.mjs | Update regression assertions to the latest reduced-motion requirement. |
| src/app/about/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/downloads/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/globals.css | Import the scoped navigation stylesheet. |
| src/app/layout.tsx | Mount persistent feedback in isolated Suspense and read reduced motion before paint. |
| src/app/not-found.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/privacy/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/products/lan-messenger/docs/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/products/lan-messenger/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/products/lan-messenger/releases/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/products/page.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/app/template.tsx | Static-compatible 180 ms, readable page arrival wrapper. |
| src/components/animations/ConnectionStory.tsx | Static connector and stationary step highlights for reduced motion. |
| src/components/animations/NetworkWallpaper.tsx | Keep geometry/timeline across routes; refresh only the scroll range. |
| src/components/animations/PageRevealMotion.tsx | Remove long title/intro reveals, retain GSAP scrolling reveals and restore text on initialization failure. |
| src/components/living-network/LivingHero.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/living-network/LivingNetwork.tsx | Load optional 3D only when visible; preserve useful SVG fallback. |
| src/components/living-network/useScenePreferences.ts | Subscribe to the actual reduced-motion preference. |
| src/components/site/ActiveLink.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/site/NavigationFeedback.tsx | Show fixed progress/live status; handle URL commits and history lifecycle. |
| src/components/site/NavigationLink.tsx | Retain Next Link routing/prefetch and observe genuine pending transitions. |
| src/components/site/PageIntro.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/site/SectionNavigation.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/site/SiteFooter.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/site/SiteHeader.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/components/site/SupportSection.tsx | Import NavigationLink instead of raw Next Link; existing content/behavior unchanged. |
| src/lib/navigation-feedback.ts | Request-specific pending/completion timers, subscriptions and recovery. |
| src/styles/navigation.css | Scoped accent bar, page arrival and reduced-motion CSS. |
| scripts/verify-topology-ui.mjs | Bring the hero into view before requiring WebGL; offscreen loading is intentionally deferred. |

PageRevealMotion also restores original static text markup/labels if SplitText setup fails. The navigation browser check deliberately injects one measurement failure and verifies that headings remain readable.


## Final results and practical limits

All four requested commands passed: npm run lint, npm run typecheck,
npm run build and npm run verify:export. The export contains 14 generated
pages/assets routes, with 11 HTML documents and 704 checked local references.
The deterministic navigation-state tests, focused Edge navigation suite and
existing motion/UI regressions passed. Navigation coverage includes slow
network emulation plus delayed payloads, failed payload recovery and an
actually triggered text-animation initialization failure. The old scene
regression expected offscreen WebGL; it was updated to reveal the hero first,
then the full suite passed. No unexpected console/runtime/hydration errors,
missing assets or external website requests remained.

The last production build and focused navigation test include the final text
recovery guard; its normal path only records static markup before the existing
animation setup. The full scene/scroll suite also passed during this update.

The progress bar indicates pending routing, not bytes or a real percentage.
It cannot remove network latency and does not cover a browser document load
before client hydration; the browser handles that phase. A 15-second recovery
limit clears abandoned feedback without claiming success. Existing SVG/image
frames already reserve space, so no page skeleton or blocking overlay is
introduced. Three.js remains the same optional large chunk rather than being
added to every route. Browser checks use software rendering, not field
performance measurements. Future imperative router.push callers should use
the shared feedback API if they need tracking; current navigation uses Links.

The navigation checkpoint was committed on dev as f867aa4 after review.
The subsequent motion-policy correction is documented in MOTION_STABILITY.md.
No push, deployment, dependency, installer, desktop-application or hosting-configuration
change was performed.
