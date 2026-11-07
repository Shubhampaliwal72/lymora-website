export function NetworkFallback({ animated = false, playing = false, run = 0 }: { animated?: boolean; playing?: boolean; run?: number }) {
  return <div className="network-fallback" aria-hidden="true" data-animated={animated || undefined} data-playing={playing || undefined}>
    <svg className="fallback-paths" viewBox="0 0 1000 780" fill="none">
      <path className="fallback-path-muted" d="M370 495Q820 810 865 495" />
      <path className="fallback-path" d="M380 495C395 160 805 145 865 495" />
      <path key={run} className="fallback-signal" d="M380 495C395 160 805 145 865 495" />
    </svg>
    <div className="fallback-computer fallback-back"><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Studio PC</span></div>
    <div className="fallback-computer fallback-right"><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Team PC</span></div>
    <div className="fallback-computer fallback-front"><div className="fallback-screen"><div className="screen-app"/></div><span className="computer-label">Your PC</span></div>
  </div>;
}
