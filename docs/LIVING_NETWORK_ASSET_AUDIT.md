# Desktop asset audit and isolated capture

Date: 2026-11-07. Desktop source: D:/my-projects/my-new-app (read-only).
Website: D:/my-projects/lymora. Stage 1 commit: 72a93bfbb71a83e88a189921bccf7028429d8b71.

## Reusable original material

- frontend/src/assets/brand/logo-dark.png and logo-light.png: original 1200 x 400 wordmarks, already reused unchanged.
- frontend/src/assets/brand/mark-dark.png and mark-light.png: original 512 x 512 marks. These two supplied files currently have identical SHA-256 hashes; no recolouring or replacement was performed.
- electron/resources/icon.png (1024 x 1024), tray-icon.png and tray-icon@2x.png: original desktop icons. Inspected by path; no need to copy Windows tray assets into a website hero.
- frontend/src/features/messaging/MessageBubble.tsx, MessageComposer.tsx, AttachmentCard.tsx and MediaGallery.tsx: actual bubble, composer, delivery and attachment presentation.
- frontend/src/features/groups/GroupWorkspace.tsx and frontend/src/features/diagnostics/NetworkDiagnostics.tsx: actual group and Network UI.
- frontend/src/styles/themes.css and related component styles: Ember Night and Warm Porcelain source of truth; used by the real renderer, not copied as website application code.
- frontend/tests/electron-smoke.cjs, groups-fixture.cjs, security-fixture.cjs, message-layout-smoke.cjs and expansion-ui-smoke.cjs: existing isolated renderer fixture patterns. No actual customer conversation store was opened.

Existing .codex-backup/frontend-smoke captures were inspected as test assets only.
Compact chats contain renderer-test wording/pending states. Earlier group captures
contain test local-edit wording; Network bento captures contain a connection-error
toast, and the earlier gallery has a missing-image/error state. None is used by
the current hero or copied into the current public product set.

## New captures from the existing unmodified UI

Rather than request new screenshots, an isolated website-owned Vite host serves
the existing desktop frontend source with its original React/Tailwind plugins.
Configuration is supplied directly: no desktop vite.config.ts build hooks run.
Vite caches, generated preload, Electron userData and screenshots stay under the
website's ignored .verification/product-captures directory. No Go process, LAN
socket/discovery, production Electron main, user database or existing preferences
are opened. Renderer requests are limited to the two owned loopback fixtures.
No uploads, application installation or desktop build occurs.

The existing test host is adapted in memory to a loopback HTTP/STOMP fixture.
Alex Morgan, Sam Rivera, Jordan Lee, Studio team and their short launch-review
conversation are fictional. Shared files are a tiny generated text note and the
owner's existing Lymora mark PNG. Network addresses are RFC 5737 documentation
values (192.0.2.x), never device addresses read from the machine. No person photos,
private files, hostnames or chat history are consumed.

All eight retained PNGs are unretouched renderer client-area captures at
1800 x 1020, in both original themes. Native Windows title-bar overlay controls
are outside these offscreen captures. No window controls are painted onto them.
The scene preserves the screenshot aspect ratio with letterboxing.

| View | Website files | Result |
| --- | --- | --- |
| Chats | public/media/product/chats-dark.png, chats-light.png | Clean fictional direct conversation; actual delivered/read indicator rendering. |
| Groups | public/media/product/groups-dark.png, groups-light.png | Clean three-member group with actual per-member delivery presentation. |
| Files | public/media/product/files-dark.png, files-light.png | Actual attachment card and loaded, bounded in-chat raster preview. |
| Network | public/media/product/network-dark.png, network-light.png | Actual connected-service UI with fictional peers/documentation addresses, no error toast. |

Automated capture checks passed: fictional contacts/messages, loaded image,
group list/history, fixture connection, no alert notifications or broken images,
no renderer console errors. The first capture attempt had an isolated Vite HMR
connection warning; the host's explicit ephemeral port and loopback websocket
allowlist were corrected, and the final run passed. All eight retained captures
were visually reviewed. Hashes and publication status are recorded in
LIVING_NETWORK_ASSETS.json. Owner visual review remains required before deployment.

These fixtures exercise actual UI, not an actual LAN transfer. Timestamps,
delivery states and acknowledgements come from fictional fixture inputs; they do
not measure speed, durability or physical network delivery. A group delivery
count does not mean every member read the message.

## Genuinely missing or rejected material

- A clean full-gallery capture: the current desktop viewer crops the square mark.
  Both new gallery candidates were rejected and removed from public/, while the
  clean in-chat image preview was retained. Fixing desktop gallery code is outside
  this read-only website task; do not retouch the screenshot to hide it.
- A dedicated, consistently framed Sending -> Sent -> Delivered -> Read capture
  sequence for Stage 3's match-cut. Existing Chats captures already show real
  delivered/read styles, but not every intermediate state. An isolated renderer
  can likely supply that sequence later without asking for private screenshots.
- A real physical-Windows transfer-progress recording if Stage 4 needs it.
  Current source reports local upload progress before peer dispatch; do not
  present it as remote LAN throughput/percentage or fabricate a transfer speed.
- Native full-window captures, only if final art needs Windows window controls.
  Current client-area captures are sufficient for Stage 2's monitor screens.
- A verified public installer URL and release metadata for the final download.

No additional screenshot is required from the owner to complete Stage 2. No
current gallery image is advertised. Desktop Git status remained clean after
capture. All website assets remain local; no Figma/Canva upload was performed.
