# Lymora website workspace

- This repository is independent of `D:\my-projects\my-new-app`. Do not modify the desktop application as part of website work.
- Read `LYMORA_AI_ANIMATION_RULES.md` and `LYMORA_ANIMATION_SETUP_GUIDE.md` before design or animation changes. The Living Network A+B concept is approved, with restrained C materials in light mode. Stage 1 (layout/cinematic hero) is implemented and locally verified. Stages 2-5 remain; verify each stage before proceeding.
- Preserve Next.js static export for Cloudflare Pages and npm/package-lock.json. Do not deploy, push, or connect the domain without owner approval.
- Preserve the existing Lymora artwork. Verify product/security claims against actual desktop code; never advertise voice or video calling.
- Keep GSAP and Motion ownership separate, honor reduced motion, and keep content visible without animation. React Three Fiber and Three.js are now explicitly approved. Do not add other engines without approval.
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
