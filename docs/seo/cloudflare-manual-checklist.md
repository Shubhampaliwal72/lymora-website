# Production actions remain owner-controlled

No DNS, Cloudflare account settings, production redirects, deployment or Search Console settings were changed. The existing sitemap and canonical origin remain intact. Do not create a second hosting project to resolve these findings.

## Confirm the existing hosting product first

The repo exports Next.js to out/ and also contains wrangler.jsonc for static assets. Confirm whether the actual lymora.in binding belongs to Pages or a Workers Static Assets project before applying product-specific settings. Preserve the existing application, environment and release flow.

## HTTPS and www: separate production approval required

Audit baseline: HTTP apex returned 200 without a redirect; public DNS returned NXDOMAIN for www.lymora.in. HTTPS apex worked.

- In the existing Cloudflare zone, inspect SSL/TLS settings and edge certificates. Review an HTTP-to-HTTPS redirect for this hostname. Preserve path and query string; use a permanent redirect and avoid a second competing rule. Verify the existing certificate setup before enabling it.
- For www, obtain the correct custom-domain target from the existing hosting application's Custom domains/Domains screen. Do not invent a CNAME value. Inspect current DNS first, and ask for approval of the exact proposed record and domain binding. Do not delete unrelated records or change nameservers.
- Once www resolves and its certificate is active, configure www to https://lymora.in with path and query preservation. Verify HTTP/HTTPS variants and avoid loops or unnecessary chains.
- Existing slash redirects were 307. Review permanent slash normalization only after confirming the hosting product; the slash canonicals and internal links are already consistent.

## Social image headers and error pages

The source now provides Content-Type: image/png for /opengraph-image in public/_headers. After owner deployment, verify that the actual host applies it. Do not assume a copied file proves the response header is correct.

Audit baseline: unknown routes returned real but empty 404 responses; /404.html redirected to /404, which returned 200. The static export contains the designed 404.html. The source no longer applies public index metadata globally to error routes. Check the existing hosting application's not-found handling so unknown requests use the designed error body with status 404. This repository deliberately does not add a catch-all SPA redirect or change Wrangler deployment settings.

## After an approved deployment

Check HTTPS, www, /downloads and /downloads/, unknown nested paths, /sitemap.xml, /robots.txt, /opengraph-image, nested page reloads, canonical metadata, a Windows download link and the saved theme. Submit/inspect in Search Console only through the owner's verified property. Purge specific cached responses only if stale headers/content persist and the owner approves. Record actual before/after evidence rather than marking these tasks complete locally.
