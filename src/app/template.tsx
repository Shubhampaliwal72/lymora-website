import type { ReactNode } from "react";

/** A readable 180ms arrival; no exit animation or navigation delay. */
export default function Template({children}: {children: ReactNode}) {
  return <div className="route-arrival">{children}</div>;
}
