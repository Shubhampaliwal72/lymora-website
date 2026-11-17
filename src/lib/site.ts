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
  const brandedTitle = title.includes(site.name) ? title : title + " | " + site.name;
  return {
    title: { absolute: brandedTitle }, description,
    robots: { index: publicLaunch, follow: publicLaunch },
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: brandedTitle, description, url: path,
      images: [{url: "/opengraph-image", width: 1200, height: 630, alt: "Lymora. Technology, closer. Messages and files between nearby Windows PCs."}] },
    twitter: { card: "summary_large_image", title: brandedTitle, description, images: ["/opengraph-image"] },
  };
}
