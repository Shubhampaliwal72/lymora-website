# Organization license operations

## Current release model

Personal use remains free: users can choose **Start free** without payment details, a cloud account, an organization code, or an internet connection. Core LAN messaging is not gated by this service.

Organizations are currently managed by authorized Lymora administrators. An organization contacts Lymora; an administrator reviews the request, creates one organization license, chooses its device-seat limit and expiry, and sends the activation code to the organization through a separately agreed channel. The organization shares that code with approved members, who activate their own desktop installations. There is no public owner dashboard, customer account, invitation workflow, email verification, or payment processing in this release.

## Existing service and security boundaries

- `/license/` is a static request page backed by the Pages Function `/api/license/request`. Requests are stored in D1 for manual review; no account is created and no email is automatically sent.
- D1 stores a SHA-256 code hash, organization identity, expiry, seat limit and active flag. It stores per-install activation IDs, not desktop private identity keys or trust records.
- `LICENSE_ADMIN_TOKEN` protects all admin endpoints. `LICENSE_SIGNING_PRIVATE_KEY` signs Ed25519 activation claims and must remain a Cloudflare secret. The app includes only the matching public verifier.
- The desktop sends a code and installation ID to `/api/license/activate`; successful activation returns a device-bound signed token stored with Electron `safeStorage`. That token can be checked offline.
- The current schema models one license per organization. Seat count and expiry are supported. There is no defined plan catalog or feature entitlement enforcement; do not describe this as a paid tier or claim that a license unlocks features.
- Disabling a license prevents future activation, but cannot instantly invalidate a signed token already stored on an offline PC. Releasing a device frees its D1 seat record; it does not erase the token from that PC. If the code remains active, that installation may activate again. A truly revocable offline lease would require periodic online refresh and is not implemented.

## Administrator setup

Cloudflare Pages must have a `LICENSE_DB` D1 binding and the secrets `LICENSE_ADMIN_TOKEN` and `LICENSE_SIGNING_PRIVATE_KEY` configured in the relevant environment. Apply `migrations/0001_organization_licenses.sql` to D1. Keep the Ed25519 public key in the trusted desktop app configuration. Store the admin token and private signing key in an approved secret manager, restrict access to named Lymora administrators, and never paste either secret into source control, a desktop build, public website JavaScript, or support chat.

The operator CLI requires Node.js and sends the bearer token only to an HTTPS endpoint. Set the token in the current shell; do not put it in command history or a checked-in `.env` file:

```powershell
$env:LYMORA_LICENSE_ADMIN_TOKEN = '<secret from approved secret manager>'
node scripts/license-admin.mjs requests
node scripts/license-admin.mjs issue "Example Organization" 25 365 <request-id>
node scripts/license-admin.mjs licenses
node scripts/license-admin.mjs devices <license-id>
node scripts/license-admin.mjs disable-license <license-id>
node scripts/license-admin.mjs enable-license <license-id>
node scripts/license-admin.mjs release-device <license-id> <device-id>
node scripts/license-admin.mjs delete-request <request-id>
```

`issue` accepts a seat count from 1 to 500 and a duration in days, or `never` for no expiry. Issuing against a pending request changes it to issued and cannot be replayed. The code is printed once in the successful response; deliver it manually and securely. `licenses` returns organization, expiry, seat limit, active state, and activation count, never the raw code or stored hash. `devices` returns device IDs and activation times, so handle this output as organization administration data. Disable/enable affect the server activation record. `release-device` is a seat-management action, not remote token revocation.

The CLI can remove request contact data after review. Consider the organization's support and retention obligations before deleting it. Maintain protected D1 backups and signing-key recovery procedures before issuing real organization codes.

## User flow

1. A member chooses **Join an organization** during setup (or opens Settings → License) and enters the code supplied by their organization.
2. The app contacts the licensing endpoint once for activation; the service verifies the code, expiry and available seats.
3. The service signs a token bound to that desktop installation. The desktop verifies it with the embedded public key and stores it locally using OS-backed Electron `safeStorage`.
4. The signed token is checked locally. Messaging remains local-first and continues without internet; this license service is not a relay or cloud messaging dependency.

## Deployment configuration

1. Bind the existing D1 database to Cloudflare Pages as `LICENSE_DB` in Production and Preview.
2. Apply `migrations/0001_organization_licenses.sql` to the target database.
3. Set `LICENSE_SIGNING_PRIVATE_KEY` and `LICENSE_ADMIN_TOKEN` as Cloudflare secrets; do not add them to `wrangler.jsonc` or client builds.
4. Keep the matching Ed25519 public key in `backend-go/app-config.json`. Coordinate signing-key rotation with a desktop release that trusts the replacement public key.
5. Deploy Pages Functions and test request review, issuance, activation, seat limits and offline desktop verification in a non-production environment first.

Cloudflare Pages serves the static Next.js export while `functions/` provides the `/api/license/*` runtime endpoints; no Next server runtime is required.

## Future extension (not implemented)

Future owner accounts, verified email, invitations and owner-managed organizations can be added behind authenticated APIs. Link those identities to the stable `organization_id` and license records so activation/token verification does not need to be replaced. Before adding that layer, define organization roles, recovery, audit history, entitlement plans, and an offline revocation policy. No self-service account or payment feature should be implied until actually implemented.

A future payment provider may call the existing server-side issuance path only after a verified, idempotent provider webhook. Browser redirects or client-submitted payment status must never issue codes. No payment integration or paid entitlement is present today.

## Verification

```powershell
npm.cmd run test:licenses
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run verify:export
```