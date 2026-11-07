import { HeroMotion } from "@/components/animations/HeroMotion";
import { Icon } from "@/components/site/Icons";
import { LivingNetwork } from "./LivingNetwork";

export function LivingHero() {
  return <section className="living-hero" id="the-app" aria-labelledby="hero-title">
    <div className="container living-layout">
      <HeroMotion>
        <p className="eyebrow" data-hero-reveal><span className="signal-dot"/>Lymora Living Network</p>
        <h1 id="hero-title" data-hero-reveal><span>Nearby.</span><span>Connected.</span></h1>
        <p className="hero-accent" data-hero-reveal>No internet required.</p>
        <p className="hero-description" data-hero-reveal>A conversation begins nearby.<br/>Messages, groups and files, from PC to PC.</p>
        <div className="hero-actions" data-hero-reveal><a href="#how-it-works" className="button button-primary">Explore Lymora<Icon name="down"/></a><a href="#download" className="hero-text-link">Made for Windows<Icon name="arrow"/></a></div>
        <p className="hero-note" data-hero-reveal><Icon name="windows"/>Your people. Your local network.</p>
      </HeroMotion>
      <LivingNetwork/>
    </div>
    <div className="container hero-bottom"><p><span className="signal-dot"/>Local by nature. Connected by Lymora.</p><a href="#how-it-works">Scroll to explore<Icon name="down"/></a></div>
  </section>;
}
