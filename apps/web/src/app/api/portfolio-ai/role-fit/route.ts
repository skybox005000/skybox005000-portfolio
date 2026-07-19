import {
  retrievePortfolioContext,
  streamPortfolioText,
} from "@/lib/portfolio-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { description, scoreSummary } = await request
    .json()
    .catch(() => ({ description: "" }));

  if (typeof description !== "string" || description.trim().length < 20) {
    return NextResponse.json(
      { error: "Paste a fuller role description first." },
      { status: 400 },
    );
  }

  const context = retrievePortfolioContext(description, 10);

  try {
    const stream = await streamPortfolioText([
      {
        role: "system",
        content:
          "You are a senior technical recruiter and GenAI solutions architect evaluating Daryl Bravo for a role. Use only the provided portfolio evidence. Be practical, specific, and balanced. Do not invent metrics or experience.",
      },
      {
        role: "user",
        content: `Role description:\n${description}\n\nLocal match signals:\n${scoreSummary || "No score summary provided."}\n\nPortfolio evidence:\n${context.map((item) => `- ${item}`).join("\n")}\n\nGenerate a polished role-fit brief with these sections:\n1. Executive fit summary\n2. Strongest matching evidence\n3. Relevant projects\n4. Interview talking points\n5. Possible gaps or follow-ups`,
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
