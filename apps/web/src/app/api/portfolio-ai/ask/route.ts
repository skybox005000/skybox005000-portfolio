import {
  retrievePortfolioContext,
  streamPortfolioText,
} from "@/lib/portfolio-ai";
import {
  enforceGenAiRequestGuard,
  guardedTextStream,
} from "@/lib/gen-ai-request-guard";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const guard = enforceGenAiRequestGuard(request, {
    routeId: "portfolio-ai-ask",
    maxBodyBytes: 4_000,
    maxConcurrent: 2,
    minuteLimit: 6,
    hourLimit: 35,
  });

  if (!guard.ok) {
    return guard.response;
  }

  const fail = (message: string, status = 400) => {
    guard.value.release();
    return NextResponse.json(
      { error: message },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  };

  const { question } = await request.json().catch(() => ({ question: "" }));

  if (typeof question !== "string" || question.trim().length < 3) {
    return fail("Ask a question about Daryl's experience.");
  }

  if (question.length > 700) {
    return fail("Keep the question under 700 characters.", 413);
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

    return new Response(guardedTextStream(stream, guard.value.release), {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        ...guard.value.headers,
      },
    });
  } catch {
    guard.value.release();
    return NextResponse.json(
      { error: "Generated response is unavailable right now." },
      { status: 503 },
    );
  }
}
