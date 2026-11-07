import { Icon } from "@/components/site/Icons";
import { SiteHeader } from "@/components/site/SiteHeader";
import { LivingHero } from "@/components/living-network/LivingHero";

export default function Home() {
  return <>
    <SiteHeader/>
    <main id="main" tabIndex={-1}>
      <LivingHero/>
      <section className="container connection-story" id="how-it-works" aria-labelledby="connection-title">
        <div className="story-heading"><p className="eyebrow">A little closer</p><h2 id="connection-title">The same network.<br/>A more direct connection.</h2></div>
        <div className="connection-copy" id="getting-started"><p>Lymora brings nearby Windows computers into the same conversation. Install it on your PCs, connect to a reachable local network, and find the people around you.</p><p>Send a message. Bring a group together. Share the file you are working on. Your conversations stay on your local network, without needing the internet.</p><div className="story-words" aria-label="Lymora capabilities"><span>Discover</span><span>Connect</span><span>Converse</span></div></div>
      </section>
      <section id="download" className="container download-panel" aria-labelledby="download-title"><div><p className="eyebrow">Made for being nearby</p><h2 id="download-title">Bring your network<br/>a little closer.</h2><p>Lymora for Windows. A public installer link will appear here once the release has been verified.</p></div><span className="release-status"><Icon name="windows"/>Public download coming soon</span></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><p><span className="footer-wordmark">Lymora</span>LAN Messenger</p><a className="footer-link" href="#main">Back to the top &uarr;</a></div></footer>
  </>;
}
