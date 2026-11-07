# Living Network concept review

Approved A+B planning package (C materials for light mode). Generated SVG/PNG
review files stay local and are intentionally excluded from Git. Start with review.html, or open the PNG files in
previews/ directly. Stage 1 of the website is implemented; the desktop app is unchanged.

- A: previews/01-ember-constellation-dark.png and -light.png
- B: previews/02-follow-the-message-dark.png and -light.png
- C: previews/03-connected-table-dark.png and -light.png
- Six-scene overview: previews/storyboard-overview.png
- Full animation, screenshots, performance and implementation plan: PLAN.md
- Actual capture sources and SHA-256 hashes: screenshot-provenance.json
- Structured scene/camera notes: storyboard.json
- Local preview verification: REVIEW_CHECKS.json

Recommendation: A's layered network scene with B's camera transition into the
actual app, and C's restrained material/light treatment for Warm Porcelain.
A+B is approved; implementation checkpoints are recorded under docs/.

The individual SVGs retain vector geometry/text and embedded original images;
the PNG previews and overview are for review, not production app screenshots.
No new screenshots or logos were generated with AI.

Figma: the connected Starter account blocked canvas access with an MCP quota
error. No new Figma frames were created. Native storyboard construction remains
pending; do not mistake the existing Figma link or local SVGs for completion.
Canva: the original brand design was inspected and an on-brand supporting-art
brief/reference prepared in the generation widget. Owner selection/start is
still required; no new Canva design or exported asset is claimed.

Verification: generator syntax checked; six hero/theme previews and six-scene
overview rendered with local fonts in Edge; review layout fits 390px. No missing
assets, page errors or external preview requests. The first local run requested a
favicon absent from the design server; the QA server was corrected to serve the
existing Lymora icon and the final run passed. Caption spacing was visually
reviewed and corrected. These checks do not test an unimplemented 3D runtime.
Those were design-review checks only. See docs/LIVING_NETWORK_STAGE1.md for
subsequent implementation verification.

Regenerate the design assets from the website root with:

    node design/living-network/build-concepts.mjs

This reads original local assets from the sibling desktop workspace and changes
only design artifacts in this folder. It does not install, build or deploy.
