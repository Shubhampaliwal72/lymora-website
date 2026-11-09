# Header, live logo and platform availability

All implementation is in the independent website. No desktop-app changes, DNS,
publishing or deployment is included.

## Current behavior

- HeaderFrame observes one document marker and compacts after 64 pixels of scroll.
  Reserved header height prevents document shifts. Observers clean up on unmount.
- The owner clarified that the orange logo must animate automatically rather than
  only on hover. BrandSymbol now uses a repeating 8-second CSS cycle: a slow, continuous 360-degree rotation around
  its own vertical axis, with a masked reflection. It has no lateral tilt, scale
  change or translation, and returns to its original orientation each revolution.
  Only the original PNG symbol moves. Wordmark and tagline remain stationary.
- The owner explicitly requested this logo motion even with OS Reduced Motion.
  This is a logo-only exception. Menu, navigation and page-arrival preferences
  remain independent. No Windows settings are changed.
- Logo motion pauses when the document is hidden or the symbol is offscreen.
  The existing keyboard-accessible Pause/Resume ambience control pauses both the
  logo and reflection. No additional public controls or dependencies are added.
- Desktop links are centered; the existing mobile disclosure replaces them at
  1100px and below. Escape, outside clicks, focus departure, route changes and
  breakpoint changes close the appropriate menus. Existing real URLs, download
  CTA, theme toggle, artwork, typography and both themes remain.
- Simple DOM transitions use motion/react-mini. In Motion 14, the full useAnimate
  hook itself calls useReducedMotion and emits a development warning, even when
  the application has removed its own direct useReducedMotion call. The mini
  entry point avoids that hook; MobileMenu still checks the OS preference before
  playing its entry movement. Existing product-preview button motion has an
  explicit local MotionConfig matching the owner's established brand policy.
- No header-edge beam is introduced. Reduced transparency uses solid surfaces.

## Downloads

Windows is the only available installer. The owner approved macOS and Linux
Coming soon information only on /downloads/. Those panels have no download
controls, invented release dates, system requirements or URLs. The verified
Windows release manifest is unchanged.

## Three.js compatibility

R3F 9.8.2 constructs the deprecated THREE.Clock internally. The version-guarded,
idempotent scripts/r3f-timer-compat.mjs install adapter replaces only that internal
constructor in its three runtime distributions with a THREE.Timer-backed clock
interface. It preserves auto-start, start/stop, elapsed seconds and manual frame
loop fields. postinstall applies it after npm ci; no console warnings are hidden,
no beta renderer is installed, and no Three version is downgraded. Review/remove
the adapter when upgrading R3F to a stable upstream Timer implementation.

## Verification

The checks below passed for the automatic flip before the final 8-second,
vertical-axis-only timing adjustment. That final CSS adjustment has not been
retested. Checks covered the actual static export and the existing Next.js
development server at http://127.0.0.1:3100. The user's server was not restarted.

- npm run lint, npm run typecheck, npm run build and npm run verify:export.
- node --test scripts/r3f-timer-compat.test.mjs: four tests for elapsed seconds,
  start/stop/restart, writable manual-frame timestamps and idempotent installation.
- node scripts/verify-network-motion.mjs --logo-only: natural playback over two
  iterations, both themes, both OS motion modes, 320/375/1440px, real 3D startup,
  rotation/return/reflection, stationary text, manual and visibility pause/resume.
  It samples the real timeline without hover, seeking or changing OS settings.
- --header-only: centered links, compaction, theme, active destinations, keyboard
  menus, mobile bounds and navigation through 320/375/768/1024/1100/1101/1440/1920px.
- --docs-only: guide navigation, disclosure transitions, keyboard/search behavior
  and mobile layout after switching its DOM transitions to Motion mini.

The browser harness fails on console/runtime errors, missing assets, external
requests, and either reported Clock/reduced-motion warning. Development runs use
LYMORA_TEST_URL=http://127.0.0.1:3100 and write separate results in the ignored
.verification/local-server/ directory. Static-run measurements, reports and
captures are under .verification/. This uses headless Edge/software WebGL and is
not a physical-device FPS benchmark or a claim of testing every browser.
