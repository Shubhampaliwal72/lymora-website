import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

function fail(message) { throw new Error(message); }
function sha(file, algorithm = 'sha256', encoding = 'hex') { return crypto.createHash(algorithm).update(fs.readFileSync(file)).digest(encoding); }
function parseTag(tag) {
  const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(tag ?? '');
  if (!match) fail('Expected a stable vMAJOR.MINOR.PATCH release tag.');
  return { version: match.slice(1).join('.'), tuple: match.slice(1).map(Number) };
}
function compare(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}
function checksumMap(text) {
  const result = new Map();
  for (const line of text.split(/\r?\n/).filter(Boolean)) {
    const item = /^([a-f0-9]{64})  ([^\r\n]+)$/.exec(line);
    if (!item || result.has(item[2])) fail('SHA256SUMS.txt is malformed or contains duplicate assets.');
    result.set(item[2], item[1]);
  }
  return result;
}
function updateManifest({ manifestPath, bundlePath, tag, publishedAt }) {
  const { version, tuple } = parseTag(tag);
  const dir = path.resolve(bundlePath);
  const manifestFile = path.resolve(manifestPath);
  const current = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const currentParts = parseTag(`v${current.version}`).tuple;
  if (compare(tuple, currentParts) <= 0) fail(`Refusing release ${version}; website currently advertises ${current.version}.`);
  const info = JSON.parse(fs.readFileSync(path.join(dir, 'build-info.json'), 'utf8'));
  if (info.version !== version || info.channel !== 'release' || info.dirty !== false || info.platform !== 'win' || info.arch !== 'x64' || info.target !== 'nsis' || info.authenticodeSigned !== true || !String(info.windowsPublisher ?? '').trim()) fail('Build metadata is not a clean, signed, stable Windows x64 release.');
  if (!/^\d{3}$/.test(info.buildLabel ?? '')) fail('Release build number is malformed.');
  const assetName = `Lymora-LAN-Setup-${version}-build.${info.buildLabel}-x64.exe`;
  const installer = path.join(dir, assetName);
  const installerBytes = fs.statSync(installer).size;
  const buildArtifact = info.artifacts?.find(item => item.name === assetName);
  if (!buildArtifact || buildArtifact.bytes !== installerBytes || buildArtifact.sha256 !== sha(installer)) fail('build-info.json does not match the exact installer.');
  const sums = checksumMap(fs.readFileSync(path.join(dir, 'SHA256SUMS.txt'), 'utf8'));
  for (const name of [assetName, `${assetName}.blockmap`, 'latest.yml', 'RELEASE_NOTES.md']) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file) || sums.get(name) !== sha(file)) fail(`Published release asset is missing or fails its SHA-256 entry: ${name}`);
  }
  const feed = fs.readFileSync(path.join(dir, 'latest.yml'), 'utf8');
  const feedVersion = /^version:\s*([^\s]+)\s*$/m.exec(feed)?.[1];
  const feedUrl = /^\s+- url:\s*([^\s]+)\s*$/m.exec(feed)?.[1];
  const feedSha = /^\s+sha512:\s*([^\s]+)\s*$/m.exec(feed)?.[1];
  const feedSize = Number(/^\s+size:\s*(\d+)\s*$/m.exec(feed)?.[1]);
  if (feedVersion !== version || feedUrl !== assetName || feedSha !== sha(installer, 'sha512', 'base64') || feedSize !== installerBytes) fail('latest.yml does not describe the exact published installer.');
  const notes = fs.readFileSync(path.join(dir, 'RELEASE_NOTES.md'), 'utf8').trim();
  if (!notes) fail('Release notes are empty.');
  const noteLines = notes.split(/\r?\n/);
  const changes = [];
  let inKnownIssues = false;
  for (const line of noteLines) {
    if (/^#{1,6}\s+known issues\s*$/i.test(line.trim())) { inKnownIssues = true; continue; }
    if (/^#{1,6}\s+/.test(line.trim())) inKnownIssues = false;
    if (!inKnownIssues && /^\s*[-*]\s+/.test(line)) changes.push(line.replace(/^\s*[-*]\s+/, '').trim());
  }
  const knownHeading = noteLines.findIndex(line => /^#{1,6}\s+known issues\s*$/i.test(line.trim()));
  if (knownHeading < 0) fail('Release notes must include a Known issues section; use None when appropriate.');
  const knownLines = [];
  for (const line of noteLines.slice(knownHeading + 1)) {
    if (/^#{1,6}\s+/.test(line.trim())) break;
    if (/^\s*[-*]\s+/.test(line)) knownLines.push(line.replace(/^\s*[-*]\s+/, '').trim());
  }
  const knownIssues = knownLines.filter(value => value && !/^none\.?$/i.test(value)).slice(0, 12);
  changes.splice(12);
  const size = `${(installerBytes / (1024 * 1024)).toFixed(1)} MiB`;
  const published = new Date(publishedAt);
  if (!Number.isFinite(published.getTime())) fail('GitHub did not provide a valid published timestamp.');
  const baseUrl = `https://github.com/Shubhampaliwal72/lymora-website/releases/download/${tag}`;
  const next = {
    ...current,
    available: true,
    version,
    build: info.buildLabel,
    publishedAt: published.toISOString().slice(0, 10),
    builtAt: info.builtAt,
    architecture: 'x64',
    windowsRequirement: 'Windows 10 or later (64-bit)',
    size,
    bytes: installerBytes,
    assetName,
    signed: true,
    sha256: sha(installer),
    downloadUrl: `${baseUrl}/${assetName}`,
    checksumUrl: `${baseUrl}/SHA256SUMS.txt`,
    notesUrl: `https://github.com/Shubhampaliwal72/lymora-website/releases/tag/${tag}`,
    changes: changes.length ? changes : [notes.split(/\r?\n/, 1)[0].slice(0, 240)],
    knownIssues,
    channel: 'release',
  };
  fs.writeFileSync(manifestFile, `${JSON.stringify(next, null, 2)}\n`);
  return { version, assetName, bytes: installerBytes, sha256: next.sha256, publishedAt: next.publishedAt };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [manifestPath, bundlePath, tag, publishedAt] = process.argv.slice(2);
    if (!manifestPath || !bundlePath || !tag || !publishedAt) fail('Usage: node scripts/sync-windows-release.mjs <manifest.json> <downloaded-assets-dir> <tag> <published-at-iso>');
    console.log(JSON.stringify(updateManifest({ manifestPath, bundlePath, tag, publishedAt })));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

export { updateManifest, checksumMap };
