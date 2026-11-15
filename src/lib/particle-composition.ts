export type ParticleComposition = {x: number; y: number; scale: number; quiet: number; halo: number};
export type ParticleStop = ParticleComposition & {at: number};
type CompositionAnchor = {selector: string; x: number; y?: number; scale: number; quiet: number; halo: number};

/** Placement is measured when layout changes. The opening is fitted to its actual stage. */
export function measureParticleComposition(pathname: string): ParticleStop[] {
  const home = pathname === "/";
  const anchors: CompositionAnchor[] = home ? [
    {selector: "#the-app", x: .5, y: .51, scale: 1, quiet: .92, halo: 1},
    {selector: "#network-preview", x: .16, y: .48, scale: .92, quiet: .28, halo: .22},
    {selector: "#experience", x: .22, scale: .96, quiet: .50, halo: .18},
    {selector: "#how-it-works", x: .18, scale: .88, quiet: .54, halo: .12},
    {selector: "#together", x: .22, scale: .90, quiet: .52, halo: .1},
    {selector: "#getting-started", x: .82, scale: .82, quiet: .42, halo: .08},
    {selector: "#download", x: .22, scale: .84, quiet: .48, halo: .08},
    {selector: ".glass-footer", x: .79, scale: .72, quiet: .50, halo: 0},
  ] : [
    {selector: "main", x: .84, scale: .79, quiet: .78, halo: .20},
    {selector: ".glass-footer", x: .80, scale: .62, quiet: .65, halo: 0},
  ];
  const stops: ParticleStop[] = [];
  for (const item of anchors) {
    const element = document.querySelector(item.selector);
    if (!element) continue;
    const box = element.getBoundingClientRect();
    const content = element.classList.contains("container") ? element : element.querySelector(".container") ?? element;
    const bounds = content.getBoundingClientRect();
    const stop: ParticleStop = {
      at: box.top + scrollY + Math.min(box.height * .28, innerHeight * .24),
      x: (bounds.left + bounds.width * item.x) / innerWidth,
      y: item.y ?? .52, scale: item.scale, quiet: item.quiet, halo: item.halo,
    };
    const stage = element.querySelector(".hero-stage")?.getBoundingClientRect();
    if (stage) {
      const base = Math.min(innerWidth * .158, innerHeight * .153);
      const diameter = Math.min(stage.height * 1.04, innerWidth * .88, 1280);
      stop.x = (stage.left + stage.width / 2) / innerWidth;
      stop.y = (stage.top + scrollY + stage.height / 2) / innerHeight;
      stop.scale = diameter / (5.8 * base);
      // Hold the opening's measured composition while the centered copy is read.
      stops.push({...stop, at: 0}, {...stop, at: box.top + scrollY + box.height * .62});
    } else stops.push(stop);
  }
  return stops.sort((a, b) => a.at - b.at);
}

export function particleCompositionAt(stops: ParticleStop[], scroll: number): ParticleComposition {
  if (!stops.length) return {x: .5, y: .51, scale: 1, quiet: .8, halo: .6};
  const focus = scroll + innerHeight * .48;
  const next = stops.findIndex(stop => stop.at > focus);
  if (next === 0) return stops[0];
  if (next === -1) return stops[stops.length - 1];
  const a = stops[next - 1], b = stops[next];
  const t = Math.min(1, Math.max(0, (focus - a.at) / Math.max(1, b.at - a.at)));
  const eased = t * t * (3 - 2 * t);
  return {
    x: a.x + (b.x - a.x) * eased, y: a.y + (b.y - a.y) * eased,
    scale: a.scale + (b.scale - a.scale) * eased,
    quiet: a.quiet + (b.quiet - a.quiet) * eased,
    halo: a.halo + (b.halo - a.halo) * eased,
  };
}
