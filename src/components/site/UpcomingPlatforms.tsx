/** Owner-approved roadmap information; no download controls or release promises. */
export function UpcomingPlatforms() {
  return <section className="upcoming-platforms" aria-labelledby="upcoming-platforms-title">
    <div className="upcoming-platforms-heading"><div><p className="eyebrow">A wider circle</p><h2 id="upcoming-platforms-title">More places to connect.</h2></div><p>Available on Windows today.<br/>macOS and Linux are coming soon.</p></div>
    <div className="upcoming-platforms-grid">
      <article className="upcoming-platform glass-panel" data-upcoming-platform="macos" aria-labelledby="macos-platform-title">
        <span className="upcoming-platform-art" aria-hidden="true"><span className="platform-monogram">M</span><span className="platform-orbit"/></span>
        <div className="upcoming-platform-copy"><p className="upcoming-platform-status"><span/>Coming soon</p><h3 id="macos-platform-title">macOS</h3><p>The next chapter, for your Mac.</p></div><span className="upcoming-platform-index" aria-hidden="true">01 / NEXT</span>
      </article>
      <article className="upcoming-platform glass-panel" data-upcoming-platform="linux" aria-labelledby="linux-platform-title">
        <span className="upcoming-platform-art" aria-hidden="true"><span className="platform-monogram">L</span><span className="platform-orbit"/></span>
        <div className="upcoming-platform-copy"><p className="upcoming-platform-status"><span/>Coming soon</p><h3 id="linux-platform-title">Linux</h3><p>A local connection, on your terms.</p></div><span className="upcoming-platform-index" aria-hidden="true">02 / NEXT</span>
      </article>
    </div>
    <p className="upcoming-platforms-note">In our plans, not available to download yet. Release dates and system requirements will be shared here when confirmed.</p>
  </section>;
}
