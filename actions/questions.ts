"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { withLocale } from "@/lib/locale";
import { generateQuestionSetForApplication } from "@/lib/questions/generator";
import { getFirstValidationMessage } from "@/lib/validations/helpers";
import { getGenerateQuestionSetSchema } from "@/lib/validations/questions";

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
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const session = await auth();

  if (!session?.user?.id) {
    redirect(withLocale(locale, "/login"));
  }

  const returnPath = withLocale(
    locale,
    String(formData.get("returnPath") ?? "/question-bank"),
  );

  const parsed = getGenerateQuestionSetSchema((key) => validation(key)).safeParse({
    applicationId: formData.get("applicationId"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableGenerateQuestions"),
        ),
      ),
    );
  }

  const result = await generateQuestionSetForApplication(
    session.user.id,
    parsed.data.applicationId,
  );

  revalidatePath(withLocale(locale, "/question-bank"));
  revalidatePath(withLocale(locale, `/applications/${parsed.data.applicationId}`));

  const successPath = result.questionSetId
    ? withParam(returnPath, "generatedSetId", result.questionSetId)
    : returnPath;

  const messageByCode = {
    APPLICATION_NOT_FOUND: messages("applicationMissing"),
    JOB_DESCRIPTION_REQUIRED: messages("questionGenerationRequiresJobDescription"),
    QUESTION_SET_GENERATED: messages("questionSetGenerated"),
    QUESTION_SET_FALLBACK: messages("questionSetFallback"),
  } as const;

  redirect(withMessage(successPath, messageByCode[result.code]));
}
