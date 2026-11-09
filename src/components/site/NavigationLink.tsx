"use client";

import NextLink, { useLinkStatus } from "next/link";
import { useEffect, useRef, type ComponentProps, type RefObject } from "react";
import { beginNavigation } from "@/lib/navigation-feedback";

function PendingNavigation({destination}: {destination: RefObject<string | null>}) {
  const {pending} = useLinkStatus();
  useEffect(() => {
    if (pending && destination.current) return beginNavigation(destination.current);
  }, [pending, destination]);
  return null;
}

/** Next owns routing/prefetch/cancellation. Only genuine pending links start feedback. */
export default function NavigationLink({children, onClick, ...props}: ComponentProps<typeof NextLink>) {
  const destination = useRef<string | null>(null);
  return <NextLink {...props} onClick={event => {destination.current = event.currentTarget.href; onClick?.(event);}}>
    {children}<PendingNavigation destination={destination}/>
  </NextLink>;
}
