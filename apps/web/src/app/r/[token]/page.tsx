import { Nav } from "@/components/nav";
import { profile } from "@portfolio/config";

export default async function RecruiterMode({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div>
          <div className="eyebrow">Recruiter View</div>
          <h1>Engineering Experience for Modern AI Teams</h1>
          <p className="lead">
            A focused look at Daryl's full-stack GenAI engineering experience,
            agentic AI work, Google ecosystem delivery, cloud and DevOps
            ownership, and enterprise automation projects.
          </p>
          <div className="actions">
            <a className="button primary" href="/matcher">
              Check Role Fit
            </a>
            <a className="button" href="/signal?type=recruiter_interest">
              Contact Daryl
            </a>
          </div>
        </div>
        <pre className="terminal">{`$ session
${token.slice(0, 6)}

$ focus
${profile.title}

$ location
${profile.location}

$ current work
${profile.experience[0].organization}`}</pre>
      </section>
    </main>
  );
}
