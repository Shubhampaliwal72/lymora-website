import Link from "next/link";
import type { ReactNode } from "react";

export function PageIntro({eyebrow, title, description, children}: {eyebrow: string; title: ReactNode; description: string; children?: ReactNode}) {
  return <header className="page-intro">
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Lymora</Link><span aria-hidden="true">/</span><span aria-current="page">{eyebrow}</span></nav>
    <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lead">{description}</p>{children}
  </header>;
}
