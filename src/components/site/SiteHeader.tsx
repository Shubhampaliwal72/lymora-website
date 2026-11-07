import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { NavDisclosure } from "./NavDisclosure";
import { Icon } from "./Icons";
import { messenger } from "@/lib/products";
export function SiteHeader() {
  return <header className="site-header glass-header"><div className="container header-inner glass-panel">
    <Link href="/" className="brand brand-lockup" aria-label="Lymora home"><span className="brand-symbol"><Image className="brand-dark" src="/brand/mark-dark.png" width={512} height={512} alt=""/><Image className="brand-light" src="/brand/mark-light.png" width={512} height={512} alt=""/></span><span>Lymora<span className="brand-caption">Technology, closer.</span></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      <Link href="/">Home</Link>
      <NavDisclosure label="Products"><div className="nav-product"><span className="eyebrow">The first Lymora product</span><Link href={messenger.path} className="nav-featured"><Icon name="message"/><span><strong>LAN Messenger</strong><small>Nearby. Connected. No internet required.</small></span><Icon name="arrow"/></Link><div className="nav-sublinks"><Link href="/products/">All products</Link><Link href={messenger.path + "#features"}>Explore features</Link></div></div></NavDisclosure>
      <Link href="/#experience">Explore</Link>
      <NavDisclosure label="Resources"><Link href={messenger.docs}><strong>Getting started</strong><small>Install, discover and connect.</small></Link><Link href={messenger.docs + "#troubleshooting"}><strong>Help &amp; troubleshooting</strong><small>Make your local connection work.</small></Link><Link href={messenger.releases}><strong>Release notes</strong><small>Product availability and updates.</small></Link><Link href="/privacy/"><strong>Privacy &amp; security</strong><small>Understand what stays on your devices.</small></Link></NavDisclosure>
      <Link href="/about/">About</Link>
    </nav>
    <div className="header-actions"><ThemeToggle/><Link className="button button-primary header-download" href="/downloads/">Get Lymora<Icon name="arrow"/></Link><MobileMenu/></div>
  </div></header>;
}
