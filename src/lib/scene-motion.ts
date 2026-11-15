/** A site-only preference; never changes Windows or browser accessibility settings. */
const key = "lymora-website-motion";
const changeEvent = "lymora:scene-motion";
const reducedQuery = "(prefers-reduced-motion: reduce)";
type MotionChoice = "full" | "reduced";

export function sceneMotionSnapshot() {
  let choice: string | null;
  try { choice = localStorage.getItem(key); }
  catch { choice = document.documentElement.dataset.motionChoice ?? null; }
  return choice === "full" || (choice !== "reduced" && !matchMedia(reducedQuery).matches);
}
export function subscribeSceneMotion(callback: () => void) {
  const media = matchMedia(reducedQuery);
  const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) callback(); };
  media.addEventListener("change", callback);
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", storage);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", storage);
  };
}
export function setSceneMotion(choice: MotionChoice) {
  document.documentElement.dataset.motionChoice = choice;
  document.documentElement.dataset.motion = choice;
  try { localStorage.setItem(key, choice); } catch { /* Current-tab choice still works. */ }
  window.dispatchEvent(new Event(changeEvent));
}
