import type { Metadata } from "next";
import { isPublicBuild } from "./indexing.mjs";

export const site = {
  name: "Lymora",
  origin: "https://lymora.in",
  description: "Messages, groups and files between nearby Windows PCs. Discover Lymora LAN Messenger, without a cloud account.",
} as const;

// Index production exports by default; development, previews and explicit opt-outs stay noindex.
export const publicLaunch = isPublicBuild({
  NODE_ENV: process.env.NODE_ENV,
  LYMORA_PUBLIC_LAUNCH: process.env.LYMORA_PUBLIC_LAUNCH,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
});

export function pageMetadata(path: string, title: string, description: string = site.description): Metadata {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title, description, url: path,
      images: [{url: "/opengraph-image", width: 1200, height: 630, alt: "Lymora. Technology, closer. Messages and files between nearby Windows PCs."}] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
