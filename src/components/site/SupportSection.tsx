import Link from "@/components/site/NavigationLink";
import { publicLinks } from "@/lib/public-links";
import { messenger } from "@/lib/products";
import { Icon } from "./Icons";
export function SupportSection() {
  const {email, issuesUrl} = publicLinks.support;
  return <section id="support" className="support-section glass-panel" aria-labelledby="support-title">
    <div><p className="eyebrow">Help &amp; contact</p><h2 id="support-title">A little help,<br/>when you need it.</h2><p>Start with the practical guide for setup, connections, file sharing and Windows notifications.</p></div>
    <div className="support-actions"><Link className="button button-secondary" href={messenger.docs + "#troubleshooting"}>Open troubleshooting<Icon name="arrow"/></Link>
      {email && <a className="text-link" href={"mailto:" + email}>Email support<Icon name="arrow"/></a>}
      {issuesUrl && <a className="text-link" href={issuesUrl}>Report a problem<Icon name="arrow"/></a>}
      {!email && !issuesUrl && <p>Direct support and feedback channels are coming soon. No email address or report form is published yet.</p>}
    </div>
  </section>;
}
