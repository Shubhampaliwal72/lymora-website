import { HeroMotion } from "@/components/animations/HeroMotion";
import { Icon } from "@/components/site/Icons";
import { LanScene } from "./LanScene";
export function Hero() {
  return <section id="the-app" className="container hero" aria-labelledby="hero-title">
    <div className="hero-grid"><HeroMotion>
      <p className="eyebrow" data-hero-reveal><span className="signal-dot"/>Offline by design. Connected by LAN.</p>
      <h1 id="hero-title" data-hero-reveal><span>Close by.</span><span>Connected.</span></h1>
      <p className="hero-accent" data-hero-reveal>No internet needed.</p>
      <p className="hero-description" data-hero-reveal>Messages, groups and files for the people on your local network. Direct from one PC to another.</p>
      <div className="hero-actions" data-hero-reveal><a href="#capabilities" className="button button-primary">Explore Lymora<Icon name="down"/></a><a href="#how-it-works" className="button button-secondary">How it works<Icon name="arrow"/></a></div>
      <p className="hero-note" data-hero-reveal><Icon name="windows"/>Made for Windows. Built for being nearby.</p>
    </HeroMotion><LanScene/></div>
    <div id="capabilities" className="capabilities" aria-label="Lymora capabilities"><div className="capability"><span>01</span>Direct conversations</div><div className="capability"><span>02</span>Shared group chats</div><div className="capability"><span>03</span>Files &amp; folders</div></div>
  </section>;
}
