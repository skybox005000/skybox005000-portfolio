"use client";

import { Nav } from "@/components/nav";
import { featuredProjects, profile } from "@portfolio/config";
import { useMemo, useState } from "react";

const suggestedQuestions = [
  "Which projects demonstrate Gemini, Vertex AI, or Azure OpenAI integration?",
  "What agentic AI and Google ADK experience does Daryl have?",
  "Show evidence of cloud, DevOps, and production delivery ownership.",
];

function answerQuestion(question: string) {
  const text = question.toLowerCase();

  if (!question.trim()) {
    return "Ask about Daryl's GenAI, full-stack, cloud, DevOps, Google ecosystem, or project experience.";
  }

  if (text.includes("project") || text.includes("openai") || text.includes("gemini") || text.includes("vertex")) {
    return featuredProjects
      .slice(0, 6)
      .map((project) => `${project.name}: ${project.summary}`)
      .join("\n\n");
  }

  if (text.includes("agent") || text.includes("adk") || text.includes("google")) {
    const currentRole = profile.experience[0];

    return `${currentRole.role} - ${currentRole.organization} (${currentRole.period})\n${currentRole.summary}`;
  }

  if (text.includes("cloud") || text.includes("devops") || text.includes("production")) {
    const cloud = profile.expertise.find((group) => group.area === "Cloud & DevOps");

    return `Cloud & DevOps: ${cloud?.skills.join(", ")}.\n\n${profile.experience
      .map((item) => `${item.period}: ${item.summary}`)
      .join("\n\n")}`;
  }

  if (text.includes("skill") || text.includes("stack") || text.includes("technology")) {
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
  const answer = useMemo(() => answerQuestion(question), [question]);

  return (
    <main className="shell">
      <Nav />
      <section className="section">
        <div className="eyebrow">Portfolio Assistant</div>
        <h1 style={{ fontSize: 52 }}>Ask About Daryl's Work</h1>
        <div className="card form">
          <pre className="terminal">{["Suggested questions:", ...suggestedQuestions].join("\n")}</pre>
          <input
            className="input"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about projects, skills, or experience..."
            value={question}
          />
          <pre className="terminal">{answer}</pre>
        </div>
      </section>
    </main>
  );
}
