import Image from "next/image";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
export function SiteHeader() {
  return <header className="site-header"><div className="container header-inner">
    <a href="#main" className="brand" aria-label="Lymora home"><Image className="brand-dark" src="/brand/logo-dark.png" width={1200} height={400} alt="" preload/><Image className="brand-light" src="/brand/logo-light.png" width={1200} height={400} alt="" preload/></a>
    <nav className="desktop-nav" aria-label="Main navigation"><a href="#the-app">The experience</a><a href="#how-it-works">How it connects</a><a href="#getting-started">Getting started</a></nav>
    <div className="header-actions"><ThemeToggle/><a className="button button-secondary header-download" href="#download">Windows download <span aria-hidden="true">↗</span></a><MobileMenu/></div>
  </div></header>;
}
