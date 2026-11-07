import type { MetadataRoute } from "next";
import { publicLaunch, site } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicLaunch) return [];
  return ["/", "/products/", "/products/lan-messenger/", "/products/lan-messenger/docs/", "/products/lan-messenger/releases/", "/downloads/", "/about/", "/privacy/"].map(path => ({url: site.origin + path}));
}
