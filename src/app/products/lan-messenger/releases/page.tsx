import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { publicLinks } from "@/lib/public-links";
export const metadata = pageMetadata("/products/lan-messenger/releases/", "LAN Messenger release notes");
export default function Releases() {
  const release = publicLinks.release;
  return <main id="main" tabIndex={-1} className="container editorial-page availability-page"><PageIntro eyebrow="LAN Messenger / Release notes" title={<>Progress, with<br/><em>a clear record.</em></>} description="Verified product versions, meaningful changes and the details that help you update with confidence."/>
    <section className="release-record glass-panel"><div><span className="status-pill">{release ? "Verified release" : "First public release coming soon"}</span>
      <h2>{release ? "Lymora LAN Messenger " + release.version : "A release record you can rely on."}</h2>
      {release ? <><p>Published {release.publishedAt}</p><ul>{release.changes.map(change => <li key={change}>{change}</li>)}</ul><h3>Known issues</h3><ul>{release.knownIssues.map(issue => <li key={issue}>{issue}</li>)}</ul><a className="text-link" href={release.notesUrl}>Read the official GitHub release &rarr;</a></> : <p>No public release has been approved yet. Version, release date, changes and known issues will be listed here after verification.</p>}
      <Link className="text-link" href="/downloads/">View download availability &rarr;</Link></div>
      <dl><div><dt>Version</dt><dd>{release?.version ?? "Not published"}</dd></div><div><dt>Release date</dt><dd>{release?.publishedAt ?? "Not published"}</dd></div><div><dt>Installer &amp; checksum</dt><dd>{release ? "Available on Downloads" : "Available after approval"}</dd></div><div><dt>Distribution</dt><dd>Verified GitHub Releases</dd></div></dl>
    </section><div className="editorial-note"><Link className="text-link" href="/products/lan-messenger/docs/">Read the practical guide &rarr;</Link></div></main>;
}
