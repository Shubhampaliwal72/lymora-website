# Lymora Glass Network foundation

The owner requested direct implementation after supplying the new foundation
brief. That direct request supersedes the attachment's plan-only approval gate.
No publishing, repository push or desktop application changes are authorized.

## Audit and reuse

The previous homepage contains a strong finite 3D LAN scene but only two small
supporting sections. Its navigation points almost entirely into that one page;
it lacks product information depth, documentation and a broader brand identity.
Keep the working R3F meshes, path choreography, semantic Ember/Porcelain palette,
local fonts, reduced-motion hooks, original marks and eight sanitized captures.
The new shell and content extend these assets rather than discard Stage 1/2.

## Site map

- / : brand hero, first product, real app exploration, connection steps, use cases,
  resources and an honest Windows release destination.
- /products/ : directory containing only the real LAN Messenger product.
- /products/lan-messenger/ : overview, original screenshot tabs, everyday tools,
  requirements and product-specific documentation links.
- /products/lan-messenger/docs/ : onboarding, network basics, conversations,
  files, troubleshooting and FAQs.
- /products/lan-messenger/releases/ : explicitly pending verified release data;
  no invented version/date/installer/checksum.
- /downloads/ : availability and practical installation/first-launch guidance.
- /about/ : brand purpose and principles, without fictitious staff/products.
- /privacy/ : source-verified technical privacy/security boundaries.

Products, Explore, Resources and About form the desktop navigation. Products and
Resources use native details-based disclosures. Mobile retains a native disclosure
with grouped links, Escape/outside close and route-change cleanup. The header's
Get Lymora action opens real download-availability content.

## Visual direction

Ember Night and Warm Porcelain remain the palette. New semantic glass variables
control near-opaque panel colour, reflection, illuminated edge and restrained
shadow. Only selected navigation/showcase/footer surfaces use blur; small screens
and reduced-transparency preferences remove it. Content remains opaque/readable.

A floating, rounded header uses the owner's unmodified original mark with a
brand-level text label. The original full artwork stays unchanged in public/.
The asymmetrical hero reuses the actual 3D scene. The first-product section uses
an editorial 01 index; screenshot tabs lead to real unretouched UI. Numbered
connection instructions and use-case rows replace repetitive card grids. The
footer ends in a large typographic statement and glass navigation directory.

Open review.html after npm run dev for a single live desktop/tablet/mobile
preview frame. Switch themes using the actual website control. These are live
review viewports, not generated screenshots or proof that UI tests were run.

## Animation ownership and budget targets

- Shared SVG wallpaper in root layout: one lightweight environment across routes,
  seven visible direct paths and six computer/node representations. No second
  full-screen Three renderer is introduced.
- GSAP owns the continuous signal clock and throttles SVG drawing to at most
  24 updates/second. It also owns the small pointer wrapper transforms.
- GSAP ScrollTrigger owns a different outer wrapper's bounded vertical/rotation
  shift as the document scrolls. It cleans up/recalculates on route changes.
- Motion owns navigation and independent tab interactions. Existing R3F owns the
  foreground 3D scene, whose finite clock stays separate.
- Visible Pause ambience stops background animation. Hidden documents pause it.
  Existing capability hints gate it; mobile, reduced motion, Save-Data/slow links
  and low-power devices retain static SVG rather than an animation loop.
- Existing R3F module stays deferred; only the homepage mounts its scene. There
  are no new dependencies, fonts, remote media or third-party embeds in the site.
- Targets: one ambient loop, seven paths, no React state updates per animation
  frame, no animated content layout, no extra WebGL context for the wallpaper,
  and no backdrop blur on mobile. These are design limits, not measured FPS or
  field Core Web Vitals claims.

## Accuracy and validation boundary

Read-only desktop references: docs/SECURITY.md, internal/security/tls.go,
internal/security/automatic.go, internal/domain/attachment.go, fileQueue.ts,
onboarding NetworkStep.tsx and GroupWorkspace.tsx. Current transfers do not have
the obsolete 25 MiB cap; practical device/network/storage limits still apply.
TLS 1.3 and remembered keys are implemented; independent first-use human identity
verification and application-level history-at-rest encryption are not.

All actual UI images preserve their pixels and fictional-demo provenance.
The cropped gallery candidates remain excluded. No actual private history or
live device addresses are used. Screenshots and product capabilities are not
AI-generated. New Figma/Canva documents or remote uploads are not claimed; local
review files use existing approved original assets.

The owner will perform visual/browser acceptance. This pass runs code/lint,
static compilation and internal-link checks only. No deployment, DNS change,
release publication or automatic commit is performed.
