# Documentation reading experience

Scope: /products/lan-messenger/docs/ only. Other product routes, the homepage,
header, shared animation policy, dependencies and deployment configuration are
unchanged.

The existing guide facts and all seven original questions remain. The new page
uses a five-step setup timeline, direct-PC network diagram, separate direct/group
explanations, keyboard hints, a choose/review/send sequence and five diagnostic
checks. Numbered local navigation retains all six existing anchors and its active
reading indicator. Longer copy has a comfortable line length. The desktop
ambience control stays available in compact form clear of the guide index.

DocumentationMotion owns only small landmark entrances through Motion and a
scoped IntersectionObserver. Unobserved/static reading content starts fully
visible. The shared GSAP heading splitter still skips reading pages.

DocumentationFaq progressively enhances native details/summary disclosures.
Motion owns measured answer height and opacity; CSS owns the control rotation
and active surface edge. Rapid toggles stop the old animation and use unique
completion tokens so stale completions cannot close a newly opened answer.
Settled answers return to auto height for responsive text. Cleanup restores a
usable native disclosure during unmount/Fast Refresh. Search is client-enhanced;
without JavaScript, no inactive search control is shown and all questions remain
in static HTML with working native disclosure controls.

Files:
- src/app/products/lan-messenger/docs/page.tsx
- src/app/products/lan-messenger/docs/documentation.css (route-scoped, direct import)
- src/components/documentation/DocumentationMotion.tsx
- src/components/documentation/DocumentationFaq.tsx
- scripts/verify-documentation-ui.mjs and the existing browser harness

Validation includes lint, typecheck, production build/static export and the
focused documentation browser suite. Run after building:
node scripts/verify-network-motion.mjs --docs-only

Browser coverage: dark/light, 1440/375/320px, six navigation anchors and sticky
header clearance, keyboard open/close, real closing animation, nine rapid
reversals, multiple open answers, search/no-results/reset, open-answer resize,
no-JavaScript reading/disclosures and another route's unaffected shell.
Local captures live in ignored .verification; no uploads or deployment.

Verified: lint, typecheck, build and export all passed (11 HTML documents /
717 local references). The focused Edge 156 suite passed in both themes and
1440/375/320px layouts. The actual running Next development preview also
loaded the scoped stylesheet, hydrated and animated the FAQ and retained live
background packets without console errors. The owner authorized committing and
pushing this checkpoint on dev, then merging it into main.
