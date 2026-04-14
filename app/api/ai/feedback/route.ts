import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { feedbackSchema } from "@/lib/validations/ai";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          "AI answer scoring is not enabled in this MVP milestone yet.",
        sessionId: parsed.data.interviewSessionId,
      },
      { status: 501 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to process feedback request." },
      { status: 500 },
    );
  }
}
