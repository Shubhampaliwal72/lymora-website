import Link from "@/components/site/NavigationLink";
import { LivingNetwork } from "@/components/living-network/LivingNetwork";
import { Icon } from "@/components/site/Icons";

/** The preserved functional demo has its own space after the brand opening. */
export function NetworkPreview() {
  return <section className="network-preview brand-hero" id="network-preview" aria-labelledby="network-preview-title">
    <div className="container living-layout">
      <div className="network-preview-copy" data-scroll-item>
        <p className="eyebrow"><span className="signal-dot"/>Lymora LAN Messenger</p>
        <h2 id="network-preview-title">Nearby PCs.<br/><span>A direct conversation.</span></h2>
        <p>Messages, groups and files. Directly between nearby Windows PCs on your local network.</p>
        <Link href="#experience" className="text-link">Inside the actual app<Icon name="down"/></Link>
      </div>
      <LivingNetwork/>
    </div>
  </section>;
}
