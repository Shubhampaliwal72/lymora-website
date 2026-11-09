import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/site";
import Link from "@/components/site/NavigationLink";
import { SectionNavigation } from "@/components/site/SectionNavigation";
import { PageIntro } from "@/components/site/PageIntro";
import { Icon } from "@/components/site/Icons";
import { DocumentationMotion } from "@/components/documentation/DocumentationMotion";
import { DocumentationFaq } from "@/components/documentation/DocumentationFaq";
import "./documentation.css";

export const metadata = pageMetadata("/products/lan-messenger/docs/", "LAN Messenger documentation", "Install Lymora, discover nearby PCs, share messages and files, and troubleshoot your LAN connection.");
const sections = [
  {href: "#setup", label: "First-time setup"},
  {href: "#network", label: "Your network"},
  {href: "#messaging", label: "Messages & groups"},
  {href: "#files", label: "Sharing files"},
  {href: "#troubleshooting", label: "Troubleshooting"},
  {href: "#faq", label: "Common questions"},
];
const questions=[
 {q:"Do I need the internet?",a:"Not for messaging between reachable PCs on your local network. Downloading the installer may require internet access; the installed app does not need a cloud account."},
 {q:"Can I use different Wi-Fi networks?",a:"Devices need a network route to each other. Being in the same room or using the same Wi-Fi name does not guarantee reachability. Guest isolation, separate subnets and VPN routing can interfere."},
 {q:"Is there a 25 MiB attachment limit?",a:"The current code does not impose the old 25 MiB cap. Practical limits depend on disk space, the devices, the network and keeping Lymora running. This is not a guarantee of unlimited transfers."},
 {q:"What happens to a scheduled message when the app is closed?",a:"Jobs are stored locally. A scheduled message cannot send while the local app/backend is stopped; delivery still needs a reachable recipient when Lymora runs again."},
 {q:"Does a group delivery count mean everyone read it?",a:"No. Delivery acknowledgements and read receipts are different. A per-member delivery count does not prove that every participant opened the conversation."},
 {q:"Why are notifications not appearing?",a:"Check the app notification preference and Windows notification permissions. Do not disturb / Focus Assist can suppress banners even when Windows accepts a notification."},
 {q:"Does Lymora verify who controls a device?",a:"Not independently on first use. It remembers the device key from the first encrypted connection. Use a network you trust and check with the other person if a saved key changes."},
];

function GuideHeading({number, label, title, children}: {number: string; label: string; title: string; children?: ReactNode}) {
  return <div className="guide-heading" data-guide-reveal><span className="guide-section-number" aria-hidden="true">{number}</span><div><p className="eyebrow">{label}</p><h2>{title}</h2>{children && <p>{children}</p>}</div></div>;
}

const checks = [
  {title: "No nearby devices", text: "Open both apps, verify LAN consent, refresh discovery and check guest-network isolation."},
  {title: "Found, but not delivered", text: "Confirm compatible builds, reachability and firewall permissions; a discovery announcement alone does not prove the message connection works."},
  {title: "Changed device key", text: "Check with the other person, especially after reinstalling and removing data. Use the app's saved-key recovery flow deliberately, then retry the failed message."},
  {title: "No Windows banner", text: "Check Lymora notification preferences, Windows app permissions and Do not disturb."},
  {title: "Transfer not finishing", text: "Keep both apps running, check free disk space and connection stability, then use the actual error shown by the app."},
];

export default function Docs() {
  return <main id="main" tabIndex={-1} className="container editorial-page reading-page messenger-docs">
    <PageIntro eyebrow="LAN Messenger / Documentation" title={<>A good connection<br/><em>starts here.</em></>} description="A practical guide to getting Lymora running and keeping conversations moving."/>
    <div className="guide-overview" aria-label="Guide essentials"><span><Icon name="windows"/>Windows PCs</span><span><span className="signal-dot"/>Direct local connection</span><span>No cloud account</span></div>
    <div className="documentation-layout">
      <aside className="docs-sidebar"><p className="docs-sidebar-label">In this guide</p><SectionNavigation className="docs-nav glass-panel" label="Documentation contents" items={sections}/><div className="docs-sidebar-note"><p>Something getting in the way?</p><a href="#troubleshooting">Start with the simple checks<Icon name="arrow"/></a></div></aside>
      <DocumentationMotion>
        <section id="setup">
          <GuideHeading number="01" label="First-time setup" title="From install to hello.">Five small steps. One local conversation.</GuideHeading>
          <ol className="guide-steps">
            <li data-guide-reveal><div><strong>Start with both PCs.</strong>Get the Windows installer from the <Link className="guide-inline-link" href="/downloads/">Downloads page</Link>. Install compatible builds on both PCs.</div></li>
            <li data-guide-reveal><div><strong>Make it yours.</strong>Choose a required display name. Team and avatar details are optional; no email, phone number or cloud registration is required.</div></li>
            <li data-guide-reveal><div><strong>Choose your network.</strong>Read the local-network explanation and explicitly allow LAN messaging on a network you trust.</div></li>
            <li data-guide-reveal><div><strong>Set your preferences.</strong>Choose notifications, Windows startup and an optional download location. You can change these choices later in Settings.</div></li>
            <li data-guide-reveal><div><strong>Say hello.</strong>Open Lymora on the other PC, find it in nearby devices and open the conversation.</div></li>
          </ol>
        </section>
        <section id="network">
          <GuideHeading number="02" label="Network basics" title="Nearby needs to be reachable."/>
          <div className="guide-network glass-panel" aria-label="Your PC connects directly to their PC over a reachable local network" data-guide-reveal><span className="guide-network-peer"><Icon name="windows"/>Your PC</span><span className="guide-network-wire" aria-hidden="true"/><span className="guide-network-center">Your local network</span><span className="guide-network-wire" aria-hidden="true"/><span className="guide-network-peer"><Icon name="windows"/>Their PC</span></div>
          <div className="guide-copy"><p>Both PCs must be running Lymora, with LAN access enabled and a route between them. Discovery advertises device metadata locally; messages and files move over direct encrypted connections.</p><p>Try Find devices again after both apps are open. If discovery remains blocked but the peer is reachable, use the app&apos;s Add IP option with the address shown by the other device. An address finds a route; it does not verify a person.</p></div>
          <div className="guide-callout"><Icon name="windows"/><p><strong>A trusted network comes first.</strong>Use a trusted private network. If Windows asks about firewall access, allow Lymora only on networks appropriate for your use. Do not disable the firewall as a general troubleshooting step.</p></div>
        </section>
        <section id="messaging">
          <GuideHeading number="03" label="Conversations" title="One person, or your people."/>
          <div className="guide-conversations">
            <article className="guide-conversation glass-panel" data-guide-reveal><Icon name="message"/><h3>A direct conversation.</h3><p>Select a nearby contact to message them. Use the conversation header for search, scheduling and shared images.</p></article>
            <article className="guide-conversation glass-panel" data-guide-reveal><Icon name="message"/><h3>Your group, together.</h3><p>Create a group from Groups, choose members and send an invitation. Recipients accept group membership. You can view the member list. Check the release notes on Downloads for the controls included in your version.</p></article>
          </div>
          <div className="guide-keyboard" aria-label="Messaging shortcuts"><span><kbd>Enter</kbd> Send a message</span><span><kbd>Shift</kbd><span aria-hidden="true">+</span><kbd>Enter</kbd> New line</span></div>
          <div className="guide-copy"><p>Delivery/read indicators describe different stages. A failed message offers an explicit retry. A local edit or Delete for me affects your local copy; do not assume a remote copy has changed.</p></div>
        </section>
        <section id="files">
          <GuideHeading number="04" label="Files and folders" title="Review. Send. Keep working."/>
          <div className="guide-file-flow glass-panel" data-guide-reveal><div><span>01</span><h3>Choose.</h3><p>Pick files or a folder, or drop a selection into the conversation.</p></div><div><span>02</span><h3>Review.</h3><p>Check the pending attachment list before confirming Send.</p></div><div><span>03</span><h3>Send.</h3><p>Watch preparation and sending. Keep the app running until complete.</p></div></div>
          <div className="guide-copy"><p>Folders are sent as ZIP attachments. Supported PNG, JPEG and GIF images can display a local preview. Save a received file using its download control, and treat unexpected files with care.</p></div>
          <div className="guide-callout"><Icon name="file"/><p><strong>Give the transfer room to finish.</strong>There is no fixed 25 MiB cap in the current implementation. Available disk space, connection stability and the receiving app still matter. Local upload progress is not a measurement of remote transfer speed.</p></div>
        </section>
        <section id="troubleshooting">
          <GuideHeading number="05" label="When something gets in the way" title="Check the simple things first."/>
          <div className="guide-checks">{checks.map((item, index) => <article key={item.title} className="guide-check" data-guide-reveal><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
          <div className="guide-callout"><Icon name="file"/><p><strong>Still need a closer look?</strong>Use Network &rarr; Advanced support details for a problem you cannot identify. Review diagnostics before sharing them: they may contain device names and network addresses.</p></div>
        </section>
        <section id="faq" className="faq-section">
          <GuideHeading number="06" label="The questions worth asking" title="A little more clarity.">The practical details behind a good local connection.</GuideHeading>
          <DocumentationFaq questions={questions}/>
        </section>
      </DocumentationMotion>
    </div>
  </main>;
}
