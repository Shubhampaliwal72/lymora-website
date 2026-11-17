/** Shared build-time indexing policy for Next metadata and export verification.
 * Production exports are public unless explicitly disabled; previews stay non-indexable.
 * @param {Record<string, string | undefined>} env
 */
export function isPublicBuild(env) {
  return env.NODE_ENV !== 'development' &&
    env.LYMORA_PUBLIC_LAUNCH !== 'false' &&
    (!env.CF_PAGES_BRANCH || env.CF_PAGES_BRANCH === 'main');
}
