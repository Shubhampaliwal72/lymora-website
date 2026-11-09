"use client";
import Link from "@/components/site/NavigationLink";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function ActiveLink(props: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const href = typeof props.href === "string" ? props.href : props.href.pathname;
  const current = href && !href.includes("#") && pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
  return <Link {...props} aria-current={current ? "page" : undefined}/>;
}
