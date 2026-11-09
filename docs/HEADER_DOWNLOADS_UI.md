# Header and platform availability UI

This change is limited to the independent website. No deployment, push, commit,
desktop-app change, new dependency or release artifact is included.

## Header

- HeaderFrame observes one document marker with IntersectionObserver and compacts
  after the first 64 pixels of scrolling. The header reserves its original height,
  so compaction does not move page content. The observer disconnects on unmount.
- The existing logo PNGs, wordmark and tagline remain. CSS owns only the symbol's
  single hover flip and a reflection masked to the original artwork.
  Wordmark and tagline have no transforms or animations. There is no idle loop.
- Logo, dropdown, mobile-menu and header transitions respect reduced motion.
  This does not change the existing GSAP/Three scene preference or pause controls.
- Desktop navigation is centered. At 1100px and below, the existing native mobile
  disclosure replaces the desktop links. Escape, outside clicks, focus leaving,
  route changes and breakpoint changes close the appropriate menu.
- Existing routes and Downloads CTA are retained. Products and Resources reflect
  their actual destination pages; the theme control describes its next action.
- No header-edge beam is added. Reduced transparency keeps surfaces solid.

## Downloads

Windows remains the only downloadable platform. The owner explicitly requested
macOS and Linux Coming soon information in this change. UpcomingPlatforms shows
those plans only on /downloads/, with no invented dates, system requirements,
installer URLs or inactive controls. The Windows release manifest is unchanged.

## Verification

Before the subsequent finite-logo flip and Timer compatibility changes, passed
npm run lint, npm run typecheck, npm run build and npm run verify:export.
Export validation resolves 727 local references across 11 HTML files and verifies
8 routes and the Cloudflare static-asset constraints.

Focused headless Edge checks (against the actual static export):

- node scripts/verify-network-motion.mjs --header-only: logo-only hover and smooth
  return, stationary text, reflection mask, compaction with no document shift,
  theme toggle, keyboard menus, active links, real CTA navigation, reduced motion,
  responsive menu cleanup and collision-free layouts from 320px to 1920px.
- node scripts/verify-network-motion.mjs --downloads-only: verified configured
  Windows installer/checksum/release-note URLs, upcoming information without
  controls, all eight routes, mobile CTAs and both themes at 320/375/1440px.
- node scripts/verify-network-motion.mjs --glass-only: dropdown/dialog stacking,
  background scrims, keyboard/focus restoration and reduced transparency.
- npm run verify:launch: existing three-PC animation, message/file routing,
  screenshot inspection and download/support behavior.

Captures and reports are local-only in ignored .verification/. These checks use
headless Edge/software WebGL; they do not certify physical-device FPS or every
browser. No external resources were requested by the test pages.

## Reduced-motion and Three.js warning correction

The OS reduced-motion preference deliberately replaces the full 3D logo flip
with a brief opacity pulse. Both variants reset and can be triggered again;
wordmark and tagline remain stationary. No OS settings are changed.
MobileMenu reads matchMedia at interaction time instead of calling Motion's
warning-producing useReducedMotion hook. The reduced-motion menu stays static.

R3F 9.8.2 constructs THREE.Clock internally, which Three 0.187 deprecates.
scripts/r3f-timer-compat.cjs replaces only that constructor in the three pinned
R3F runtime distributions with a THREE.Timer-backed implementation of the
existing clock interface. It preserves start/stop, auto-start, elapsed time and
manual/demand frame-loop behavior. The adapter is version-guarded, idempotent,
and runs through postinstall after npm ci. No warning interception, beta engine,
Three downgrade or deployment configuration change is involved. Review/remove
this adapter when adopting a stable upstream Timer implementation.

Restart an already-running development server once so its cached vendor modules
pick up the corrected renderer. The latest follow-up has not been browser-tested,
in keeping with the owner's request to inspect the development site themselves.
