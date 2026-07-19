import { Nav } from "@/components/nav";
import { listSignals } from "@portfolio/database";

const signalLabels: Record<string, string> = {
  recruiter_interest: "Recruiting",
  referral: "Referral",
  project_opportunity: "Project Opportunity",
  endorsement: "Endorsement",
  portfolio_feedback: "Portfolio Feedback",
};

export default async function Dashboard() {
  const signals = await listSignals().catch(() => []);

  return (
    <main className="shell">
      <Nav />
      <section className="section">
        <div className="eyebrow">Dashboard</div>
        <h1 style={{ fontSize: 52 }}>Portfolio Activity</h1>
        <div className="grid">
          <article className="card">
            <div className="metric">{signals.length}</div>
            <h3>Messages</h3>
          </article>
          <article className="card">
            <div className="metric">Ready</div>
            <h3>GitHub Activity</h3>
          </article>
          <article className="card">
            <div className="metric">3</div>
            <h3>AI Experience</h3>
          </article>
        </div>

        <h2>Messages</h2>
        <div className="card">
          {signals.length === 0 ? (
            <p className="muted">
              No submissions yet.
            </p>
          ) : (
            signals.map((signal) => (
              <div className="inbox-item" key={signal.id}>
                <strong>{signalLabels[signal.type] ?? signal.type}</strong>
                <span className="muted"> - {signal.name}</span>
                {signal.organization ? (
                  <span className="muted">, {signal.organization}</span>
                ) : null}
                <p className="muted">{signal.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
