# Lymora website workspace

- This repository is independent of `D:\my-projects\my-new-app`. Do not modify the desktop application as part of website work.
- Read `LYMORA_AI_ANIMATION_RULES.md` and `LYMORA_ANIMATION_SETUP_GUIDE.md` before design or animation changes. The Living Network A+B concept is approved, with restrained C materials in light mode. Stage 1 (layout/cinematic hero) is committed as 72a93bf. Stage 2 adds selected direct routes and message/file choreography; see docs/LIVING_NETWORK_STAGE2.md for verification. Stages 3-5 remain; verify each stage before proceeding.
- Current direction: the owner requested direct implementation of Glass Network, a multi-product brand foundation. It reuses the committed Living Network scene; do not automatically proceed with the old Stage 3-5 plan. Read design/glass-network/FOUNDATION.md. The latest request adds live background/scroll motion and explicitly requests full-page browser captures. Read docs/GLASS_NETWORK_MOTION.md; distinguish those measured checks from the earlier code-only foundation checkpoint.
- Preserve Next.js static export for Cloudflare Pages and npm/package-lock.json. Do not deploy, push, or connect the domain without owner approval.
- Preserve the existing Lymora artwork. Verify product/security claims against actual desktop code; never advertise voice or video calling.
- Keep GSAP and Motion ownership separate, honor reduced motion, and keep content visible without animation. React Three Fiber and Three.js are now explicitly approved. Do not add other engines without approval.
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- Latest owner correction: restore the original large editorial 01 style continuously through 05. Animation stays on even when the OS requests reduced motion, without a public header switch. Keep manual pause controls, hidden/offscreen pauses and lightweight mobile rendering. The background uses a quiet six-PC perimeter ring, not crossing paths over the content. This supersedes the earlier 8 November reduced-motion refinement. See docs/UI_REFINEMENT.md.
