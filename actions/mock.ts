"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { withLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { getFirstValidationMessage } from "@/lib/validations/helpers";
import {
  getSaveInterviewAnswerSchema,
  getStartSessionSchema,
} from "@/lib/validations/mock";

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

export async function startMockSessionAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const session = await auth();

  if (!session?.user?.id) {
    redirect(withLocale(locale, "/login"));
  }

  const parsed = getStartSessionSchema((key) => validation(key)).safeParse({
    questionSetId: formData.get("questionSetId"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        withLocale(locale, "/question-bank"),
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableStartMock"),
        ),
      ),
    );
  }

  const questionSet = await prisma.questionSet.findFirst({
    where: {
      id: parsed.data.questionSetId,
      userId: session.user.id,
    },
    include: {
      application: {
        select: {
          id: true,
          company: true,
          roleTitle: true,
        },
      },
      questions: {
        select: { id: true },
      },
    },
  });

  if (!questionSet) {
    redirect(withMessage(withLocale(locale, "/question-bank"), messages("questionSetMissing")));
  }

  if (!questionSet.questions.length) {
    redirect(withMessage(withLocale(locale, "/question-bank"), messages("questionSetEmpty")));
  }

  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      jobApplicationId: questionSet.applicationId,
      questionSetId: questionSet.id,
      title: questionSet.application
        ? `${questionSet.application.company} · Mock session`
        : `${questionSet.title} · Mock session`,
      status: "in_progress",
    },
    select: {
      id: true,
    },
  });

  revalidatePath(withLocale(locale, "/mock"));
  revalidatePath(withLocale(locale, "/dashboard"));
  if (questionSet.applicationId) {
    revalidatePath(withLocale(locale, `/applications/${questionSet.applicationId}`));
  }

  redirect(withLocale(locale, `/mock/${interviewSession.id}`));
}

export async function saveInterviewAnswerAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const session = await auth();

  if (!session?.user?.id) {
    redirect(withLocale(locale, "/login"));
  }

  const parsed = getSaveInterviewAnswerSchema((key) => validation(key)).safeParse({
    sessionId: formData.get("sessionId"),
    questionId: formData.get("questionId"),
    answer: formData.get("answer"),
  });

  const returnPath = withLocale(locale, String(formData.get("returnPath") ?? "/mock"));

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableSaveAnswer"),
        ),
      ),
    );
  }

  const ownedSession = await prisma.interviewSession.findFirst({
    where: {
      id: parsed.data.sessionId,
      userId: session.user.id,
    },
    include: {
      questionSet: {
        include: {
          questions: {
            select: {
              id: true,
              prompt: true,
            },
          },
        },
      },
      jobApplication: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!ownedSession?.questionSet) {
    redirect(withMessage(returnPath, messages("mockSessionMissing")));
  }

  const question = ownedSession.questionSet.questions.find(
    (item) => item.id === parsed.data.questionId,
  );

  if (!question) {
    redirect(withMessage(returnPath, messages("questionMissingForSession")));
  }

  await prisma.interviewResponse.upsert({
    where: {
      interviewSessionId_questionId: {
        interviewSessionId: parsed.data.sessionId,
        questionId: parsed.data.questionId,
      },
    },
    create: {
      interviewSessionId: parsed.data.sessionId,
      questionId: parsed.data.questionId,
      questionPrompt: question.prompt,
      answer: parsed.data.answer,
    },
    update: {
      answer: parsed.data.answer,
    },
  });

  const totalQuestions = ownedSession.questionSet.questions.length;
  const responseCount = await prisma.interviewResponse.count({
    where: {
      interviewSessionId: parsed.data.sessionId,
    },
  });

  await prisma.interviewSession.update({
    where: { id: parsed.data.sessionId },
    data: {
      status: responseCount >= totalQuestions ? "completed" : "in_progress",
    },
  });

  revalidatePath(withLocale(locale, "/mock"));
  revalidatePath(withLocale(locale, `/mock/${parsed.data.sessionId}`));
  revalidatePath(withLocale(locale, "/dashboard"));
  if (ownedSession.jobApplicationId) {
    revalidatePath(withLocale(locale, `/applications/${ownedSession.jobApplicationId}`));
  }

  redirect(
    withMessage(
      withParam(returnPath, "savedQuestionId", parsed.data.questionId),
      messages("answerSaved"),
    ),
  );
}
