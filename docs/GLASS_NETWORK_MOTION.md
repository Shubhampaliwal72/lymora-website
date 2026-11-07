# Glass Network live motion

Implemented in the separate website only. The latest owner request explicitly
asks for live orange connections, horizontal/vertical scroll motion and full-page
images. It supersedes the foundation checkpoint's code-only review restriction.
No deployment, upload, desktop-app changes or automatic commit is included.

## Implementation and ownership

- NetworkWallpaper.tsx: seven orange curved connections between six computer
  outlines. Each has a moving bright head, trailing core and soft wide halo.
  One GSAP clock repeats every 10 seconds, updating SVG at most 30 times/second.
  Paths alternate direction, fade at endpoints and use native path measurements.
  No React state is updated per frame. The visible Pause ambience button and
  hidden-document pause remain. Mobile/low-capability/reduced-motion viewers
  keep the lightweight static network; there is no second WebGL renderer.
- HomeScrollMotion.tsx: scoped GSAP ScrollTriggers own marked homepage wrappers.
  Headings move vertically, editorial rows alternate horizontal entry, the real
  product screenshot settles from shallow perspective, the hero shifts in depth,
  the connection strip draws its line, and a wide typographic ribbon moves
  horizontally according to its measured overflow. A thin reading line tracks
  the document. Native vertical scrolling is preserved, without pinning or
  forced scroll. Content stays visible before JavaScript and without animation.
  Reduced motion removes these transforms and wraps the decorative ribbon.
- page.tsx / ProductExplorer.tsx: reuse original content and real screenshots;
  add controller markers and an aria-hidden decorative ribbon. Motion keeps
  owning screenshot-tab transitions on the parent. GSAP uses the inner screenshot
  surface, so the engines do not fight over the same element's transform.
- network-motion.css / globals.css: theme-aware orange paths, light heads,
  restrained glows, screenshot perspective, ribbon clipping and reduced-motion /
  print fallbacks. Theme artwork and desktop screenshot pixels are unchanged.
- The GSAP context reverts on cleanup or capability changes. Image/font readiness
  refreshes trigger geometry; image listeners are removed on unmount.

## Windows export correction found during verification

Next 16.4.5's installed export/index.js collects segment filenames with the native
path.relative separator. shared/lib/segment-cache/segment-value-encoding.js only
replaces forward slashes. On Windows the export therefore contained, for example,
about/__next.about/__PAGE__.txt while its own client requested
about/__next.about.__PAGE__.txt. This produced observed 404 prefetches.

scripts/normalize-static-segments.mjs runs as npm postbuild. It adds the flat
aliases inside out/ without editing Next or deleting the original output. Existing
aliases must contain identical bytes; a conflict fails the build. On a subsequent
run it adds zero aliases. On this Windows build it adds eight. Platforms already
producing flat names need no aliases. The preview server does not hide 404s.
No dependencies or package versions changed.

## Commands and verification

- npm run lint: ESLint, zero warnings.
- npm run build: production compilation, TypeScript and static export, followed
  automatically by the filename normalization above.
- node scripts/verify-static-links.mjs: all 595 local references across 11 HTML
  files resolve.
- npm run verify:motion: reproducible loopback-only browser verification and
  actual full-page PNG captures. Requires installed Edge (or LYMORA_BROWSER_PATH).
  It checks moving orange paths, pause/resume, scroll-responsive horizontal
  transforms, 320/375/768/1024/1440 layouts, mobile skipping WebGL, reduced-motion
  fallback, client navigation and absence of console/runtime errors, missing
  assets and external requests. Its report is .verification/network-motion-results.json.

Browser verification uses headless Edge with software WebGL. It confirms behavior
and layout in that environment; it is not a hardware FPS benchmark, a field Core
Web Vitals measurement or a substitute for the owner's visual acceptance.

## Full-size review images

Local actual browser captures, not generated/retouched product mockups:

- design/glass-network/captures/Lymora-Homepage-dark-Full.png (1440 x 6572)
- design/glass-network/captures/Lymora-Homepage-light-Full.png (1440 x 6572)
- design/glass-network/captures/Lymora-Homepage-mobile-Full.png (375 x 6716)

Hero-only images and sectional review captures are also saved. The PNG folder
and .verification outputs are ignored by Git and never added to public/.
Full-page PNGs freeze one instant of an animated page. Fixed wallpaper/header
appear in their browser-captured position, not repeated down the image. Open the
local site to assess moving light and scroll timing. No third-party upload occurs.

## PC-to-PC refinement

The follow-up request replaces the simultaneous decorative trails with one
randomly selected direct connection at a time. All six background computers can
send to each other. Each 4.8-second cycle traces a short bright packet between
monitor bezels; only the receiving computer glows on arrival. The 30 Hz cap,
visibility pause, user pause and static capability fallbacks remain.

The hero now supports all six directions among its three PCs. Auto routing picks
a different sender/receiver pair after each completed six-second demonstration.
Manual selection switches to a chosen route; Pause and Replay remain available.
Automatic status changes are not repeatedly announced to screen readers. The
receiving 3D monitor bezel and lightweight fallback pulse on actual arrival,
without extra postprocessing dependencies.

The camera is pulled back and the scene is paint-contained above a separately
stacked control panel. The header uses fully rounded ends at every viewport.
PageRevealMotion adds GSAP SplitText word entrances, paragraph reveals and
screenshot-content reveals across routes. It uses the already installed GSAP
plugin, preserves accessible heading labels, reverts original markup on reduced
motion/unmount and never competes with the homepage outer-wrapper transforms.
No dependency was added.

Extended browser coverage checks arrival glow, randomized hero route changes,
scene/control separation, rounded header geometry, word reveals, non-homepage
navigation and reduced-motion cleanup. The first production browser run caught
a null path access while GSAP reverted during navigation; callbacks now check
mounted DOM references before drawing. The corrected build is verified again.

A detached website Next dev process was identified by its command line and
stopped together with its website-only workers. TCP probing confirms port 3100
is closed. Browser tests use an ephemeral loopback port and stop their own
server. Run npm run dev from D:/my-projects/lymora for a fresh development session.

Final refinement verification: lint, production TypeScript/static build, all 595
local references and the extended Edge browser checks pass. No console/runtime
errors, missing assets or external requests were observed. Desktop Git status
remains clean. Captures were refreshed from the corrected build.

## Always-on motion and mesh contrast (latest owner direction)

The actual local development browser was probed without media emulation and
reported prefers-reduced-motion: reduce. Under the earlier policy this disabled
the scene, word reveals and CSS motion. Forcing normal motion reproduced the
working animation; the IP address was not the cause.

The owner then explicitly requested permanently active website motion and removal
of the header switch. The temporary site-toggle implementation was removed.
useScenePreferences now returns motion=true, and the pre-paint root script sets
data-motion=full. Legacy saved animation values are ignored. Hero, word reveals,
Motion interactions and CSS share this policy. No Windows/browser setting is
changed. This is an explicit exception to the earlier attachment default of
following reduced motion. Low-capability/mobile rendering and hidden-tab/offscreen
pauses remain; existing scene/ambience pause controls remain accessible.

Headings and images now restart their reveal on re-entry. Hover adds a small
button/link lift, icon movement and a screenshot zoom on a separate image node,
without competing with GSAP wrapper transforms.

The background uses six larger 84x54 vector monitor cases, a ring with three
cross-links and randomly selected direct packet routes. Every route starts and
ends exactly on a bezel. The stable nine-link mesh prevents the background from
appearing empty between packets. The hero camera moves from 11.6 to 10.8 for a
modest size increase while paint containment protects the controls. The wallpaper
uses meet framing so monitor icons fit instead of being cropped at narrow desktop
aspect ratios.

Light-mode monitor outlines, orange beam cores and the warm ambient wash have
stronger contrast; the masking gradient no longer washes out the whole network.
The SVG stays resolution-independent. The one active packet now uses the native
GSAP/browser frame cadence rather than the previous 30 Hz drawing throttle.
There is no 4K raster video or new rendering engine/dependency.

Verification includes the actual development URL http://127.0.0.1:3100 with the
real reduced-motion setting, automatic 3D/word animation, hover, scroll reveal,
and no runtime errors. Production browser checks cover exact line endpoints,
mesh structure, repeatable word reveals, pause/arrival/random routing, navigation,
responsive widths 320 through 3840 and actual 3840x2160 dark/light PNG captures:

- design/glass-network/captures/Lymora-Homepage-dark-4K.png
- design/glass-network/captures/Lymora-Homepage-light-4K.png

These are software-rendered browser captures, not a hardware 4K frame-rate
benchmark. The existing user-started dev server is left running. No deployment,
commit or desktop-application mutation is performed.

## Soft glass background finish

The final visual request adds a 1.15px blur and 84% opacity to the wallpaper SVG
only, plus a static diagonal reflection and a light canvas veil on its scrim.
Text, controls, the real product screenshots and the foreground 3D PCs remain
sharp. Mobile and reduced-transparency viewers skip the filter/reflection and
use a subdued static-opacity background instead. No extra animation loop,
backdrop-filter layer or dependency is introduced.
