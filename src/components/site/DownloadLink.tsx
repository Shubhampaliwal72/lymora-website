import Link from "@/components/site/NavigationLink";
import { Icon } from "./Icons";

// Navigation CTAs never expose the installer; release selection stays on Downloads.
export function DownloadLink({className = "", label = "View downloads"}: {className?: string; label?: string}) {
  return <Link href="/downloads/" className={"button button-primary download-page-link " + className}>{label}<Icon name="arrow"/></Link>;
}
