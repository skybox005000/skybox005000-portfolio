import { Nav } from "@/components/nav";
import { signalTypes } from "@portfolio/contracts";

const signalLabels = {
  recruiter_interest: "Recruiting",
  referral: "Referral",
  project_opportunity: "Project Opportunity",
  endorsement: "Endorsement",
  portfolio_feedback: "Portfolio Feedback",
};

export default async function SignalPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const query = await searchParams;
  const selectedType = signalTypes.some((type) => type === query.type)
    ? query.type
    : "recruiter_interest";

  return (
    <main className="shell">
      <Nav />
      <section className="section narrow">
        <div className="eyebrow">Contact</div>
        <h1 style={{ fontSize: 52 }}>Start a conversation</h1>
        <p className="lead">
          Share a role, referral, project idea, endorsement, or quick note.
          Daryl can review the context and follow up directly.
        </p>
        <form className="card form" action="/api/signals" method="post">
          <label>
            Message type
            <select className="select" name="type" defaultValue={selectedType}>
              {signalTypes.map((type) => (
                <option value={type} key={type}>
                  {signalLabels[type]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input className="input" name="name" required maxLength={100} />
          </label>
          <label>
            Email
            <input
              className="input"
              type="email"
              name="email"
              required
              maxLength={160}
            />
          </label>
          <label>
            Company or organization
            <input className="input" name="organization" maxLength={160} />
          </label>
          <label>
            Message
            <textarea
              className="textarea"
              name="message"
              required
              maxLength={4000}
            />
          </label>
          <label>
            Related link
            <input className="input" type="url" name="contextUrl" />
          </label>
          <button className="button primary" type="submit">
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
