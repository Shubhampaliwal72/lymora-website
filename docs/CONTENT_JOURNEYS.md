# Secondary-page content journeys

Shared with the existing Glass Network foundation; no new dependencies, pages,
installer URLs, release claims or deployment settings.

SectionNavigation retains native anchors and browser history. A measured,
pointer-transparent indicator moves between real links. ResizeObserver handles
the guide's vertical/two-column layouts and horizontal product/download menus.
The requested destination stays selected during native smooth scrolling; wheel,
touch and reading keys resume scroll tracking. A 240ms individual translate
settles the destination heading without replacing GSAP/Motion transforms.
Reduced-motion navigation remains static. Listeners, observers, timers and the
arrival animation are cleaned up. Links still work with JavaScript disabled.

Downloads adds only anchors to existing Windows, future-platform, release-note,
installation and help sections. Actual installer data still comes exclusively
from the existing public-links configuration. No binaries or release metadata
are changed. The page menu has extra anchor clearance beneath the shared header.

experience.css supplies shared hierarchy, numbered feature definitions, connected
installation steps, privacy landmarks and release facts. PageRevealMotion adds
small reversible entrances to secondary-page blocks and fills setup guide lines
as they are read. Long paragraphs retain normal markup. DocumentationMotion now
honors shared pause preferences and restores its landmarks when stopped.

Verification: lint, typecheck, build, verify:export and the documentation browser
suite pass. The suite covers sliding selection, exact responsive alignment,
rapid clicks, native Back/hash history, keyboard activation, 320/375px mobile,
both themes, reduced motion, native no-JS FAQ, all secondary-page captures, sticky
menu clearance and the existing verified Windows download. The export contains
744 valid local references across eleven HTML documents. Browser verification
uses software WebGL and is not a hardware frame-rate measurement.

Preview PNGs are local under .verification/content-*.png. Captures are excluded from Git.
