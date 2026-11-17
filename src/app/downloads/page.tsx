import { pageMetadata } from "@/lib/site";
import { StructuredData } from "@/components/site/StructuredData";
import { softwareStructuredData } from "@/lib/structured-data";
import Link from "@/components/site/NavigationLink";
import { ReleaseNotes } from "@/components/site/ReleaseNotes";
import { PlatformDownloads } from "@/components/site/PlatformDownloads";
import { UpcomingPlatforms } from "@/components/site/UpcomingPlatforms";
import { SupportSection } from "@/components/site/SupportSection";
import { SectionNavigation } from "@/components/site/SectionNavigation";
import { PageIntro } from "@/components/site/PageIntro";
export const metadata = pageMetadata("/downloads/", "Download Lymora LAN Messenger for Windows", "Download Lymora LAN Messenger for Windows 10 or later (64-bit). Review the installer version, SHA-256 checksum, release notes and setup guide.");
const sections = [
 {href: "#windows", label: "Windows"},
 {href: "#platforms", label: "Other platforms"},
 {href: "#release-notes", label: "Release notes"},
 {href: "#installation", label: "Installation"},
 {href: "#support", label: "Help"},
];
export default function Downloads(){return <main id="main" tabIndex={-1} className="container editorial-page availability-page"><StructuredData data={softwareStructuredData()}/><PageIntro eyebrow="Downloads" title={<>Download Lymora.<br/><em>For Windows.</em></>} description="Lymora LAN Messenger for Windows. A more direct way to talk and share with the PCs around you."/><SectionNavigation className="product-subnav downloads-nav" label="Downloads sections" items={sections}/><PlatformDownloads/><UpcomingPlatforms/><ReleaseNotes/><section id="installation" className="section-space editorial-split"><div><p className="eyebrow">Install on both PCs</p><h2>A familiar install.<br/>A thoughtful first launch.</h2><p>Install Lymora on each PC you want to connect.</p></div><ol className="setup-timeline"><li><span>01</span><div><h3>Review the installer.</h3><p>Use the verified download and read its licence agreement. Choose your installation location and the shortcuts offered by the installer.</p></div></li><li><span>02</span><div><h3>Make it yours.</h3><p>Enter your display name. Add a team or choose an avatar if you want. No cloud account is required.</p></div></li><li><span>03</span><div><h3>Choose what to allow.</h3><p>Enable local-network messaging on a trusted network. Set notifications, Windows startup and your preferred download folder.</p></div></li><li><span>04</span><div><h3>Open a local conversation.</h3><p>Run a compatible build on the other PC, discover it and start messaging. Internet access is not needed for the LAN conversation.</p></div></li></ol></section><div className="editorial-note"><h3>Need a hand?</h3><p>Use the <Link href="/products/lan-messenger/docs/#troubleshooting">connection guide</Link> for device discovery, delivery, file sharing and Windows notification questions.</p><p>You can uninstall through Windows installed-app settings. Read any data-removal choice carefully before deleting local history and preferences.</p></div><SupportSection/></main>;}
