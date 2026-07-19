import { Nav } from "@/components/nav";
import { profile } from "@portfolio/config";

const resumePath = "/daryl-bravo-resume-2026.pdf";

export default function ResumePage() {
  return (
    <main className="shell">
      <Nav />

      <section className="section resume-section">
        <div className="resume-header">
          <div>
            <div className="eyebrow">Resume</div>
            <h1>{profile.name}</h1>
          </div>
          <a className="button primary" href={resumePath} download>
            Download Resume
          </a>
        </div>

        <iframe
          className="resume-frame"
          src={resumePath}
          title={`${profile.name} Resume`}
        />
      </section>
    </main>
  );
}
