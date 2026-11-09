# Glossy UI refinement

Scope: the independent Lymora website. No desktop application, hosting,
dependency or motion-policy changes.

## Direction and changes

The existing menus used small plain links and translucent panels with weak
separation from the live hero. The floating ambience control also belongs to a
higher root stacking context than the site shell, allowing it to overlap a tall
mobile menu. Larger overlay areas made this pre-existing layering issue visible.

The updated design uses restrained reflected light, fine top/bottom highlights,
neutral glass and softer shadows. Shared glass-panel styling reaches the existing
product, support, download and footer surfaces across routes without adding new
sections. Menus and dialogs use denser, solid-base surfaces with glass reflections:
text from the moving page cannot bleed through their reading area. The page is
dimmed only while navigation is open; foreground text is never filtered.

NavigationItem is shared by desktop and mobile. Its normal text remains a single
accessible label; CSS ::first-letter supplies the orange initial, with neutral
gray for the remaining letters. Small framed icons, clear descriptions and
separated link groups support scanning. Hover feedback stays on text/icons,
without filled row backgrounds. Products and Resources remain native disclosures;
Escape/outside close, tab-away close and breakpoint cleanup preserve usability.

Screenshot inspection remains a native dialog with top-layer focus handling.
Its heading and close control use the glass treatment; the original screenshot
sits on an opaque canvas. No screenshot pixels are edited. The background gets a
subdued, blurred backdrop and page scrolling stays locked while the dialog is open.
The ambience button is hidden during menu overlays to avoid obstructing links;
the animation itself continues and the control returns when navigation closes.

## Files and ownership

- src/styles/surfaces.css: semantic light/dark surface tokens, shared reflections,
  menu/dialog separation, overlay scrim and solid accessibility fallbacks.
- src/app/layout.tsx: import the shared surface layer directly after globals.css.
- src/components/site/NavigationItem.tsx: reusable destination markup.
- src/components/site/SiteHeader.tsx: grouped Products/Resources content.
- src/components/site/MobileMenu.tsx: reuse destinations and group touch links.
- src/components/site/NavDisclosure.tsx: controls IDs, tab-away and breakpoint cleanup.
- scripts/verify-glass-ui.mjs and verify-network-motion.mjs: focused local browser
  checks; run node scripts/verify-network-motion.mjs --glass-only after building.
- scripts/verify-premium-ui.mjs: sample moving packets using a bounded condition
  wait, allowing the existing intentional arrival pause between packets.

CSS owns the desktop dropdown and native-dialog entrance (200/220 ms). Motion
continues to own the mobile-panel entrance. GSAP/R3F remain untouched. Blur is
never animated, and no full-page content filter is introduced. Desktop glass is
selective; mobile keeps ordinary panels cheap and restricts modest blur to the
header and open overlays. Reduced transparency uses solid surfaces, and forced
colors restores system colors. Existing always-on brand motion and reduced
navigation feedback remain separate policies.

## References

Original Lymora design; navigation grouping references only:
- https://linear.app/
- https://vercel.com/
No third-party artwork, copy, components or dependencies were imported.

## Validation

Verified in Edge 156 against the local static export:
- npm run lint and npm run typecheck: passed.
- npm run build: passed; all routes remain static.
- npm run verify:export: passed, 11 HTML documents and 715 local references.
- node scripts/verify-network-motion.mjs --glass-only: passed, desktop and
  320/375/768px touch menus, compact 901px desktop, both themes, real dialog focus
  and scroll restoration, overlay stacking and reduced-transparency fallback.
- npm run verify:motion: passed, 320-3840px layout, packet motion, vertical phrase
  holds, reversible LAN connector, all screenshot views and keyboard interaction.
- npm run verify:navigation: passed, eight client routes, repeated/failed/slow
  navigation, browser history, lightweight scene fallback and live background.

Visual review checked dark/light dropdowns, the narrow mobile menu and the real
screenshot dialog. Browser captures are local and ignored under .verification.
Software rendering checks are not a hardware FPS measurement. No new animation
engine, dependency or deployment setting was added. The verified changes are
committed on dev at the owner's request. Nothing was uploaded or deployed.

## Development import recovery

The existing dev server returned HTTP 500 for the nested surfaces.css import even
though that file existed and fresh production builds passed. The original edit
introduced the CSS import before creating the new file. The root layout now
imports surfaces.css directly after globals.css so Next tracks it as its own CSS
module instead of resolving it through the stale Tailwind import dependency.
The stylesheet content and motion policy are unchanged.

Recovery verification: the existing local dev server returned HTTP 200 without
a restart; an actual browser loaded both themes, opened the glossy menus,
observed moving packets and applied/restored a CSS edit through Fast Refresh.
Lint, typecheck, fresh production build/export and the focused glass UI suite
also passed after the import correction.
