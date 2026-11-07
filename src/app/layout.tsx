import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageRevealMotion } from "@/components/animations/PageRevealMotion";
import { NetworkWallpaper } from "@/components/animations/NetworkWallpaper";
const manrope = localFont({src: "../assets/fonts/manrope-latin.woff2", variable: "--font-display", display: "swap", weight: "400 600", fallback: ["Arial"]});
const dmSans = localFont({src: "../assets/fonts/dm-sans-latin.woff2", variable: "--font-body", display: "swap", weight: "400 600", fallback: ["Arial"]});
export const metadata: Metadata = {
  title: {default: "Lymora | Technology, closer.", template: "%s | Lymora"},
  description: "Useful technology for the spaces we share. Discover Lymora LAN Messenger: direct messages, groups and files between nearby Windows PCs.",
  robots: {index: false, follow: false},
};
// Runs before paint; only this root attribute differs during hydration. No external requests.
const themeScript = "(()=>{const r=document.documentElement;r.dataset.enhanced='';let t;try{t=localStorage.getItem('lymora-website-theme')}catch{}r.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()";
export default function RootLayout({children}: {children: ReactNode}) {
  return <html lang="en" suppressHydrationWarning className={manrope.variable + " " + dmSans.variable}><head><script dangerouslySetInnerHTML={{__html: themeScript}}/></head><body><a className="skip-link" href="#main">Skip to content</a><NetworkWallpaper/><div className="site-shell"><SiteHeader/><PageRevealMotion>{children}<SiteFooter/></PageRevealMotion></div></body></html>;
}
