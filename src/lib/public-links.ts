// Owner-approved public information only. Empty values intentionally publish no external links.
// Future installers are distributed through verified GitHub Releases, not Pages assets.
type Release = {
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
  release: null,
  support: { email: null, issuesUrl: null },
};
