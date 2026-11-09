import windowsRelease from "./releases/windows.json";

// Owner-approved public information only. Empty values intentionally publish no external links.
// Installers are distributed through owner-approved GitHub Releases, not website assets.
export type Release = {
  build: string;
  channel: string;
  builtAt: string;
  assetName: string;
  bytes: number;
  checksumUrl: string;
  signed: boolean;
  version: string;
  publishedAt: string;
  architecture: string;
  windowsRequirement: string;
  size: string;
  sha256: string;
  downloadUrl: string;
  notesUrl: string;
  changes: readonly string[];
  knownIssues: readonly string[];
};
export const publicLinks: {
  release: Release | null;
  support: { email: string | null; issuesUrl: string | null };
} = {
  release: windowsRelease,
  support: { email: null, issuesUrl: null },
};
