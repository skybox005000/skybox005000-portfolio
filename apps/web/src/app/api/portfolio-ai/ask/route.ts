import {
  retrievePortfolioContext,
  streamPortfolioText,
} from "@/lib/portfolio-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question } = await request.json().catch(() => ({ question: "" }));

  if (typeof question !== "string" || question.trim().length < 3) {
    return NextResponse.json(
      { error: "Ask a question about Daryl's experience." },
      { status: 400 },
    );
  }

  const context = retrievePortfolioContext(question, 9);

  try {
    const stream = await streamPortfolioText([
      {
        role: "system",
        content:
          "You are Daryl Bravo's portfolio AI. Answer using only the provided portfolio evidence. Be specific, concise, recruiter-friendly, and honest about gaps. Do not invent employers, projects, metrics, or credentials.",
      },
      {
        role: "user",
        content: `Portfolio evidence:\n${context.map((item) => `- ${item}`).join("\n")}\n\nQuestion: ${question}\n\nAnswer with concrete evidence from the portfolio.`,
      },
    ]);

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message, context }, { status: 503 });
  }
}
