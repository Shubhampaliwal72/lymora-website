import { publicLinks } from "@/lib/public-links";
import { Icon } from "./Icons";

export function ReleaseNotes() {
  const release = publicLinks.release;
  return <section id="release-notes" className="download-release-notes glass-panel" aria-labelledby="release-notes-title">
    <p className="eyebrow">Release notes</p>
    <h2 id="release-notes-title">{release ? "Lymora LAN Messenger " + release.version + " / build " + release.build : "A clear record of every release."}</h2>
    {release ? <>
      <p className="release-build-note">Published <time dateTime={release.publishedAt}>{release.publishedAt}</time>. This owner-approved installer is distributed unchanged; its original build metadata records the {release.channel} channel.</p>
      <div className="download-release-columns"><div><h3>Included in this build</h3><ul>{release.changes.map(change => <li key={change}>{change}</li>)}</ul></div><div><h3>Known limitations</h3><ul>{release.knownIssues.map(issue => <li key={issue}>{issue}</li>)}</ul></div></div>
      <a href={release.notesUrl} className="text-link">Official GitHub release<Icon name="arrow"/></a>
    </> : <p>Release details will appear here after an installer is approved.</p>}
  </section>;
}
