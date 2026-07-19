import { createSignal } from "@portfolio/database";
import { signalSchema } from "@portfolio/contracts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = Object.fromEntries(await request.formData());
  const parsed = signalSchema.safeParse(form);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await createSignal(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Could not save submission", message },
      { status: 500 },
    );
  }

  return NextResponse.redirect(new URL("/signal/thanks", request.url), 303);
}
