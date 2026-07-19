"use client";

import { Nav } from "@/components/nav";
import { featuredProjects, profile } from "@portfolio/config";
import { useMemo, useState } from "react";

const evidence = [
  ...profile.focus,
  profile.summary,
  ...profile.expertise.flatMap((group) => group.skills),
  ...profile.experience.flatMap((item) => [
    item.role,
    item.organization,
    item.summary,
  ]),
  ...featuredProjects.flatMap((project) => [
    project.name,
    project.summary,
    ...project.stack,
  ]),
].map((item) => item.toLowerCase());

const scoringAreas = [
  {
    name: "GenAI and Agentic AI",
    terms: [
      "genai",
      "generative ai",
      "llm",
      "agent",
      "prompt",
      "openai",
      "azure openai",
      "gemini",
      "vertex",
      "google adk",
    ],
  },
  {
    name: "Full-Stack Engineering",
    terms: [
      "full stack",
      "python",
      "typescript",
      "javascript",
      "react",
      "next.js",
      "angular",
      "node",
      "api",
      "rest",
    ],
  },
  {
    name: "Cloud and DevOps",
    terms: [
      "cloud",
      "gcp",
      "azure",
      "aws",
      "docker",
      "kubernetes",
      "linux",
      "nginx",
      "ci/cd",
      "github actions",
      "jenkins",
    ],
  },
  {
    name: "Enterprise Delivery",
    terms: [
      "production",
      "automation",
      "workflow",
      "support",
      "documentation",
      "deployment",
      "security",
      "compliance",
    ],
  },
];

function scoreTerms(text: string, terms: string[]) {
  const requested = terms.filter((term) => text.includes(term));
  const matched = requested.filter((term) =>
    evidence.some((source) => source.includes(term)),
  );

  if (requested.length === 0) {
    return { score: 75, matched, requested };
  }

  return {
    score: Math.round((matched.length / requested.length) * 100),
    matched,
    requested,
  };
}

export default function Matcher() {
  const [description, setDescription] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const result = useMemo(() => {
    const text = description.toLowerCase();
    const areas = scoringAreas.map((area) => ({
      ...area,
      ...scoreTerms(text, area.terms),
    }));
    const overall = Math.round(
      areas.reduce((total, area) => total + area.score, 0) / areas.length,
    );
    const topProjects = featuredProjects
      .map((project) => ({
        project,
        hits: [project.name, project.summary, ...project.stack].filter((item) =>
          text.includes(item.toLowerCase()),
        ).length,
      }))
      .filter((item) => item.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 3);

    return { areas, overall, topProjects };
  }, [description]);

  async function generateBrief() {
    if (description.trim().length < 20) {
      setStatus("error");
      setAiBrief("Paste a fuller job description first.");
      return;
    }

    setStatus("loading");
    setAiBrief("");

    const scoreSummary = result.areas
      .map(
        (area) =>
          `${area.name}: ${area.score}% match. Matched: ${area.matched.join(", ") || "none"}`,
      )
      .join("\n");
    const response = await fetch("/api/portfolio-ai/role-fit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, scoreSummary }),
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => ({}));
      setStatus("error");
      setAiBrief(payload.error || "AI generation is unavailable right now.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      setAiBrief(
        (current) => current + decoder.decode(value, { stream: true }),
      );
    }

    setStatus("idle");
  }

  return (
    <main className="shell">
      <Nav />
      <section className="section">
        <div className="eyebrow">Role Fit</div>
        <h1 style={{ fontSize: 52 }}>Job Match</h1>
        <div className="actions tool-actions">
          <a className="button" href="/assistant">
            Ask Portfolio
          </a>
        </div>
        <p className="lead">
          Paste a role to compare its skills, platforms, and delivery needs
          against Daryl's portfolio experience.
        </p>
        <div className="card form">
          <textarea
            className="textarea"
            onChange={(event) => {
              setDescription(event.target.value);
              setAiBrief("");
              setStatus("idle");
            }}
            placeholder="Paste a job description..."
            value={description}
          />

          <div className="ai-split">
            <section className="insight-panel">
              <div className="eyebrow">Semantic Search</div>
              <h3>Match Score and Evidence</h3>
              <div className="result compact-result">
                <div>
                  <div className="eyebrow">Overall Match</div>
                  <div className="metric">
                    {description ? result.overall : 0}%
                  </div>
                </div>
                <div className="score-list">
                  {result.areas.map((area) => (
                    <div key={area.name}>
                      <strong>{area.name}</strong>
                      <div
                        className="scorebar"
                        aria-label={`${area.score}% match`}
                      >
                        <span
                          style={{ width: `${description ? area.score : 0}%` }}
                        />
                      </div>
                      <p className="muted">
                        {area.matched.length > 0
                          ? `Matched: ${area.matched.join(", ")}`
                          : "Paste a role that mentions skills, platforms, or delivery needs."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>Retrieved Projects</h3>
                {result.topProjects.length > 0 ? (
                  result.topProjects.map(({ project }) => (
                    <p className="muted" key={project.slug}>
                      <strong>{project.name}</strong> - {project.summary}
                    </p>
                  ))
                ) : (
                  <p className="muted">No project evidence retrieved yet.</p>
                )}
              </div>
            </section>

            <section className="insight-panel">
              <div className="eyebrow">AI-Generated Brief</div>
              <h3>Recruiter-Ready Summary</h3>
              <p className="muted">
                Generated from the match score and retrieved portfolio evidence.
              </p>
              <button
                className="button primary"
                disabled={
                  status === "loading" || description.trim().length < 20
                }
                onClick={generateBrief}
                type="button"
              >
                {status === "loading"
                  ? "Generating..."
                  : "Generate Recruiter Brief"}
              </button>
              <pre className="terminal">
                {aiBrief ||
                  "Generate an AI recruiter brief from the match score and retrieved portfolio evidence."}
              </pre>
              {status === "error" ? (
                <p className="muted">
                  Generated brief is unavailable right now. The match evidence
                  remains visible on the left.
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
