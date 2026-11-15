# Glass interaction finish

The existing centered copper/blue hero and three-PC preview are preserved.
This pass uses existing GSAP, native Web Animations and shared semantic materials;
no dependency, deployment or download configuration changes.

Research: GSAP SplitText (https://gsap.com/docs/v3/Plugins/SplitText/) supports
accessible word splitting and responsive introductory lines. We keep selective
word depth on landmark headings, stable long reading copy and the native-scroll
three-phrase reel with full reading holds. Native reduced motion preserves all
three phrases without the reel. The footer wordmark has an orange shade sweep.
MDN backdrop-filter (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
explains why a translucent fill is necessary: blur affects the scene behind the
surface, not foreground letters. Header frost stays isolated beneath its labels
so dropdowns can still blur the underlying page independently.

- header.css + network-motion.css: exclude header actions from legacy hover rules
  at their source; avoid production CSS optimization discarding individual resets.
- immersive-hero.css: remove both caption and next-section opening borders.
- experience.css: shared rounded glass tabs/menu/footer refinements; controlled
  2px header edge, orange wordmark, chapter contrast, hierarchy and header ripple.
- HeaderRipple.tsx + layout.tsx: one delegated click listener, pointer/keyboard
  origins, native link behavior, no navigation delay, OS-reduced fade, cleanup.
- ScrollStatement.tsx: separate track and phrase transform ownership, shallow
  perspective settles before each hold, faster scrub catch-up in both directions.
- ParticleBackdrop.tsx + particle-shaders.ts: responsive pointer easing and a
  slightly fuller local wisp using the existing particle budget/renderer.
- verify-experience-ui.mjs: real-browser hover stability, ripple lifetime, rounded
  tab material, no opening divider, reversible text, themes and route checks.

Tune glass using surfaces.css semantic tokens. Header edge width/brightness and
orange lettering shades live in the final section of experience.css. No opacity
or filter is placed on page copy. Focus outlines remain visible. All interaction
layers are pointer-transparent; reduced transparency and forced colors retain
solid surfaces and readable labels. Screenshots remain the original opaque assets.

Verified on the real static export (15 November 2026): lint, typecheck, production
build and verify:export passed. The experience browser suite verified header
hover stability, keyboard/programmatic and real-link click ripples, cleanup,
Downloads navigation/back history, rounded tabs, reversible heading and footer
lighting, all nested routes, 320–3840px containment and reduced motion. The full
motion suite passed complete forward/reverse phrase holds at 320/375px, all setup
steps, product screenshot tabs and native dialogs. The glass suite passed all
eight routes in both themes, mobile/desktop menu keyboard behavior, reduced
transparency and sampled base copy contrast >=5.18:1. No runtime/hydration or
missing-asset errors. Browser rendering uses software WebGL; this is not a
hardware frame-rate benchmark. Changes are left uncommitted for owner review.
