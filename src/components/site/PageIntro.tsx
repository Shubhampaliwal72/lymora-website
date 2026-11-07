import Link from "next/link";
import type { ReactNode } from "react";
export function PageIntro({eyebrow,title,description,children}:{eyebrow:string;title:ReactNode;description:string;children?:ReactNode}){return <header className="page-intro"><Link href="/" className="breadcrumb">Lymora <span aria-hidden="true">/</span> {eyebrow}</Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lead">{description}</p>{children}</header>;}
