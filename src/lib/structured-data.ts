import { site } from "./site";
import { publicLinks } from "./public-links";

/** Data only: reuse the approved release record; never infer prices or ratings. */
export function siteStructuredData() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": site.origin + "/#website", name: site.name, url: site.origin + "/", description: site.description };
}
export function softwareStructuredData() {
  const release = publicLinks.release;
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "@id": site.origin + "/products/lan-messenger/#software",
    name: "Lymora LAN Messenger", url: site.origin + "/products/lan-messenger/",
    description: "Local-network messages, group conversations and file sharing between reachable Windows PCs.",
    applicationCategory: "CommunicationApplication", operatingSystem: release?.windowsRequirement ?? "Windows",
    ...(release ? { softwareVersion: release.version, datePublished: release.publishedAt, processorRequirements: release.architecture,
      downloadUrl: release.downloadUrl, releaseNotes: site.origin + "/downloads/#release-notes" } : {}),
  };
}
