import type { Metadata } from "next";

export const site = {
  name: "Lymora",
  origin: "https://lymora.in",
  description: "Messages, groups and files between nearby Windows PCs. Discover Lymora LAN Messenger, without a cloud account.",
} as const;

// Explicit opt-in supports manual exports; named Cloudflare preview branches stay noindex.
export const publicLaunch = process.env.LYMORA_PUBLIC_LAUNCH === "true" && (!process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH === "main");

export function pageMetadata(path: string, title: string, description: string = site.description): Metadata {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title, description, url: path,
      images: [{url: "/opengraph-image", width: 1200, height: 630, alt: "Lymora. Technology, closer. Messages and files between nearby Windows PCs."}] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
