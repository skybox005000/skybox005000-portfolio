import { Nav } from "@/components/nav";
import { featuredProjects, profile } from "@portfolio/config";
import { recordProfileView } from "@portfolio/database";
import { headers } from "next/headers";

const terminalLines = [
  "$ whoami",
  profile.title,
  "",
  "$ location",
  profile.location,
  "",
  "$ focus",
  ...profile.focus,
  "",
  "$ github",
  profile.github,
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
  const profileStats = await recordProfileView(
    getVisitorIp(requestHeaders),
  ).catch(() => ({ views: 0 }));

  return (
    <main className="shell">
      <Nav />

      <section className="hero">
        <div>
          <div className="eyebrow">{profile.focus.join(" / ")}</div>
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
          </div>
        </div>

        <pre className="terminal">{terminalLines.join("\n")}</pre>
      </section>

      <section className="grid">
        <article className="card">
          <div className="metric">{profileStats.views}</div>
          <h3>Unique Profile Views</h3>
          <p className="muted">
            Counted from unique visitor IPs on the deployed portfolio.
          </p>
        </article>
        <article className="card">
          <div className="metric">5+ Years</div>
          <h3>Accenture Delivery</h3>
          <p className="muted">
            Progressive experience from technology R&D to enterprise GenAI
            engineering in an engagement supporting Google.
          </p>
        </article>
        <article className="card">
          <div className="metric">AI</div>
          <h3>GenAI and Agents</h3>
          <p className="muted">
            Azure OpenAI, OpenAI, Gemini, Vertex AI, prompt engineering, LLM
            integration, AI agents, and Google ADK.
          </p>
        </article>
        <article className="card">
          <div className="metric">Cloud</div>
          <h3>Production Readiness</h3>
          <p className="muted">
            GCP, Azure, AWS, Docker, Kubernetes, Linux, Nginx, CI/CD, GitHub
            Actions, Jenkins, and operational troubleshooting.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Core Technical Expertise</div>
        <h2>Technical Strengths</h2>
        <div className="grid">
          {profile.expertise.map((group) => (
            <article className="card" key={group.area}>
              <h3>{group.area}</h3>
              <p className="muted">{group.skills.join(" / ")}</p>
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
        <h2>Enterprise AI, Automation, and Cloud Delivery</h2>
        <div className="grid">
          {featuredProjects.map((project) => (
            <article className="card" key={project.slug}>
              <h3>{project.name}</h3>
              <p className="muted">{project.summary}</p>
              <p className="eyebrow">{project.stack.join(" / ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="section">
        <div className="eyebrow">Platform Architecture</div>
        <h2>How This Portfolio Is Built</h2>
        <div className="card">
          <pre className="terminal">{`Visitor / Recruiter
        |
Next.js Portfolio + Recruiter Mode
        |
Local JSON activity store
        |
Dashboard insights + contact signals
        |
Docker deployment on Linux`}</pre>
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
          <span>Full Stack and Generative AI Engineer</span>
        </div>
        <div className="footer-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin}>LinkedIn</a>
        </div>
      </footer>
    </main>
  );
}
