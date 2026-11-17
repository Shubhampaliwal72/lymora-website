# SEO measurement ledger

Date: 2026-11-17 (Asia/Calcutta). Website baseline commit: 08440292b7181ed04ba483e58163e2e7e8ac00b4. Search Console ownership is owner-reported; no private performance/indexing reports were accessed.

## Before implementation: live observations

- Seven sitemap routes returned 200, self-canonical HTTPS URLs and index/follow metadata. Robots allowed crawling and referenced the populated sitemap. No sitemap rewrite needed.
- Homepage title: Technology, closer. No JSON-LD on audited pages. Social PNG bytes valid (1200x630), but missing HTTP Content-Type.
- HTTP apex: 200. www: public DNS NXDOMAIN. Slashless Downloads: 307 to slash URL. Unknown routes: 404 with empty body.
- Shared inline fallback SVG: 129,491 bytes per document. Both screenshot themes loaded, about 87.6 KB each for the chats images.
- Browser lab, not field data: desktop homepage LCP 1.88 s / CLS about .002; mobile home .97 s / initial CLS 0; mobile Downloads .77 s / CLS 0. Slow mobile (150 ms, 1.6 Mbit/s, 4x CPU) varied 1.95-3.52 s LCP. Desktop Downloads fallback shift reproduced in three fresh tabs, CLS about .105, including reduced motion.
- PageSpeed Insights returned HTTP 429 quota errors. Field INP, CrUX and Search Console CWV remain unavailable. Some early sequential-navigation performance samples were inconsistent; use the reproduced fresh-document samples above, not the anomalous values.

## Implementation validation

See IMPLEMENTATION.md and the ignored .verification/seo-ui-results.json for actual local test outcomes. Local lab results are not live improvements until the owner deploys the reviewed build. Keep test conditions and route/theme/motion mode with every performance comparison.

## Monthly owner record

| Date / period | Data source and filters | Clicks | Impressions | CTR | Average position | Indexed canonical pages / exclusions | Field LCP / INP / CLS | Changes and observations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Awaiting owner export | Search Console domain property; dates/device/country to be recorded | Not available | Not available | Not available | Not available | Not available | Not available | Never interpret missing data as zero or a passing result |

Maintain release notes, privacy version scope and support configuration alongside future builds. Do not add analytics or new data collection without an owner decision and an accurate privacy update.

## Local implementation result, 17 November 2026

All repository checks in IMPLEMENTATION.md passed. Homepage HTML is 131,014 bytes; Downloads is 80,012 bytes. Downloads fallback CLS measured about 0.00012 in the local live/static browser checks, replacing the reproduced approximately 0.105 live baseline. This comparison confirms removal of the attributed SVG layout movement; it is not a same-host field performance experiment. The site still needs owner deployment and live-header/domain verification. No field INP or ranking data is available.
