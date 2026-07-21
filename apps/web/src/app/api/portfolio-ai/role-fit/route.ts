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
    routeId: "portfolio-ai-role-fit",
    maxBodyBytes: 12_000,
    maxConcurrent: 2,
    minuteLimit: 4,
    hourLimit: 25,
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

  const { description, scoreSummary } = await request
    .json()
    .catch(() => ({ description: "" }));

  if (typeof description !== "string" || description.trim().length < 20) {
    return fail("Paste a fuller role description first.");
  }

  if (description.length > 6_000) {
    return fail("Keep the role description under 6,000 characters.", 413);
  }

  if (typeof scoreSummary === "string" && scoreSummary.length > 3_000) {
    return fail("Role fit summary is too large.", 413);
  }

  const safeScoreSummary =
    typeof scoreSummary === "string" ? scoreSummary : "No score summary provided.";
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
        content: `Role description:\n${description}\n\nLocal match signals:\n${safeScoreSummary}\n\nPortfolio evidence:\n${context.map((item) => `- ${item}`).join("\n")}\n\nGenerate a polished role-fit brief with these sections:\n1. Executive fit summary\n2. Strongest matching evidence\n3. Relevant projects\n4. Interview talking points\n5. Possible gaps or follow-ups`,
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
      { error: "Generated brief is unavailable right now." },
      { status: 503 },
    );
  }
}
