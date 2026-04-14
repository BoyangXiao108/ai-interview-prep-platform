import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { generateQuestionSetForApplication } from "@/lib/questions/generator";
import { generateQuestionSetSchema } from "@/lib/validations/questions";

const errorByCode = {
  APPLICATION_NOT_FOUND: "Application not found.",
  JOB_DESCRIPTION_REQUIRED: "Add a job description before generating questions.",
  QUESTION_SET_GENERATED: "Question set generated successfully.",
  QUESTION_SET_FALLBACK:
    "Generated a starter question set. Add OPENAI_API_KEY for AI-tailored results.",
} as const;

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
      return NextResponse.json({ error: errorByCode[result.code] }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate questions.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
