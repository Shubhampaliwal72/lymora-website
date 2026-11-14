import Image from "next/image";
import Link from "@/components/site/NavigationLink";
import { Icon } from "./Icons";
import { messenger } from "@/lib/products";

const columns = [
  {label: "Products", links: [{href: messenger.path, label: "LAN Messenger"}, {href: messenger.path + "#features", label: "Explore the app"}, {href: "/downloads/", label: "Downloads"}]},
  {label: "Resources", links: [{href: messenger.docs, label: "Documentation"}, {href: messenger.docs + "#troubleshooting", label: "Connection help"}, {href: messenger.releases, label: "Release notes"}, {href: "/downloads/#support", label: "Help & contact"}]},
  {label: "Lymora", links: [{href: "/about/", label: "About the brand"}, {href: "/privacy/", label: "Privacy & security"}, {href: "/products/", label: "Product directory"}]},
];

export function SiteFooter() {
  return <footer className="glass-footer"><div className="container">
    <div className="footer-statement"><div><p className="eyebrow"><span className="signal-dot"/>Lymora LAN Messenger</p><h2>Keep the conversation<br/><span>close to home.</span></h2></div><Link href={messenger.path} className="footer-orbit" aria-label="Explore LAN Messenger"><Icon name="arrow"/></Link></div>
    <div className="footer-directory glass-panel">
      <div className="footer-brand"><Link href="/" className="footer-brand-link" aria-label="Lymora home"><span className="brand-symbol"><Image className="brand-dark" src="/brand/mark-dark.png" width={512} height={512} alt=""/><Image className="brand-light" src="/brand/mark-light.png" width={512} height={512} alt=""/></span><span>Lymora<span className="footer-brand-dot" aria-hidden="true">.</span></span></Link><p>Useful technology.<br/>Made for the spaces we share.</p></div>
      {columns.map(column => <nav key={column.label} aria-label={"Footer " + column.label}><h3>{column.label}</h3>{column.links.map(link => <Link key={link.href} href={link.href}>{link.label}<Icon name="arrow"/></Link>)}</nav>)}
    </div>
    <div className="tonal-wordmark" aria-hidden="true">lymora<span>.</span></div>
    <div className="footer-colophon"><span>Lymora &middot; Thoughtfully connected.</span><a href="#main">Back to top <Icon name="down"/></a></div>
  </div></footer>;
}
