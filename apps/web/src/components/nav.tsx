export function Nav() {
  return (
    <nav className="nav">
      <a className="brand" href="/">
        DJJB<span style={{ color: "var(--accent)" }}>.</span>
      </a>
      <div className="nav-links">
        <a className="pill" href="/#work">
          Work
        </a>
        <a className="pill" href="/#architecture">
          Architecture
        </a>
        <a className="pill" href="/signal">
          Contact
        </a>
        <a className="pill" href="/dashboard">
          Dashboard
        </a>
      </div>
    </nav>
  );
}
