# Shared cinematic UI finish

The current owner request adds shallow 3D reveals, illuminated glass edges and a
more deliberate background composition. Existing content, navigation, release
links, real application captures and static deployment settings are preserved.
Seven homepage use-case/resource card frames become open editorial rows.

## Ownership and tuning

- experience.css: shared masked 1px copper edge. Decreasing --edge-angle moves it
  anticlockwise (12 seconds on controls, 18 seconds on the header). One observer
  enables animation only while a surface is visible. Cards light on hover/focus
  and the current connection step. Header frost keeps its independent layer, so
  nested dropdowns can still blur content behind them. Focus outlines remain.
- PageRevealMotion: GSAP owns inner heading words, selected introductory lines
  and the footer wordmark. Scroll reverses the reveals. Words are fully visible
  before the viewport center; long reading paragraphs, FAQ answers and dynamic
  screenshot descriptions are left to their existing owners. SplitText markup
  reverts on route/preference changes. Text is present before enhancement.
- HomeScrollMotion: outer editorial rows and screenshot frames, separate from
  inner words and Motion tab interactions. Normal document scrolling is retained.
- particle-composition.ts: measured section stops. x/y are viewport proportions;
  scale sets size; quiet multiplies existing route intensity. The hero is composed
  behind the PCs; editorial sections move toward available margins. Measurements
  refresh on resizing/layout changes and browser history restoration.
- particle-shaders.ts: existing ring/orb/galaxy targets, a small pointer-responsive
  cloud, then the original L silhouette at the footer. particle-logo.ts samples
  the existing transparent brand image; it never changes the original artwork.
  One viewport renderer and the existing 24,200-particle budget are retained.
- The footer divider now follows the content width and has its own spacing after
  the final page panel. The decorative wordmark fades from left to right and its
  highlight follows scroll progress. Theme scrollbars use shared semantic colors.

The saved Play/Pause website preference remains independent of Windows settings.
Reduced motion keeps static copy/scene and stops edge beams. Hidden tabs pause
rendering and edge motion; mobile retains the lightweight SVG fallback. Reduced
transparency and forced colors retain readable solid surfaces. No new packages,
paid assets, server routes or deployment changes were introduced.

## Verification

Run npm run lint, npm run typecheck, npm run build, npm run verify:export.
Browser suites use scripts/verify-network-motion.mjs with --experience-only,
--glass-only, --particles-only, --launch-only, --docs-only, --navigation-only;
the default suite also checks the existing scroll/connection story and 4K layout.
Reports and real browser captures are local under .verification and are ignored.
These headless Edge checks use software WebGL, not a hardware FPS benchmark.
