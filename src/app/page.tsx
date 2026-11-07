import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/sections/Hero";
export default function Home() {
  return <><SiteHeader/><main id="main" tabIndex={-1}>
    <Hero/>
    <section id="how-it-works" className="container getting-started" aria-labelledby="how-title"><div className="section-intro"><div><p className="eyebrow">Keep it close</p><h2 id="how-title">Three steps. One network.</h2></div><p>A small setup.<br/>A more direct way to stay in touch.</p></div>
      <ol className="steps" id="getting-started"><li className="step"><span className="step-number">01 / INSTALL</span><h3>Make room for Lymora.</h3><p>Install Lymora on each Windows PC you want to connect. Choose a display name so people can recognise you.</p></li><li className="step"><span className="step-number">02 / DISCOVER</span><h3>Find the people nearby.</h3><p>Connect to the same reachable local network and allow local network access. Nearby devices appear in Lymora.</p></li><li className="step"><span className="step-number">03 / CONNECT</span><h3>Start the conversation.</h3><p>Send a message, bring people into a group, or share a file. Your conversation does not need an internet connection.</p></li></ol>
    </section>
    <section id="download" className="container download-panel" aria-labelledby="download-title"><div><h2 id="download-title">Your network. A little closer.</h2><p>Lymora is built for Windows. A public installer link will appear here after the release has been verified.</p></div><span className="release-status">Public download coming soon</span></section>
  </main><footer className="site-footer"><div className="container footer-inner"><p><span className="footer-wordmark">Lymora</span>LAN Messenger</p><a className="footer-link" href="#main">Back to the top ↑</a></div></footer></>;
}
