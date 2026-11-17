import { serializeStructuredData } from "@/lib/json-ld.mjs";

/** Native, build-rendered JSON-LD; no client JavaScript or runtime requests. */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}/>;
}
