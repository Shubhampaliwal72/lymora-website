import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const dynamic = "force-static";
export const alt = "Lymora. Technology, closer. Messages and files between nearby Windows PCs.";
export const size = {width: 1200, height: 630};
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const mark = await readFile(join(process.cwd(), "public/brand/mark-dark.png"));
  return new ImageResponse(<div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 76, color: "#f5f4f2", background: "#101114", borderBottom: "6px solid #c7470b"}}>
    <div style={{display: "flex", alignItems: "center", gap: 22}}>
      {/* Original supplied logo, embedded at build time. No remote asset request. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={"data:image/png;base64," + mark.toString("base64")} width={90} height={90} alt=""/>
      <span style={{fontSize: 44}}>Lymora</span>
    </div>
    <div style={{display: "flex", flexDirection: "column", marginTop: 48, fontSize: 76, letterSpacing: -3, lineHeight: 1.12}}><span>Technology.</span><span>A little <span style={{color: "#f06423"}}>closer.</span></span></div>
    <div style={{display: "flex", marginTop: 30, fontSize: 26, color: "#b2b4bc"}}>Messages and files between nearby Windows PCs.</div>
    <div style={{display: "flex", marginTop: "auto", fontSize: 20, color: "#9498a2"}}>lymora.in</div>
  </div>, size);
}
