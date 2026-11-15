import Link from "@/components/site/NavigationLink";
import { HeroMotion } from "@/components/animations/HeroMotion";
import { Icon } from "@/components/site/Icons";
import { messenger } from "@/lib/products";

/** Brand first: one generous scene with real HTML in its quiet central opening. */
export function LivingHero() {
  return <section className="cinematic-hero" id="the-app" aria-labelledby="hero-title">
    <div className="hero-stage" aria-hidden="true"/>
    <div className="container cinematic-copy">
      <HeroMotion>
        <p className="eyebrow" data-hero-reveal><span className="signal-dot"/>Welcome to the Lymora network</p>
        <h1 id="hero-title" data-hero-reveal><span>Technology.</span><span>A little <em>closer.</em></span></h1>
        <p className="hero-description" data-hero-reveal>Messages and files between nearby Windows PCs.<br/>No internet connection or cloud account required for LAN messaging.</p>
        <div className="hero-actions" data-hero-reveal>
          <Link href={messenger.path} className="button button-primary">Meet LAN Messenger<Icon name="arrow"/></Link>
          <a href="#network-preview" className="hero-text-link">See the connection<Icon name="down"/></a>
        </div>
      </HeroMotion>
    </div>
    <div className="container cinematic-caption">
      <p><span className="signal-dot"/>No internet. No cloud account. Just your network.</p>
      <a href="#network-preview">Scroll to connect<Icon name="down"/></a>
    </div>
  </section>;
}
