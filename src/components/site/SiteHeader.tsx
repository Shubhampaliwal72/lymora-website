import Image from "next/image";
import Link from "@/components/site/NavigationLink";
import { ActiveLink } from "./ActiveLink";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { NavDisclosure } from "./NavDisclosure";
import { NavigationItem } from "./NavigationItem";
import { Icon } from "./Icons";
import { messenger } from "@/lib/products";

export function SiteHeader() {
  return <header className="site-header glass-header"><div className="container header-inner glass-panel">
    <Link href="/" className="brand brand-lockup" aria-label="Lymora home"><span className="brand-symbol"><Image className="brand-dark" src="/brand/mark-dark.png" width={512} height={512} alt=""/><Image className="brand-light" src="/brand/mark-light.png" width={512} height={512} alt=""/></span><span>Lymora<span className="brand-caption">Technology, closer.</span></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      <ActiveLink href="/">Home</ActiveLink>
      <NavDisclosure label="Products" activePath="/products/">
        <div className="nav-product">
          <div className="nav-menu-intro"><span className="eyebrow">Made for nearby</span><p>Good things connect.</p></div>
          <NavigationItem href={messenger.path} title="LAN Messenger" description="Messages and files. Directly between Windows PCs." icon="message" className="nav-featured"/>
          <div className="nav-sublinks"><Link href="/products/">All products<Icon name="arrow"/></Link><Link href={messenger.path + "#features"}>Explore features<Icon name="arrow"/></Link></div>
          <div className="nav-menu-footnote"><Icon name="windows"/><span>Windows. Your local network.</span></div>
        </div>
      </NavDisclosure>
      <Link href="/#experience">Inside the app</Link>
      <NavDisclosure label="Resources">
        <div className="nav-menu-intro"><span className="eyebrow">A little guidance</span><p>Make yourself at home.</p></div>
        <div className="nav-resource-list">
          <NavigationItem href={messenger.docs} title="Getting started" description="Install, discover and connect." icon="windows"/>
          <NavigationItem href={messenger.docs + "#troubleshooting"} title="Help & troubleshooting" description="Find your way to a working connection." icon="message"/>
          <NavigationItem href={messenger.releases} title="Release notes" description="Product availability and updates." icon="file"/>
          <NavigationItem href="/privacy/" title="Privacy & security" description="Understand what stays on your devices." icon="expand"/>
        </div>
        <div className="nav-menu-footnote"><span className="signal-dot"/><span>Thoughtful software. Clear answers.</span></div>
      </NavDisclosure>
      <ActiveLink href="/about/">About</ActiveLink>
    </nav>
    <div className="header-actions"><ThemeToggle/><Link className="button button-primary header-download" href="/downloads/">For Windows<Icon name="arrow"/></Link><MobileMenu/></div>
  </div></header>;
}
