import { pageMetadata } from "@/lib/site";
import Link from "@/components/site/NavigationLink";
import { PageIntro } from "@/components/site/PageIntro";
import { Icon } from "@/components/site/Icons";

// Preserve existing bookmarks without maintaining a second release record.
export const metadata = pageMetadata("/downloads/", "LAN Messenger release notes");
export default function Releases() {
  return <main id="main" tabIndex={-1} className="container editorial-page availability-page"><PageIntro eyebrow="LAN Messenger / Release notes" title={<>One place.<br/><em>Every release detail.</em></>} description="Release notes now live alongside the installer, compatibility information and checksums on Downloads."><Link href="/downloads/#release-notes" className="button button-primary">Read release notes<Icon name="arrow"/></Link></PageIntro></main>;
}
