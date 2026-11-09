import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { publicLaunch, site } from "@/lib/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageRevealMotion } from "@/components/animations/PageRevealMotion";
import { NavigationFeedback } from "@/components/site/NavigationFeedback";
import { NetworkWallpaper } from "@/components/animations/NetworkWallpaper";
const manrope = localFont({src: "../assets/fonts/manrope-latin.woff2", variable: "--font-display", display: "swap", weight: "400 600", fallback: ["Arial"]});
const dmSans = localFont({src: "../assets/fonts/dm-sans-latin.woff2", variable: "--font-body", display: "swap", weight: "400 600", fallback: ["Arial"]});
export const metadata: Metadata = {
  title: {default: "Lymora | Technology, closer.", template: "%s | Lymora"},
  description: "Useful technology for the spaces we share. Discover Lymora LAN Messenger: direct messages, groups and files between nearby Windows PCs.",
  metadataBase: new URL(site.origin),
  robots: {index: publicLaunch, follow: publicLaunch},
  icons: {icon: [{url: "/brand/mark-dark.png", type: "image/png", sizes: "512x512"}], apple: "/brand/mark-light.png"},
};
// Runs before paint; only this root attribute differs during hydration. No external requests.
const themeScript = "(()=>{const r=document.documentElement;r.dataset.enhanced='';r.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full';let t;try{t=localStorage.getItem('lymora-website-theme')}catch{}r.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()";
export default function RootLayout({children}: {children: ReactNode}) {
  return <html lang="en" suppressHydrationWarning className={manrope.variable + " " + dmSans.variable}><head><script dangerouslySetInnerHTML={{__html: themeScript}}/></head><body><Suspense fallback={null}><NavigationFeedback/></Suspense><a className="skip-link" href="#main">Skip to content</a><NetworkWallpaper/><div className="site-shell"><SiteHeader/><PageRevealMotion>{children}<SiteFooter/></PageRevealMotion></div></body></html>;
}
