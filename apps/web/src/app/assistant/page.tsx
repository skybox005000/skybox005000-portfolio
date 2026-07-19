"use client";

import { Nav } from "@/components/nav";
import { featuredProjects, profile } from "@portfolio/config";
import { useMemo, useState } from "react";

const suggestedQuestions = [
  "Which projects demonstrate Gemini, Vertex AI, or Azure OpenAI integration?",
  "What agentic AI and Google ADK experience does Daryl have?",
  "Show evidence of cloud, DevOps, and production delivery ownership.",
];

function searchPortfolio(question: string) {
  const text = question.toLowerCase();

  if (!question.trim()) {
    return "Ask about Daryl's GenAI, full-stack, cloud, DevOps, Google ecosystem, or project experience.";
  }

  if (
    text.includes("project") ||
    text.includes("openai") ||
    text.includes("gemini") ||
    text.includes("vertex")
  ) {
    return featuredProjects
      .slice(0, 6)
      .map((project) => `${project.name}: ${project.summary}`)
      .join("\n\n");
  }

  if (
    text.includes("agent") ||
    text.includes("adk") ||
    text.includes("google")
  ) {
    const currentRole = profile.experience[0];

    return `${currentRole.role} - ${currentRole.organization} (${currentRole.period})\n${currentRole.summary}`;
  }

  if (
    text.includes("cloud") ||
    text.includes("devops") ||
    text.includes("production")
  ) {
    const cloud = profile.expertise.find(
      (group) => group.area === "Cloud and DevOps",
    );

    return `Cloud and DevOps: ${cloud?.skills.join(", ")}.\n\n${profile.experience
      .map((item) => `${item.period}: ${item.summary}`)
      .join("\n\n")}`;
  }

  if (
    text.includes("skill") ||
    text.includes("stack") ||
    text.includes("technology")
  ) {
    return profile.expertise
      .map((group) => `${group.area}: ${group.skills.join(", ")}`)
      .join("\n\n");
  }

  return `${profile.summary}\n\nHighlights:\n${profile.highlights
    .map((highlight) => `- ${highlight}`)
    .join("\n")}`;
}

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const semanticAnswer = useMemo(() => searchPortfolio(question), [question]);

  async function askAi() {
    if (!question.trim()) {
      return;
    }

    setStatus("loading");
    setAiAnswer("");

    const response = await fetch("/api/portfolio-ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => ({}));
      setStatus("error");
      setAiAnswer(payload.error || "AI generation is unavailable right now.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      setAiAnswer(
        (current) => current + decoder.decode(value, { stream: true }),
      );
    }

    setStatus("idle");
  }

  return (
    <main className="shell">
      <Nav />
      <section className="section">
        <div className="eyebrow">Portfolio Assistant</div>
        <h1 style={{ fontSize: 52 }}>Ask About Daryl's Work</h1>
        <div className="actions tool-actions">
          <a className="button" href="/matcher">
            Check Role Fit
          </a>
        </div>
        <div className="card form">
          <pre className="terminal">
            {["Suggested questions:", ...suggestedQuestions].join("\n")}
          </pre>
          <input
            className="input"
            onChange={(event) => {
              setQuestion(event.target.value);
              setAiAnswer("");
              setStatus("idle");
            }}
            placeholder="Ask about projects, skills, or experience..."
            value={question}
          />

          <div className="ai-split">
            <section className="insight-panel">
              <div className="eyebrow">Semantic Search</div>
              <h3>Retrieved Portfolio Evidence</h3>
              <pre className="terminal">{semanticAnswer}</pre>
            </section>

            <section className="insight-panel">
              <div className="eyebrow">AI-Generated Answer</div>
              <h3>Portfolio Response</h3>
              <p className="muted">
                Generated from the retrieved portfolio evidence.
              </p>
              <button
                className="button primary"
                disabled={status === "loading" || !question.trim()}
                onClick={askAi}
                type="button"
              >
                {status === "loading" ? "Generating..." : "Generate Answer"}
              </button>
              <pre className="terminal">
                {aiAnswer ||
                  "Generate an AI answer from the retrieved portfolio evidence."}
              </pre>
              {status === "error" ? (
                <p className="muted">
                  Generated response is unavailable right now. The retrieved
                  evidence remains visible on the left.
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
