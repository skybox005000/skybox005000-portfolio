import { Nav } from "@/components/nav";
import { featuredProjects, profile } from "@portfolio/config";
import { recordProfileView } from "@portfolio/database";
import { headers } from "next/headers";

const resumePath = "/daryl-bravo-resume-2026.pdf";

const terminalLines = [
  "$ whoami",
  "Software Engineer at Accenture",
  "",
  "$ location",
  profile.location,
  "",
  "$ github",
  profile.github,
  "",
  "$ linkedin",
  "/in/darylbravo",
  "",
  "$ email",
  profile.email,
  "",
  "$ phone",
  profile.phone,
];

export const dynamic = "force-dynamic";

function getVisitorIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    "local"
  );
}

export default async function Home() {
  const requestHeaders = await headers();
  await recordProfileView(getVisitorIp(requestHeaders)).catch(() => null);

  return (
    <main className="shell">
      <Nav />

      <section className="hero">
        <div>
          <div className="eyebrow">{profile.focus.join(" | ")}</div>
          <h1>{profile.name}</h1>
          <p className="lead">{profile.summary}</p>
          <div className="actions">
            <a
              className="button primary"
              href="/signal?type=recruiter_interest"
            >
              Recruit or Collaborate
            </a>
            <a className="button" href="/matcher">
              Check Role Fit
            </a>
            <a className="button" href="/assistant">
              Ask Portfolio AI
            </a>
            <a className="button" href="/resume">
              View Resume
            </a>
          </div>
        </div>

        <pre className="terminal hero-terminal">{terminalLines.join("\n")}</pre>
      </section>

      <section className="grid">
        <article className="card">
          <div className="metric">2021</div>
          <h3>Accenture Growth</h3>
          <p className="muted">
            Started September 2021 and moved from R&D prototypes into enterprise
            delivery ownership.
          </p>
        </article>
        <article className="card">
          <div className="metric">AI</div>
          <h3>Workflow AI</h3>
          <p className="muted">
            Built generators, ticket analyzers, document reviewers, and invoice
            validation workflows.
          </p>
        </article>
        <article className="card">
          <div className="metric">Ship</div>
          <h3>Production Habits</h3>
          <p className="muted">
            Covers deployment, CI/CD, Linux troubleshooting, compliance checks,
            and production support.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Core Technical Expertise</div>
        <h2>Toolbox</h2>
        <div className="grid">
          {profile.expertise.map((group) => (
            <article className="card" key={group.area}>
              <h3>{group.area}</h3>
              <p className="muted">{group.skills.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Professional Experience</div>
        <h2>Experience</h2>
        <div className="timeline">
          {profile.experience.map((item) => (
            <article className="card" key={`${item.role}-${item.period}`}>
              <div className="eyebrow">{item.period}</div>
              <h3>{item.role}</h3>
              <p className="muted">{item.organization}</p>
              <p className="muted">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="work" className="section">
        <div className="eyebrow">Key Projects</div>
        <h2>Selected Work</h2>
        <div className="grid">
          {featuredProjects.map((project) => (
            <article className="card" key={project.slug}>
              <h3>{project.name}</h3>
              <p className="muted">{project.summary}</p>
              <p className="eyebrow">{project.stack.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="section">
        <div className="eyebrow">Platform Architecture</div>
        <h2>System Flow</h2>
        <div className="card architecture-card">
          <pre className="terminal">{`Visitor or Recruiter
        |
Next.js Portfolio UI
        |
+----------------------+----------------------+
|                      |                      |
Role Fit              Ask Portfolio          Contact and Dashboard
|                      |                      |
Semantic search       Semantic search        Contact form
(match score,          (retrieved evidence)   + unique view tracking
matched terms,         |                      |
project evidence)      |                      |
|                      |                      |
AI-generated brief     AI-generated answer    Local JSON activity store
(streamed response)    (streamed response)    |
|                      |                      |
Clear separation: search evidence first, generated response second
        |
Dockerized Next.js app on Linux
        |
Source changes -> CI checks -> server deployment`}</pre>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="eyebrow">Career Highlights</div>
          <h2>Recognition and Training</h2>
          <ul className="muted">
            {profile.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <a className="button primary" href="/signal">
            Contact Daryl
          </a>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>{profile.name}</strong>
          <span>Full-Stack and Generative AI Engineer</span>
        </div>
        <div className="footer-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin}>LinkedIn</a>
        </div>
      </footer>
    </main>
  );
}