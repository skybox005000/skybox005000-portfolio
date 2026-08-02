import { Nav } from "@/components/nav";
import { getProfileStats, listSignals } from "@portfolio/database";

export const dynamic = "force-dynamic";

const signalLabels: Record<string, string> = {
  recruiter_interest: "Recruiting",
  referral: "Referral",
  project_opportunity: "Project Opportunity",
  endorsement: "Endorsement",
  portfolio_feedback: "Portfolio Feedback",
};

const opportunityTypes = new Set([
  "recruiter_interest",
  "referral",
  "project_opportunity",
]);

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function Dashboard() {
  const [signals, profileStats] = await Promise.all([
    listSignals().catch(() => []),
    getProfileStats().catch(() => ({
      views: 0,
      uniqueVisitors: [],
      updatedAt: new Date(),
    })),
  ]);
  const opportunityCount = signals.filter((signal) =>
    opportunityTypes.has(signal.type),
  ).length;
  const latestSignal = signals[0];
  const signalBreakdown = Object.entries(
    signals.reduce<Record<string, number>>((counts, signal) => {
      counts[signal.type] = (counts[signal.type] ?? 0) + 1;
      return counts;
    }, {}),
  );

  return (
    <main className="shell">
      <Nav />
      <section className="section dashboard-section">
        <div className="eyebrow">Dashboard</div>
        <h1>Portfolio Activity</h1>
        <div className="grid">
          <article className="card">
            <div className="metric">{profileStats.views}</div>
            <h3>Unique Profile Views</h3>
            <p className="muted">Unique visitors on the deployed portfolio.</p>
          </article>
          <article className="card">
            <div className="metric">{signals.length}</div>
            <h3>Total Messages</h3>
            <p className="muted">All contact submissions.</p>
          </article>
          <article className="card">
            <div className="metric">{opportunityCount}</div>
            <h3>Active Opportunities</h3>
            <p className="muted">Recruiting, referral, and project leads.</p>
          </article>
          <article className="card">
            <div className="metric">{latestSignal ? "New" : "None"}</div>
            <h3>Latest Activity</h3>
            <p className="muted">
              {latestSignal
                ? `${signalLabels[latestSignal.type] ?? latestSignal.type} from ${latestSignal.name}`
                : "No portfolio submissions yet."}
            </p>
          </article>
        </div>

        <div className="dashboard-grid">
          <section>
            <h2>Message Breakdown</h2>
            <div className="card insight-list">
              {signalBreakdown.length === 0 ? (
                <p className="muted">No message categories yet.</p>
              ) : (
                signalBreakdown.map(([type, count]) => (
                  <div className="insight-row" key={type}>
                    <span>{signalLabels[type] ?? type}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2>Latest Message</h2>
            <div className="card">
              {latestSignal ? (
                <>
                  <div className="eyebrow">
                    {formatDate(latestSignal.createdAt)}
                  </div>
                  <h3>{latestSignal.name}</h3>
                  <p className="muted">
                    {signalLabels[latestSignal.type] ?? latestSignal.type}
                  </p>
                  {latestSignal.organization ? (
                    <p className="muted">{latestSignal.organization}</p>
                  ) : null}
                  <a
                    className="message-email"
                    href={`mailto:${latestSignal.email}?subject=${encodeURIComponent("Re: your portfolio message")}`}
                  >
                    {latestSignal.email}
                  </a>
                  <p className="muted">{latestSignal.message}</p>
                  <a
                    className="button reply-button"
                    href={`mailto:${latestSignal.email}?subject=${encodeURIComponent("Re: your portfolio message")}`}
                  >
                    Reply
                  </a>
                </>
              ) : (
                <p className="muted">No latest message yet.</p>
              )}
            </div>
          </section>
        </div>

        <h2>Messages</h2>
        <div className="card">
          {signals.length === 0 ? (
            <p className="muted">No submissions yet.</p>
          ) : (
            signals.map((signal) => (
              <div className="inbox-item" key={signal.id}>
                <strong>{signalLabels[signal.type] ?? signal.type}</strong>
                <span className="muted"> - {signal.name}</span>
                {signal.organization ? (
                  <span className="muted">, {signal.organization}</span>
                ) : null}
                <a
                  className="message-email"
                  href={`mailto:${signal.email}?subject=${encodeURIComponent("Re: your portfolio message")}`}
                >
                  {signal.email}
                </a>
                <p className="muted">{signal.message}</p>
                <a
                  className="button reply-button"
                  href={`mailto:${signal.email}?subject=${encodeURIComponent("Re: your portfolio message")}`}
                >
                  Reply
                </a>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
