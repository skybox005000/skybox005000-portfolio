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
    name: "GenAI & agentic AI",
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
    name: "Full stack",
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
    name: "Cloud & DevOps",
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
    name: "Enterprise delivery",
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

  return (
    <main className="shell">
      <Nav />
      <section className="section">
        <div className="eyebrow">Role Fit</div>
        <h1 style={{ fontSize: 52 }}>Job Match</h1>
        <p className="lead">
          Paste a role to compare its skills, platforms, and delivery needs
          against Daryl's portfolio experience.
        </p>
        <div className="card form">
          <textarea
            className="textarea"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Paste a job description..."
            value={description}
          />

          <div className="result">
            <div>
              <div className="eyebrow">Overall Match</div>
              <div className="metric">{description ? result.overall : 0}%</div>
            </div>
            <div className="score-list">
              {result.areas.map((area) => (
                <div key={area.name}>
                  <strong>{area.name}</strong>
                  <div className="scorebar" aria-label={`${area.score}% match`}>
                    <span style={{ width: `${description ? area.score : 0}%` }} />
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

          {result.topProjects.length > 0 ? (
            <div>
              <h3>Relevant Projects</h3>
              {result.topProjects.map(({ project }) => (
                <p className="muted" key={project.slug}>
                  <strong>{project.name}</strong> - {project.summary}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
