import { publicLinks } from "@/lib/public-links";
import { Icon } from "./Icons";
export function DownloadAction() {
  const release = publicLinks.release;
  return release
    ? <a className="button button-primary" href={release.downloadUrl}><Icon name="windows"/>Download for Windows<Icon name="down"/></a>
    : <button className="button button-primary download-coming-soon" disabled><Icon name="windows"/>Coming Soon</button>;
}
