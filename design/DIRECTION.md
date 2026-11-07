# Lymora / Ember Signal

Approved concept, 2026-11-06. The header/hero code phase is now implemented; see ../HERO_IMPLEMENTATION.md for current verification. The remaining sections below still describe the future design.

Figma: https://www.figma.com/design/0nOAeu9ClPbL5Zrc4iIkeX

## The idea

**Close by. Connected. No internet needed.**

Make a local connection feel tangible. A small constellation of equal PCs and a
single orange signal explain the product before a visitor reads a feature list.
Large quiet typography and deliberate spacing make the message clear. The
actual Lymora logo remains unchanged. The network is not drawn as a central
messaging server, cloud service, or mobile/calling product.

The website is independent of the Electron/Go application. Its current system
font is a setup placeholder. The concept proposes Manrope headings and DM Sans
body text; both were available in Figma, and their Google Fonts source includes
SIL Open Font Licence files. Self-host a small subset only during implementation:
https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt

## What is in Figma

- Desktop / Ember Night: 1440px, node `8:129`.
- Desktop / Warm Porcelain: 1440px, node `8:368`.
- Mobile / Ember Night: 390px, node `8:257`.
- Mobile / Warm Porcelain: 390px, node `8:486`.
- Native 3.2-second motion study: node `10:38`, below the page concepts.
- Theme controls navigate between the corresponding dark/light concepts.
- Original logos and explicitly labelled renderer-demo captures are placed in
  a source-assets area, not invented or redrawn.

The starter Figma plan permits one variable mode per collection. To stay within
that plan, the file uses a palette collection and separate dark/light semantic
collections rather than requiring an upgrade. The 22 semantic variables alias
19 palette values. Repeated actions reuse the discovered Simple Design System
button component with Lymora-specific font, fill and sizing overrides.

The page layouts are editable text/frames/vectors/instances, not flattened
website screenshots. Product screenshots are content inside the showcase.
They show the real desktop renderer with test data, not actual customer chats.
They require replacement or explicit marketing approval before publication.
The owner explicitly approved uploading the two logos and two demo captures to
Figma. No personal chat history was uploaded.

Canva was used to inspect the existing horizontal brand source (design
`DAHZLH1-kOA`); its actual supplied PNG exports were preserved. No new Canva
subscription, premium stock content or generated replacement logo was needed.

## Homepage progression

1. Header: original logo, product/how-it-works/docs navigation, theme and Windows
   download destination. Mobile uses 44px menu/theme targets.
2. Hero: the simple product promise, local-network illustration and exploration
   action. The diagram is illustrative, not live device telemetry.
3. Desktop showcase: a real renderer demo and a clear test-data caption.
4. Feature chapters: group conversations, reviewed file/folder sharing and local
   history/search. No invented roadmap promises or social proof.
5. How it works: install on PCs, discover reachable local devices, message/share.
6. Privacy: factual protection and its limits, with source references below.
7. FAQ: local-network requirements, Windows scope and no voice/video calling.
8. Download destination and footer: documentation, releases, privacy and support.

Download labels in Figma indicate intended destinations. There is no live
installer link in the website yet; release assets/version/date/checksum must be
verified before connecting the actual download action. Do not fabricate them.

## Sitemap for the implementation

| Route | Purpose |
| --- | --- |
| `/` | Product story, showcase, features, how it works and FAQ. |
| `/download/` | Verified Windows release asset and installation requirements. |
| `/docs/` | Getting started, discovery, direct/group chat and file sharing. |
| `/releases/` | Actual release history sourced from approved release data. |
| `/privacy/` | Separate website privacy and desktop data/security explanation. |
| `/support/` | Help, known issues and an owner-approved contact destination. |

These routes are planned, not implemented. No fake email address or support
submission endpoint should be published. Future Lymora tools can use their own
routes/subdomains without changing the brand domain.

## Color and readability

Use the supplied Ember reference tokens through semantic variables. Do not
scatter literal colors through React components. Current setup only defines
background/foreground; integrate the full semantic set in the next code phase.

| Pair | Dark contrast | Light contrast |
| --- | ---: | ---: |
| Body / canvas | 17.18:1 | 14.88:1 |
| Secondary text / canvas | 9.12:1 | 6.19:1 |
| Orange text / canvas | 5.89:1 | 4.60:1 |
| White / primary button | 5.46:1 | 5.46:1 |

These are computed sRGB pairs, not a complete accessibility certification.
Decorative hairlines are not relied on as the only control/state indicator.

## Motion storyboard and ownership

| Moment | Owner in website | Treatment | Reduced motion / mobile |
| --- | --- | --- | --- |
| Hero arrival | GSAP + useGSAP | One short coordinated entrance, modest 16px offset, no delayed access to controls. | Static visible content; no transform. |
| LAN signal | GSAP SVG sequence | One direct signal, then receipt. Play on entry; explicit replay can restart it. No perpetual loop. | Static peer diagram; mobile keeps the lightweight SVG. |
| Desktop showcase | GSAP ScrollTrigger | A short reveal, small scale/translation range, no long pinned scrolling. | Static image or minimal fade, with the same engine owning the node. |
| Feature chapters | Motion for React | Small once-only reveals, staggered only enough to guide reading. | Static content or short fades. |
| Menus / component states | Motion for React | Accessible state transitions and restrained hover/tap feedback. | Reduced movement, full keyboard/touch access. |
| Theme colors / simple hover colors | CSS | Short color transitions on separate properties. | Transitions removed where appropriate. |

Never let GSAP and Motion control one property on the same element. Scope
selectors with refs/useGSAP, clean up ScrollTrigger/context on unmount, and keep
route/layout components server-rendered where possible. Content stays visible
without JavaScript. No scroll hijacking, autoplay audio or unapproved 3D engine.

The Figma study has real native OPACITY and TRANSLATION_XY tracks. A signal
travels to the second PC over 0-1.3s; the return receipt uses 1.7-3.2s. The
timeline is 3.2s. This is a communication explanation, not a latency benchmark.
Tracks and timeline were read back successfully. Video/frame rendering was not
run because a local frame extractor was unavailable; do not claim playback
was browser-tested or that GSAP is implemented in the website already.

## Source verification for product claims

The supplied guides mention SQLite. The current desktop source persists JSON;
no database claim should be placed in marketing copy without rechecking.

Read-only inspection verified the privacy wording against:

- `my-new-app/backend-go/internal/security/tls.go`: TLS 1.3-only config,
  guarded Dial/Accept and expected device-key checks.
- `my-new-app/backend-go/internal/security/automatic.go`: first-connection
  key learning, `rememberDevice`, persisted keys and changed-key rejection.
- `my-new-app/backend-go/cmd/messenger/security.go`: production security wiring.
- `my-new-app/backend-go/internal/storage/persistence.go`: local JSON persistence,
  without at-rest encryption.

The concept therefore explains encrypted connections and remembered keys, while
explicitly stating that first use does not independently verify a person's
identity, LAN discovery is visible, and local history is not encrypted on disk.
It does not claim verified people, enterprise certification, total anonymity,
cloud backup, or voice/video calls.

## Next code phase, after concept approval

- `src/styles/tokens.css`, `src/app/globals.css`: semantic Ember themes and
  accessible focus/reduced-motion defaults.
- `src/components/site/`: reusable header, mobile navigation, footer and theme
  controls. Keep client boundaries limited to interactive components.
- `src/components/sections/`: hero, LAN visual, showcase, feature chapters,
  how-it-works, privacy summary and FAQ.
- `src/components/animations/`: scoped HeroMotion, LanSceneMotion and
  ShowcaseMotion; shared Motion reveal helper on separate nodes.
- `src/lib/motion.ts`: shared timings/easing and reduced-motion decisions.
- `src/content/`: verified product/FAQ content and reviewed release metadata.
- `public/brand/`, `public/media/`: original brand exports and approved optimized
  screenshots. Keep licence/provenance notes with assets.
- `src/app/layout.tsx`, `src/app/page.tsx`: server-rendered shell, metadata and
  composed homepage; replace setup noindex only during public release review.

Start with the theme foundation and hero, verify them, then add the showcase.
Do not build every route at once or add more animation packages speculatively.
Keep `output: "export"` and `out/` for Cloudflare Pages. Installer files larger
than Pages' per-file limit belong on a verified release host, not in the website
bundle. Do not deploy or connect `lymora.in` until separately approved.

## Review and verification

Figma review checked all four frame widths, font families (Manrope/DM Sans),
246 editable text layers, original image placement, button text fit, 44px theme
controls, mobile menu affordances and theme links. Initial multiline text
sizing and button wrapping defects were corrected. Final structural checks
reported zero horizontal-overflow/button issues and no vertical stack overlaps.
The full dark/light compositions and affected hero/header controls were reviewed
visually after fixes. Source assets remain in their dedicated area.

Only design files were added to the website in this phase. The existing setup
lint/typecheck/static-export results are in SETUP_VERIFICATION.md; they were not
rerun as proof of an unimplemented website. Production browser QA, keyboard/touch
flows, 320/375px layouts, reduced-motion behavior, no-JS fallback, route cleanup,
Core Web Vitals and actual download links remain next-phase acceptance checks.
Performance targets: LCP <=2.5s, CLS <=0.1 and INP <=200ms at p75; these are targets,
not measured results. Preserve clean static export and audit emitted JS/media.

## Figma quota note

After the concepts, motion tracks, button fixes and structural checks were
saved, the Starter-plan MCP limit prevented an additional full-page light-theme
capture. The earlier full light composition and final affected hero/header
captures were reviewed. Further Figma edits/captures require available quota;
no paid upgrade was initiated. The saved concept file and local state remain
available. This does not claim an additional screenshot was generated.
