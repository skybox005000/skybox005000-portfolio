import { createSignal } from "@portfolio/database";
import { signalSchema } from "@portfolio/contracts";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  enforceSameOriginRequest,
} from "@/lib/request-security";

export async function POST(request: Request) {
  const sameOriginError = enforceSameOriginRequest(request, {
    allowFormData: true,
    maxBodyBytes: 8_000,
  });

  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = enforceRateLimit(request, {
    key: "signals",
    limit: 5,
    windowMs: 10 * 60_000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const form = Object.fromEntries(await request.formData());
  const parsed = signalSchema.safeParse(form);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  try {
    await createSignal(parsed.data);
  } catch {
    return NextResponse.json(
      { error: "Could not save submission" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  return NextResponse.redirect(new URL("/signal/thanks", request.url), 303);
}
