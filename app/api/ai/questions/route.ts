import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { generateQuestionSetForApplication } from "@/lib/questions/generator";
import { generateQuestionSetSchema } from "@/lib/validations/questions";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = generateQuestionSetSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const result = await generateQuestionSetForApplication(
      session.user.id,
      parsed.data.applicationId,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate questions.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
