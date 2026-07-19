import { Nav } from "@/components/nav";

export default function Thanks() {
  return (
    <main className="shell">
      <Nav />
      <section className="section narrow">
        <div className="card">
          <div className="eyebrow">Message Sent</div>
          <h1>Thank you.</h1>
          <p className="lead">
            Your message has been received. Daryl can review the details and
            follow up directly.
          </p>
          <a className="button" href="/">
            Return Home
          </a>
        </div>
      </section>
    </main>
  );
}
