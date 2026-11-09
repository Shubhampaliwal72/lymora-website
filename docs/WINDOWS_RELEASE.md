# Windows release distribution

## Current release

Lymora LAN Messenger 1.0.1, Windows x64 build 014, was built and published on 2026-11-09 with explicit owner authorization. Windows is the only supported platform currently advertised.

- Notes: https://github.com/Shubhampaliwal72/lymora-website/releases/tag/v1.0.1
- Installer: https://github.com/Shubhampaliwal72/lymora-website/releases/download/v1.0.1/Lymora-LAN-Setup-1.0.1-build.014-x64.exe
- Checksums: https://github.com/Shubhampaliwal72/lymora-website/releases/download/v1.0.1/SHA256SUMS.txt
- Update metadata: https://github.com/Shubhampaliwal72/lymora-website/releases/download/v1.0.1/latest.yml
- Built: 2026-11-09T13:39:52.437Z; release channel.
- Size: 76,178,031 bytes (72.6 MiB).
- SHA-256: 17b1864774a3bf884ab303ca88104af920267d3f14a0eb9b8cfc640afdbc6ce3.

The public installer was downloaded without authentication and verified in full against the local archive using SHA-256, SHA-512, byte count, checksum filename and latest.yml metadata. GitHub asset digests also matched. The binary is unsigned; Windows may display unknown-publisher or SmartScreen prompts.

## What changed

Windows releases now check the public update feed after startup and through Settings > About. Users choose to download, see progress and confirm restarting to install. LAN messaging does not need internet; update checks and downloads do. The installed executable's PE FileDescription is Lymora LAN, replacing the longer peer-to-peer description without changing appId or user-data paths.

The current release includes the group-administration and uninstaller cache-cleanup work absent from the previously published build 013. Build 013 users must install 1.0.1 manually once, because their existing binary has no updater. Future releases require an increased app version and matching published updater metadata.

## Website integration

src/lib/releases/windows.json is the single release manifest. Only /downloads/ exposes installer, compatibility, checksum and release-note details. Header, homepage and product CTAs navigate there. The old release-notes route remains a handoff to the central page. Support channels stay null until verified; macOS/Linux Coming soon panels are informational, as approved by the owner; they expose no downloads, dates or compatibility promises.

The existing public website repository hosts release assets independently of website deployment. Its source archives contain website code, not the private desktop application. No installer is copied into public/, out/ or Git source history. Website source changes do not deploy themselves; commit/push/deployment still need separate authorization.

## Verification and limits

The desktop release passed TypeScript/build, controller, frontend, installer and actual bundled-renderer checks. The packaged electron-updater downloaded the real installer through an isolated loopback feed, rejected a bad SHA-512, and ignored an older version. It then read the actual public GitHub feed using the packaged provider configuration: 1.0.0 sees 1.0.1 available, and 1.0.1 sees itself as current. No in-place installer execution, physical two-PC upgrade or Windows preference changes were performed. Existing user profiles and chats were not used by test fixtures.

For a future release, verify the exact binary and publish its .exe, blockmap, latest.yml and SHA256SUMS.txt under a standard version tag. Verify the public bytes and feed before updating this manifest. Never relabel filenames after packaging, guess URLs or publish draft links. Rebuild and check the website's lint, types, static export and download navigation before deployment.
