# LYMORA — OWNER'S VS CODE SETUP GUIDE FOR GSAP + MOTION

**Audience:** Beginner developer working on the Lymora public Next.js website.  
**Goal:** Set up the animation libraries safely, teach your AI assistant the project rules, and validate a small practice page **before changing the live homepage**.

## 1. What you are installing

- **GSAP**: JavaScript animation engine for coordinated sequences.
- **@gsap/react**: React integration with `useGSAP()` and automatic cleanup.
- **Motion**: React animation components (`motion.div`, `motion.button`, scroll reveals).
- **ScrollTrigger**: A plugin included with GSAP; no separate npm install required.

These are **npm packages inside your website**, not VS Code extensions and not ChatGPT plugins. Your VS Code AI assistant can inspect/import them after they are installed. No Canva, Rive, Spline, or paid service is required for these examples. Check official license terms if your distribution model changes.

Official references:
- https://gsap.com/docs/v3/
- https://gsap.com/resources/React/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://motion.dev/docs/react
- https://nextjs.org/docs/app

## 2. Open the correct repository — very important

1. Launch VS Code and open the **Lymora website project**, not the Electron desktop app and not `backend-go`.
2. In VS Code Terminal, inspect the folder:

```bash
pwd
ls
```

On Windows PowerShell use `Get-Location` and `Get-ChildItem` instead if desired.

3. Verify `package.json` exists and includes Next.js/React. Check for `src/app/` or `app/`, `next.config.*`, and lockfile.
4. If you have uncommitted changes, save/commit or make a safe backup before installing dependencies.
5. Make a new Git branch for the animation work:

```bash
git switch -c feature/website-animations
```

If Git reports that the branch already exists, choose a different name. Do not overwrite uncommitted work.

## 3. Inspect the package manager first

Look for exactly which lockfile your project uses:

| File | Preferred command |
|---|---|
| `package-lock.json` | `npm` |
| `pnpm-lock.yaml` | `pnpm` |
| `yarn.lock` | `yarn` |
| `bun.lock` or `bun.lockb` | `bun` |

**Do not mix package managers or regenerate lockfiles unnecessarily.** Examples below use npm. If your repository uses pnpm/yarn/bun, use its equivalent.

Check prerequisites:

```bash
node --version
npm --version
```

Use a Node.js version supported by the project's installed Next.js release; consult its `package.json` engines or Next.js docs. Don't blindly upgrade dependencies.

## 4. Give your AI the instructions BEFORE implementation

1. Copy `LYMORA_AI_ANIMATION_RULES.md` into the **website repository root** (next to `package.json`).
2. Copy this owner guide there too if you want it tracked with the project.
3. Open the AI rules file in VS Code. In your coding assistant chat, reference it explicitly using your assistant's supported file mention syntax (often `@LYMORA_AI_ANIMATION_RULES.md`).
4. If using GitHub Copilot, you may additionally adapt the rules into `.github/copilot-instructions.md`; if using another assistant, follow its own repository-instructions convention. **Do not assume that placing a random `.md` file automatically makes every assistant obey it.**
5. Ask your AI to perform **Phase 0 audit only** and wait for approval. Do not let it refactor the desktop app or backend.

Suggested message:

> Read `LYMORA_AI_ANIMATION_RULES.md` and inspect my existing Next.js website. Do Phase 0 only: identify the package manager, existing theme tokens, brand assets, animation dependencies, Next.js static export, and any conflicts. Propose the smallest safe installation and first animation exercise. Do not edit files until I approve.

## 5. Install dependencies AFTER approving the audit

From the **website project root**:

```bash
npm install gsap @gsap/react motion
```

For pnpm use `pnpm add gsap @gsap/react motion`; for yarn use `yarn add ...`; for bun use `bun add ...`.

Verify installed packages:

```bash
npm ls gsap @gsap/react motion
```

Expected: all three packages appear in the dependency tree. Versions will vary. `ScrollTrigger` is imported from `gsap/ScrollTrigger`; it does not need another package.

Check changes:

```bash
git diff -- package.json package-lock.json
```

Only dependency/lockfile changes should be present from this installation. If npm reports peer dependency errors, stop and inspect the exact versions rather than using `--force` or `--legacy-peer-deps` blindly.

## 6. Practice safely without replacing your homepage

Use the existing App Router convention. If you have `src/app`, create:

```text
src/
  app/
    animation-practice/
      page.tsx
  components/
    animations/
      MotionDemo.tsx
      GsapDemo.tsx
```

If your project uses `app/` without `src/`, adjust paths. If you use a different import alias, adjust imports accordingly.

### A. Motion demo

`src/components/animations/MotionDemo.tsx`

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function MotionDemo() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl px-6 py-3 font-semibold text-white"
      style={{ backgroundColor: 'var(--button-primary)' }}
      onClick={() => alert('Motion works! This is only a demo.')}
    >
      Test Motion
    </motion.button>
  );
}
```

The button is intentionally a demo and does **not** pretend to download Lymora.

### B. GSAP demo

`src/components/animations/GsapDemo.tsx`

```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function GsapDemo() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) return;

    gsap.from('.lymora-demo-heading', {
      y: 24,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    });
  }, { scope: container });

  return (
    <section ref={container}>
      <h1 className="lymora-demo-heading text-4xl font-bold">
        Lymora LAN Messenger
      </h1>
      <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
        Connect and share across your local network.
      </p>
    </section>
  );
}
```

`useGSAP` handles cleanup when the component unmounts. The media query is checked inside the client-side hook, not during server module evaluation.

### C. Practice route

`src/app/animation-practice/page.tsx`

```tsx
import GsapDemo from '@/components/animations/GsapDemo';
import MotionDemo from '@/components/animations/MotionDemo';

export default function AnimationPracticePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center"
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--text-primary)',
      }}
    >
      <GsapDemo />
      <MotionDemo />
    </main>
  );
}
```

**Note:** This assumes your website already defines the semantic CSS variables. If it does not, have the AI map them to the existing theme system first; do not paste conflicting global theme rules blindly. If `@/` aliases aren't configured, use appropriate relative imports.

## 7. Run and validate locally

```bash
npm run dev
```

Visit:

`http://localhost:3000/animation-practice`

Confirm:

- Heading enters gently when motion is enabled.
- Button scales on hover/press, and its demo click shows a message.
- No red errors in the browser console or VS Code terminal.
- In reduced-motion mode, the heading remains visible and the button does not scale.
- Layout fits at 320px and 375px widths without horizontal scrolling.
- Text and button are readable in both dark and light themes.

**How to test reduced motion:** In Chrome/Edge DevTools, open the Command Menu, search for *Show Rendering*, then set *Emulate CSS media feature prefers-reduced-motion* to `reduce` (menu wording may vary).

## 8. Test the actual build and Cloudflare compatibility

Inspect the scripts in `package.json` and run the matching checks, for example:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Only run `npm run lint` if that script exists. Use the repo's actual static export/Cloudflare build configuration; **do not change `next.config.*` just to get animation libraries working**. Both GSAP and Motion can run in the browser on a statically exported Next.js site.

Check for hydration warnings, missing CSS variables, import errors, unexpected bundle growth, and static-export failures.

## 9. The five critical mistakes to avoid

1. **Animating every element:** Use a few meaningful reveals; preserve a fast, professional experience.
2. **GSAP + Motion fighting over the same node:** Use one library per animated element/property; do not combine competing transforms.
3. **Ignoring reduced motion:** Check user preferences in Motion, GSAP, CSS and any future SVG animations.
4. **Desktop-only design:** Test on touch devices, 320px/375px mobile, tablet, and lower-power devices; prefer transform/opacity and lazy-load heavy sections.
5. **Breaking static hosting:** Preserve Cloudflare Pages static output, SEO, working links and the existing website routes. Never add an unnecessary backend to serve animations.

Also avoid: replacing the real logo, adding calling/video UI, advertising unimplemented security, hardcoding nonexistent download URLs, running `npm install` in the Electron or Go directory, and overwriting existing theme files without inspection.

## 10. Integrating animations into the real website — after practice

Recommended order:

1. Audit and reconcile existing Lymora theme tokens with the reference palette below.
2. Build the hero entrance with GSAP.
3. Add Motion feature-card reveals and button interactions.
4. Add a lightweight SVG LAN peer-to-peer visualization; no central server or calling icons.
5. Add real app screenshots and optional GSAP ScrollTrigger for the showcase.
6. Verify reduced motion, keyboard/touch usability, performance, SEO, and static deployment.
7. Remove or exclude the practice route from the production build if it should not be public.

### Lymora reference colors

| Token | Ember Night (dark) | Warm Porcelain (light) |
|---|---|---|
| Canvas | `#101114` | `#FAF9F7` |
| Surface | `#202228` | `#FFFFFF` |
| Primary text | `#F5F4F2` | `#252321` |
| Secondary text | `#B2B4BC` | `#625D58` |
| Border | `#34363D` | `#E5E1DC` |
| Accent | `#F06423` | `#C7470B` |
| Primary button | `#B8430D` | `#B8430D` |
| Focus ring | `#FF925A` | `#B8430D` |

These are **design references**, not an instruction to replace existing variables without auditing them. The full token set is in `LYMORA_AI_ANIMATION_RULES.md`.

## 11. Troubleshooting

| Problem | What to check |
|---|---|
| `Cannot find module 'motion/react'` | Confirm `motion` installed in **website** project and restart dev server/TS server |
| `Cannot find module '@gsap/react'` | Confirm package and lockfile installed correctly |
| `window is not defined` | Use `'use client'` and access browser APIs inside effects/hooks, not module scope |
| Hydration mismatch | Keep server/client initial markup consistent; inspect theme and media query behavior |
| Animation runs twice in development | React Strict Mode can expose missing cleanup; use `useGSAP` correctly |
| CSS variable not working | Inspect actual theme selector and variable names; don't assume `[data-theme]` exists |
| Cloudflare build fails | Check `next.config`, static export, Node version, build scripts and unsupported server-only features |
| Download button does nothing | Connect it to an actual verified installer URL; don't use demo button in production |
| Site feels slow | Reduce animation count, lazy-load media, check bundle and Core Web Vitals |

## 12. Final AI prompt after installation

> I installed `gsap`, `@gsap/react`, and `motion` in the Lymora **website** repository. Read `LYMORA_AI_ANIMATION_RULES.md`. Verify package versions, audit the real Lymora logo/theme and static Cloudflare build, and implement only the approved first animation phase. Respect the five mandatory rules: restrained motion, no GSAP/Motion conflicts, reduced-motion support, mobile performance, and static-hosting compatibility. Explain the code and run relevant checks. Do not invent features or change the Electron/Go/SQLite desktop application.

## 13. What success looks like

You understand which library owns which animation, can change its timing/offset yourself, can run the site locally, can verify reduced-motion behavior, and can deploy the same static website without introducing a server. Only then move from the practice route to the real Lymora homepage.
