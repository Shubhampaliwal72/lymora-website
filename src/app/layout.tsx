import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
const manrope = localFont({src: "../assets/fonts/manrope-latin.woff2", variable: "--font-display", display: "swap", weight: "400 600", fallback: ["Arial"]});
const dmSans = localFont({src: "../assets/fonts/dm-sans-latin.woff2", variable: "--font-body", display: "swap", weight: "400 600", fallback: ["Arial"]});
export const metadata: Metadata = {
  title: "Lymora — Close by. Connected.",
  description: "Messages, groups and files for the people on your local network. Lymora is a Windows LAN messenger that works without internet.",
  robots: {index: false, follow: false},
};
// Runs before paint; only this root attribute differs during hydration. No external requests.
const themeScript = "(()=>{const r=document.documentElement;r.dataset.enhanced='';let t;try{t=localStorage.getItem('lymora-website-theme')}catch{}r.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()";
export default function RootLayout({children}: {children: ReactNode}) {
  return <html lang="en" suppressHydrationWarning className={manrope.variable + " " + dmSans.variable}><head><script dangerouslySetInnerHTML={{__html: themeScript}}/></head><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
