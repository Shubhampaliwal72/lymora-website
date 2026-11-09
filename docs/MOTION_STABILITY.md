# Motion stability

The navigation UX checkpoint is committed on dev as f867aa4. The owner then
requested that brand animation stay on again. This correction is separate.

## Cause and policy

The shared useScenePreferences hook had connected every animation to the OS
prefers-reduced-motion query. When it returned false, the wallpaper, hero,
heading reveals, vertical phrase slider, connection story and UI interactions
all stopped. navigation.css additionally replaced the slider's moving mask with
an all-visible layout. Saving a file was not itself the cause of that policy.

Brand motion now has one explicit always-on policy in useScenePreferences.
The pre-paint data-motion attribute agrees with it, so hydration and preference
changes cannot temporarily turn all scenes off. Navigation-only reduced-motion
CSS still disables the new page-arrival animation, makes pending feedback still,
and avoids smooth hash scrolling. It cannot change the brand slider or scenes.
This owner-requested behavior overrides the older global reduced-motion rules
in the original animation guide. It is not a claim of global reduced-motion
accessibility conformance.

Manual scene/background pauses, hidden-tab pauses, viewport pauses and mobile/
low-power SVG rendering remain available. Optional WebGL still loads only when
appropriate. No OS preferences are modified.

## Lifecycle

Both GSAP clocks initialize in their actual current playing/paused state,
instead of always being created paused and relying on a separate effect to
start them. Later visibility and manual-pause effects still control playback.
useGSAP owns cleanup on unmount, dependency changes and Fast Refresh; scoped
ScrollTriggers and SplitText cleanup remain intact. Route navigation preserves
the background clock and refreshes its scroll range rather than rebuilding it.
Do not introduce gsap.globalTimeline.pause/clear or ScrollTrigger.killAll in a
route component: those would affect scenes owned by other components.

## Regression coverage

verify:motion checks live packets with both OS preference values, all three
vertical phrases and the reversible connector, manual pause/resume, both themes,
mobile fallback and 320-3840px containment. verify:navigation samples the actual
background packet positions across all eight client routes and browser history;
it also checks that reduced navigation effects do not stop brand animation.
Readable text recovery remains covered by an injected SplitText setup failure.

## Verified results (9 November 2026)

- npm run lint: passed, no warnings.
- npm run typecheck: passed.
- npm run build: passed; all routes remain static.
- npm run verify:export: passed, 11 HTML documents / 704 local references.
- npm run verify:motion: passed in Edge 156, dark/light and 320-3840px.
- npm run verify:navigation: passed, including pending/failure/repeated clicks,
  client routes, history, reduced navigation effects and moving brand packets.
- Actual Next development Fast Refresh: passed after reversible edits to
  NetworkWallpaper, LivingNetwork and PageRevealMotion. Packet positions,
  hero phases and word-reveal setup remained live after both applying and
  restoring each edit, with OS reduced motion emulated. The browser document
  stayed mounted. Temporary test edits were restored byte-for-byte.

Browser checks used local loopback pages and software rendering, not a hardware
FPS benchmark. The existing development server was left running. The first
cold development test exceeded the browser harness's 15-second navigation
limit; the warmed dev preview passed with a longer initial-load limit.

The navigation checkpoint and this follow-up animation correction are separate
commits on dev. Nothing was pushed, merged to main or deployed;
no desktop application or Windows setting was changed.
