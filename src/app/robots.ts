import type { MetadataRoute } from "next";
import { publicLaunch, site } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: publicLaunch ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: site.origin + "/sitemap.xml",
  };
}
