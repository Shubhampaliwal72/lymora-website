# LYMORA — AI WEBSITE ANIMATION & DESIGN IMPLEMENTATION RULES

**Purpose:** Permanent project instructions for an AI coding assistant working on the Lymora public website.  
**Scope:** Existing Next.js App Router + React + TypeScript static website hosted on Cloudflare Pages.  
**Status:** Planning instructions. **Do not edit project files until the owner approves the proposed plan.**

## 0. Required operating procedure

1. Inspect the real repository before suggesting code. Identify package manager and lockfile, Next.js version, App Router structure, styling (Tailwind/SCSS), existing animations, fonts, logos, screenshots, build scripts, static export settings, and deployment configuration.
2. Treat the existing repository and actual brand assets as the source of truth. This file contains **approved design-direction reference values**, not proof of the current implementation. Report differences; do not silently overwrite established tokens.
3. Present an inventory, implementation plan, affected files, dependency versions, accessibility/performance risks, and validation commands. **Wait for explicit approval before modifying code.**
4. Implement in small reviewable phases. Explain the *why* of each architectural choice and animation to the owner, who is learning React/Next.js.
5. Do not invent features, product screenshots, user counts, security claims, release versions, or download URLs. Do not imply that Lymora currently has authenticated pairing or encrypted transport unless verified in code.

## 1. Product truth and design intent

Lymora is a Windows desktop LAN messenger with an Electron/React frontend, Go networking backend, and SQLite local storage. Its marketing site is separate: a **static Next.js site**. Lymora's differentiators to demonstrate are local-network device discovery, direct and group messaging, file sharing, offline-first operation, local message history, and polished desktop usability. **Do not depict or add voice/video calls, call buttons, camera/microphone controls, meetings, or screen sharing.** Do not claim internet is required for messaging. Do not introduce a server into the desktop messaging architecture.

Design target: **Lymora Ember** — premium, original, restrained futuristic technology aesthetic, warm charcoal and porcelain neutrals, orange used purposefully, generous whitespace, readable typography, elegant restrained motion. Use the **actual Lymora logo** supplied in the repository (faceted orange L/chat-dot motif); never recreate or substitute an invented logo. Avoid copying other brands' layouts or artwork.

## 2. Exact semantic color reference

Use semantic CSS custom properties; do not sprinkle raw colors through components. Confirm existing token naming and integrate instead of duplicating. The following are the established Lymora Ember design references:

### Dark — Ember Night

```css
[data-theme='dark'] {
  --canvas: #101114;
  --rail: #17191D;
  --sidebar: #1B1D22;
  --header: #1A1C20;
  --surface: #202228;
  --surface-raised: #272A30;
  --surface-hover: #2B2E35;
  --text-primary: #F5F4F2;
  --text-secondary: #B2B4BC;
  --text-muted: #9498A2;
  --border: #34363D;
  --accent: #F06423;
  --accent-hover: #FF7B3D;
  --accent-subtle: #3A251C;
  --button-primary: #B8430D;
  --button-primary-text: #FFFFFF;
  --message-incoming: #282A30;
  --message-outgoing: #A83A0C;
  --text-on-outgoing: #FFFFFF;
  --focus-ring: #FF925A;
}
```

### Light — Warm Porcelain

```css
[data-theme='light'] {
  --canvas: #FAF9F7;
  --rail: #F5F3F0;
  --sidebar: #FFFFFF;
  --header: #FFFFFF;
  --surface: #FFFFFF;
  --surface-raised: #F2F0ED;
  --surface-hover: #EBE8E4;
  --text-primary: #252321;
  --text-secondary: #625D58;
  --text-muted: #746E68;
  --border: #E5E1DC;
  --accent: #C7470B;
  --accent-hover: #A93605;
  --accent-subtle: #FFF0E5;
  --button-primary: #B8430D;
  --button-primary-text: #FFFFFF;
  --message-incoming: #F0EEEB;
  --message-outgoing: #B8430D;
  --text-on-outgoing: #FFFFFF;
  --focus-ring: #B8430D;
}
```

**Important:** These are the desktop design-direction tokens. Adapt them to the website's existing token architecture and verify contrast in context. Do not assume every orange value is legible for small text. Add necessary semantic values for error/success/disabled/overlays using contrast-tested colors; document additions. Preserve both light and dark modes if supported by the site. Respect `prefers-color-scheme` only if consistent with existing theme settings.

## 3. Animation stack and division of responsibility

- **Motion for React** (`motion`, imported from `motion/react`): React component entrances, hover/tap, simple view-triggered reveals, menus, and state transitions.
- **GSAP** (`gsap`) + **@gsap/react**: complex sequencing, cinematic hero entrance, coordinated visual choreography.
- **GSAP ScrollTrigger** (bundled with GSAP): scroll-controlled showcase animations when Motion's `whileInView` is insufficient.
- These are npm dependencies, **not VS Code extensions or ChatGPT plugins**. Check the installed versions and official docs before implementing. Do not add Rive, Spline, three.js, Lottie, or other packages without explicit approval.
- **Never animate the same element/property simultaneously with both GSAP and Motion**; assign clear ownership. Prefer CSS for trivial hover color transitions.
- Avoid blanket global selectors. Scope GSAP selectors with `useGSAP(..., { scope: containerRef })`, or use refs. Register necessary GSAP plugins once in a client-safe module. Ensure cleanup through `useGSAP` context.
- No `window`/`document`/`matchMedia` access at module evaluation time during SSR. Components using animation hooks require `'use client'`; keep route/layout Server Components wherever possible.
- Prefer transform/opacity over animating layout properties. Use `will-change` sparingly and remove persistent hints if unnecessary.

## 4. Mandatory rules — especially the five non-negotiables

1. **Do not animate everything.** Each motion must communicate hierarchy, interaction, or a product story. Avoid perpetual glows, bouncing UI, excessive parallax, autoplay audio, and distracting effects.
2. **Do not let GSAP and Motion fight over the same element.** One animation engine owns each transform/opacity property on a given node. Nested wrappers may be used when responsibilities are explicitly separated.
3. **Respect reduced motion.** Honor `prefers-reduced-motion: reduce` across Motion, GSAP, CSS keyframes, smooth scrolling, and any canvas/SVG motion. Replace large movement with static or minimal nonessential fades; content must remain visible without JS or animation.
4. **Mobile and performance first.** Validate touch interaction, viewport sizes (320px and up), layout shifts, low-power devices, and slow networks. Do not pin large sections or render expensive 3D scenes by default. Lazy-load below-the-fold assets and noncritical code; ensure critical CTA works immediately.
5. **Preserve static hosting.** Do not add runtime server dependencies, Node-only APIs in the browser, server actions, dynamic SSR, or API routes requiring a Node server unless approved. Maintain the existing Cloudflare Pages static export/build behavior.

## 5. Accessibility, usability, and content safeguards

- Maintain semantic heading order, descriptive links, keyboard navigation, visible focus, and logical tab order.
- Contrast targets: WCAG AA 4.5:1 for normal text and 3:1 for meaningful UI boundaries/large text as applicable. Test actual foreground/background combinations.
- Interactive items must remain usable without hover, and buttons must perform real actions; use links for navigation/downloads.
- Animations must not delay access to core content, prevent scrolling, trap focus, or hide text from assistive technology.
- Provide alt text for actual product screenshots and meaningful illustrations. Decorative animation should be hidden from assistive tech where appropriate.
- Honor user theme preference and reduced-motion preference on initial render; avoid hydration mismatch and flash of incorrect theme.
- Never animate fake messages implying real customer data. Demo chat content must be clearly illustrative; don't expose personal information.
- Avoid misleading claims about encryption, verified identity, enterprise certification, compatibility, pricing, and release availability.

## 6. Recommended site sections and animation behavior

1. **Header/navigation:** restrained background transition, keyboard-accessible mobile menu, no intrusive motion.
2. **Hero:** real logo, truthful headline (e.g., “Stay connected. Even without the internet.”), clear Windows download CTA. Use a short GSAP entrance sequence for heading/subheading/CTA; reduced-motion static fallback.
3. **LAN connection illustration:** simple SVG/CSS or React visualization of peer-to-peer connections; orange signal travel only when motion is allowed; no fictitious central messaging server. Prefer lightweight DOM/SVG over 3D.
4. **Real desktop showcase:** actual approved Lymora screenshots, lazy-loaded; one subtle ScrollTrigger reveal or controlled sequence. No invented voice/video icons.
5. **Features:** Motion `whileInView` with modest offset/opacity and stagger, once per visit; static if reduced motion.
6. **How it works:** three understandable steps: install, discover local peers, message/share. Ensure no claim of automatic secure pairing.
7. **Download:** link to verified, owner-approved release asset only; show version/date/checksum only when sourced from actual release pipeline.
8. **Footer/support/privacy:** no gratuitous animation; clear support and privacy links.

Do not build all sections at once. Prefer a minimal, polished first pass and iterate with real screenshots.

## 7. Implementation architecture

- Keep reusable components under the repository's existing component conventions (e.g., `src/components/animations/`). Do not force a new folder hierarchy if one already exists.
- Use strict TypeScript. No `any` or suppressed lint errors without documented justification.
- GSAP example pattern: client component, `useRef`, `useGSAP`, `gsap.context` cleanup via hook, `gsap.matchMedia()` or media query guard, scoped selectors.
- Motion example pattern: client component, `motion` and `useReducedMotion` from `motion/react`; `initial`, `whileInView`, `viewport`, and sensible `transition`.
- Ensure hero text is present in server-rendered HTML where feasible; progressive enhancement rather than animation-dependent content.
- Preserve existing Next.js `next/image` usage, remote-image policies, metadata/SEO, font loading, and route behavior.
- Avoid giant client-side wrappers around the whole website; client boundaries should be small.
- Document when/why GSAP is necessary instead of Motion or CSS alone.

## 8. Required verification and quality gates

Before calling a phase complete, run the project's actual commands (inspect `package.json`; don't assume npm if lockfile indicates pnpm/yarn):

- TypeScript type check, lint, and production build/static export.
- Run site locally and verify both light and dark themes.
- Check desktop, tablet, 375px mobile, and narrow 320px widths; no horizontal overflow.
- Test mouse, keyboard, touch, reduced-motion mode, and disabled animations/JS where feasible.
- Check scroll behavior, animation cleanup on route changes, and React Strict Mode development behavior.
- Audit Core Web Vitals (especially LCP, CLS, INP) and bundle size; avoid heavy first-load animation scripts.
- Check Chrome/Edge and at least one additional browser where possible.
- Verify download URLs, navigation, SEO metadata, and Cloudflare Pages static deployment remain functional.
- Verify no new desktop app features or Go/SQLite backend changes were introduced.

**Acceptance:** No console errors, no hydration warnings, no missing assets, no regressions, no inaccessible hidden content, no layout shift caused by entrance animations, and no unapproved dependencies.

## 9. Phased workflow and deliverables

**Phase 0 — Audit (no changes):** List existing files, package versions, actual design tokens, logo assets, screenshots, build/deploy scripts, conflicts, and proposed changes. Explain plan in beginner-friendly language. **Stop and request approval.**

**Phase 1 — Foundation:** Install/verify dependencies, theme token integration, shared motion constants and reduced-motion utilities. Verify build. Request review.

**Phase 2 — Hero:** Implement accessible, responsive hero entrance and actual download CTA. Verify build, mobile and reduced motion. Request review.

**Phase 3 — Showcase:** Add truthful LAN SVG animation and actual screenshots with ScrollTrigger where warranted. Verify performance and no overlap between libraries. Request review.

**Phase 4 — Features/navigation:** Add restrained Motion interactions and mobile navigation. Verify keyboard, touch and theme contrast. Request review.

**Phase 5 — Release readiness:** Audit performance, accessibility, static deployment, release links, screenshots and regression tests. Provide a concise change log and manual test instructions.

At every phase report: **files changed, reasons, exact commands run/results, unresolved issues, screenshots/previews if available, and what the owner should verify**. Never claim tests passed without running them.

## 10. Copyable initial instruction to the coding assistant

> Read `LYMORA_AI_ANIMATION_RULES.md` fully before touching code. Inspect the actual Next.js website repository and identify any differences from the documented Lymora Ember design reference. Audit the existing animation libraries, theme, assets, package manager, and Cloudflare static build. Return a phase-by-phase file-level plan with risks and testing commands. Do not install packages, edit code, or add dependencies until I approve Phase 1. Explain each recommendation so I can learn.
