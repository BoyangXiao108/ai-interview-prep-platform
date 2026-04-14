"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { generateQuestionSetForApplication } from "@/lib/questions/generator";
import { generateQuestionSetSchema } from "@/lib/validations/questions";

function withMessage(path: string, message: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("message", message);
  return `${pathname}?${params.toString()}`;
}

function withParam(path: string, key: string, value: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

export async function generateQuestionsAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const returnPath = String(
    formData.get("returnPath") ?? "/question-bank",
  );

  const parsed = generateQuestionSetSchema.safeParse({
    applicationId: formData.get("applicationId"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        parsed.error.issues[0]?.message ?? "Unable to generate questions.",
      ),
    );
  }

  const result = await generateQuestionSetForApplication(
    session.user.id,
    parsed.data.applicationId,
  );

  revalidatePath("/question-bank");
  revalidatePath(`/applications/${parsed.data.applicationId}`);

  const successPath = result.questionSetId
    ? withParam(returnPath, "generatedSetId", result.questionSetId)
    : returnPath;

  redirect(withMessage(successPath, result.message));
}
