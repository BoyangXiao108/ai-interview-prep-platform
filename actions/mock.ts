"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  saveInterviewAnswerSchema,
  startSessionSchema,
} from "@/lib/validations/mock";

function withMessage(path: string, message: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("message", message);
  return `${pathname}?${params.toString()}`;
}

export async function startMockSessionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = startSessionSchema.safeParse({
    questionSetId: formData.get("questionSetId"),
  });

  if (!parsed.success) {
    redirect(withMessage("/question-bank", parsed.error.issues[0]?.message ?? "Unable to start session."));
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
    redirect(withMessage("/question-bank", "Question set not found."));
  }

  if (!questionSet.questions.length) {
    redirect(withMessage("/question-bank", "This question set has no questions yet."));
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

  revalidatePath("/mock");
  revalidatePath("/dashboard");
  if (questionSet.applicationId) {
    revalidatePath(`/applications/${questionSet.applicationId}`);
  }

  redirect(`/mock/${interviewSession.id}`);
}

export async function saveInterviewAnswerAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = saveInterviewAnswerSchema.safeParse({
    sessionId: formData.get("sessionId"),
    questionId: formData.get("questionId"),
    answer: formData.get("answer"),
  });

  const returnPath = String(formData.get("returnPath") ?? "/mock");

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        parsed.error.issues[0]?.message ?? "Unable to save answer.",
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
    redirect(withMessage(returnPath, "Session not found."));
  }

  const question = ownedSession.questionSet.questions.find(
    (item) => item.id === parsed.data.questionId,
  );

  if (!question) {
    redirect(withMessage(returnPath, "Question not found for this session."));
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

  revalidatePath("/mock");
  revalidatePath(`/mock/${parsed.data.sessionId}`);
  revalidatePath("/dashboard");
  if (ownedSession.jobApplicationId) {
    revalidatePath(`/applications/${ownedSession.jobApplicationId}`);
  }

  redirect(withMessage(returnPath, "Answer saved."));
}
