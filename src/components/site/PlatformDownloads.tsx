import { publicLinks } from "@/lib/public-links";
import { DownloadAction } from "./DownloadAction";
import { Icon } from "./Icons";

export function PlatformDownloads() {
  const release = publicLinks.release;
  return <section className="platform-downloads download-release windows-download glass-panel" data-platform="windows" aria-labelledby="windows-download-title">
    <div className="download-overview">
      <div className="platform-download-heading"><span className="platform-mark"><Icon name="windows"/></span><span>Windows</span><span className="status-pill">{release ? "Available now" : "Not available yet"}</span></div>
      <h2 id="windows-download-title">Your next local<br/>connection.</h2>
      <p>Messages, groups and files between nearby Windows PCs. Install the same build on both devices to get started.</p>
      <DownloadAction/>
      <div className="inline-actions"><a href="#release-notes" className="text-link">Release notes<Icon name="down"/></a><a href="#installation" className="text-link">Installation guide<Icon name="down"/></a></div>
    </div>
    <div className="download-details">
      {release ? <>
        <dl className="windows-release-facts"><div><dt>Version</dt><dd>{release.version} <span>build {release.build}</span></dd></div><div><dt>System</dt><dd>{release.windowsRequirement} &middot; {release.architecture}</dd></div><div><dt>Installer</dt><dd>{release.size} &middot; .exe</dd></div><div><dt>Published</dt><dd><time dateTime={release.publishedAt}>{release.publishedAt}</time></dd></div></dl>
        <div className="download-integrity"><span>SHA-256</span><code>{release.sha256}</code><a href={release.checksumUrl}>Download checksum<Icon name="down"/></a></div>
        {!release.signed && <p className="download-publisher-note">This installer is unsigned. Windows may show an unknown-publisher or SmartScreen prompt. Match the downloaded file to the checksum above.</p>}
      </> : <p>The Windows download will be enabled after the installer and its published release are verified.</p>}
    </div>
  </section>;
}
