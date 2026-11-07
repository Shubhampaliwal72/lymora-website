import type { MetadataRoute } from "next";
import { publicLaunch, site } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return publicLaunch
    ? {rules: {userAgent: "*", allow: "/"}, sitemap: site.origin + "/sitemap.xml"}
    : {rules: {userAgent: "*", disallow: "/"}};
}
