# Organization license activation

Personal use remains free. The optional organization license flow is a manually issued, device-bound code; no payment processor is connected. A later payment provider can issue these same records only after a verified payment webhook, without changing desktop token verification.

## Architecture

- `/license/` is a static request page. It submits organization name and contact email to the Cloudflare Pages Function at `/api/license/request`.
- Cloudflare D1 stores only a SHA-256 hash of each license code, its organization, expiry, seat limit and activation device IDs. Pending requests store the supplied organization name and email until handled.
- Admin endpoints are protected by `LICENSE_ADMIN_TOKEN`; the signing key is a Cloudflare secret named `LICENSE_SIGNING_PRIVATE_KEY`.
- The API signs version-1 claims with Ed25519 over the exact UTF-8 JSON bytes and returns `base64url(payload).base64url(signature)`.
- Desktop verifies the signature, product, expiry and per-install random UUID with the matching public key embedded in trusted app config. It stores the signed token using Electron `safeStorage` and can verify it offline.
- The device identity, trust records, chat history and messaging protocol are not changed. License activation does not yet gate or disable personal features.

## Cloudflare setup before activation can work

1. Create a D1 database for this Pages project and bind it as `LICENSE_DB` in both Production and Preview environments using the Cloudflare Pages dashboard. The existing Wrangler config stays unchanged until a real database ID is available.
2. Apply `migrations/0001_organization_licenses.sql` to that database with Wrangler.
3. Set Cloudflare Pages secrets `LICENSE_SIGNING_PRIVATE_KEY` (the Ed25519 PKCS#8 PEM) and `LICENSE_ADMIN_TOKEN` (a long random secret). Never commit either value or add them to a client build.
4. Keep the paired Ed25519 public key in `backend-go/app-config.json` as `licensePublicKey`. The matching private key must be set in Cloudflare Pages. Rotate only by coordinating an app release with a new trusted public key.
5. Redeploy Pages so the binding and secrets are active. Static Next export remains in `out/`; the `functions/` directory supplies the Pages Functions.

The signing key pair is created locally in `functions/.secrets/` by the setup script if absent. Back up the private key in a password manager or other protected secret store before relying on issued licenses. Do not paste it into chat or commit it.

## Manual request and issuance

Users can request an organization code at `https://lymora.in/license/`. An administrator reviews requests with `node scripts/license-admin.mjs requests`, then issues an expiring or perpetual license with `node scripts/license-admin.mjs issue "Organization" 10 365 <request-id>` (use `never` for no expiry). Set `LYMORA_LICENSE_ADMIN_TOKEN` in the shell first. The code is shown once; send it to the requester through an agreed channel. The app activates it online once and then checks the signed license offline. Codes are case-insensitive and bound to devices up to the issued seat count.

Do not issue real customer licenses until database backups, support ownership, request retention/deletion, signing-key recovery and revocation operations are established. Existing issued licenses cannot be revoked by the current admin interface. Offline clients cannot receive revocations or release seats themselves.

## Later payment integration

A provider's verified webhook should call the same internal issuance logic after validating signature, amount, currency, payment status, idempotency key and product. Never issue based on a browser redirect or client-supplied payment result. Keep the ₹1 amount in provider test mode only; no live pricing is configured here.

## Privacy and limitations

The request page sends organization and email to Lymora's Cloudflare-hosted D1 database. The public endpoint applies a small per-IP request limit; administrators can review pending requests and delete a request when its data is no longer needed. Rate limits are application-level defenses and not a guarantee against abuse. Offline expiry relies on the local clock. The installer currently keeps personal use available; the code flow is not a payment or feature-enforcement system.
