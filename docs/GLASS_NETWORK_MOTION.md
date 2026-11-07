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
- design/glass-network/captures/Lymora-Homepage-mobile-Full.png (375 x 6694)

Hero-only images and sectional review captures are also saved. The PNG folder
and .verification outputs are ignored by Git and never added to public/.
Full-page PNGs freeze one instant of an animated page. Fixed wallpaper/header
appear in their browser-captured position, not repeated down the image. Open the
local site to assess moving light and scroll timing. No third-party upload occurs.
