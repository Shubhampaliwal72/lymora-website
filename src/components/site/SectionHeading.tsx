import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";

/** Large editorial chapter numbers share one layout throughout the homepage. */
export function SectionHeading({number, label, title, titleId, children}: {
  number?: string; label: string; title: ReactNode; titleId: string; children?: ReactNode;
}) {
  const heading = <h2 id={titleId}>{title}</h2>;
  return number
    ? <div className="section-heading chapter-heading" data-scroll-heading>
        <div className="chapter-index" data-scroll-index><span className="chapter-number" aria-label={"Section " + Number(number)}>{number}</span><p className="eyebrow">/ {label}</p></div>
        <div className="chapter-heading-copy">{heading}{children}</div>
      </div>
    : <div className="section-heading" data-scroll-heading><div><SectionLabel>{label}</SectionLabel>{heading}</div>{children}</div>;
}
