import Link from "@/components/site/NavigationLink";
import { pageMetadata } from "@/lib/site";
import { HomeScrollMotion } from "@/components/animations/HomeScrollMotion";
import { ConnectionStory } from "@/components/animations/ConnectionStory";
import { ScrollStatement } from "@/components/animations/ScrollStatement";
import { LivingHero } from "@/components/living-network/LivingHero";
import { ProductExplorer } from "@/components/sections/ProductExplorer";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DownloadLink } from "@/components/site/DownloadLink";
import { Icon } from "@/components/site/Icons";
import { messenger } from "@/lib/products";

export const metadata = pageMetadata("/", "Technology, closer.");
const chapters = [
  { number: "01", href: "#experience", label: "Inside Lymora" },
  { number: "02", href: "#how-it-works", label: "Get connected" },
  { number: "03", href: "#together", label: "Work together" },
  { number: "04", href: "#getting-started", label: "Know your connection" },
  { number: "05", href: "#download", label: "Get Lymora" },
];
const uses = [
  {
    name: "The studio",
    body: "Send the latest draft and keep feedback in a shared local conversation.",
  },
  {
    name: "The office",
    body: "Bring nearby teammates into a group without another cloud account.",
  },
  {
    name: "The classroom",
    body: "Exchange notes and files across Windows PCs on a permitted local network.",
  },
  {
    name: "Your own space",
    body: "Share files between your Windows computers, with a conversation close at hand.",
  },
];
export default function Home() {
  return (
    <HomeScrollMotion>
      <LivingHero />
      <div id="products" className="container product-journey">
        <nav className="chapter-navigation" aria-label="On this page">
          {chapters.map((chapter) => (
            <a key={chapter.number} href={chapter.href}>
              <span>{chapter.number}</span>
              {chapter.label}
              <Icon name="down" />
            </a>
          ))}
        </nav>
        <ProductExplorer chapter="01" />
      </div>
      <section
        id="how-it-works"
        className="container connection-foundation section-space"
        aria-labelledby="connect-title"
      >
        <SectionHeading
          number="02"
          label="Get connected"
          titleId="connect-title"
          title={
            <>
              Three steps.
              <br />
              <span>One local connection.</span>
            </>
          }
        >
          <p>
            Make yourself at home, find nearby PCs and start a conversation.
          </p>
          <Link href={messenger.docs} className="text-link">
            Read the setup guide
            <Icon name="arrow" />
          </Link>
        </SectionHeading>
        <ConnectionStory />
      </section>
      <section
        id="together"
        className="container usecase-section section-space"
        aria-labelledby="usecase-title"
      >
        <ScrollStatement />
        <SectionHeading
          number="03"
          label="Work together"
          titleId="usecase-title"
          title={
            <>
              For the people
              <br />
              <span>already nearby.</span>
            </>
          }
        >
          <p>Conversations and files for the places you share.</p>
        </SectionHeading>
        <div className="usecase-list">
          {uses.map((item, index) => (
            <div key={item.name} data-scroll-item className="gloss-surface usecase-card">
              <span className="usecase-card-index" aria-hidden="true">0{index + 1}</span>
              <h3>{item.name}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="getting-started"
        className="container resource-section section-space"
        aria-labelledby="resource-title"
      >
        <SectionHeading
          number="04"
          label="Know your connection"
          titleId="resource-title"
          title={
            <>
              Clear answers.
              <br />
              <span>Before you begin.</span>
            </>
          }
        >
          <p>Setup, practical help and honest privacy details.</p>
        </SectionHeading>
        <div className="resource-links">
          <Link data-scroll-item className="gloss-surface resource-card" href={messenger.docs}>
            <span>Documentation</span>
            <h3>From installation to your first message.</h3>
            <Icon name="arrow" />
          </Link>
          <Link data-scroll-item className="gloss-surface resource-card" href="/privacy/">
            <span>Privacy &amp; security</span>
            <h3>What stays local. What travels on your LAN.</h3>
            <Icon name="arrow" />
          </Link>
          <Link data-scroll-item className="gloss-surface resource-card" href={messenger.docs + "#troubleshooting"}>
            <span>Connection help</span>
            <h3>Find the reason a PC is not reachable.</h3>
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section
        id="download"
        className="container download-foundation glass-panel"
        aria-labelledby="download-title"
      >
        <SectionHeading
          number="05"
          label="Get Lymora"
          titleId="download-title"
          title={
            <>
              Your next connection.
              <br />
              <span>On Windows.</span>
            </>
          }
        >
          <p>LAN Messenger brings messages, groups and files to nearby PCs.</p>
        </SectionHeading>
        <div className="download-foundation-actions">
          <DownloadLink/>
        </div>
      </section>
    </HomeScrollMotion>
  );
}
