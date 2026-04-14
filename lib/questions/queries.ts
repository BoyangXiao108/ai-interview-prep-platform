import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface QuestionBankFilters {
  applicationId?: string;
  category?: "ALL" | "BEHAVIORAL" | "TECHNICAL" | "SYSTEM_DESIGN" | "LEADERSHIP";
  difficulty?: "ALL" | "EASY" | "MEDIUM" | "HARD";
  type?: "ALL" | "behavioral" | "technical" | "resume-based";
}

export async function getQuestionBankData(userId: string, filters: QuestionBankFilters) {
  const questionWhere: Prisma.QuestionWhereInput = {
    ...(filters.category && filters.category !== "ALL"
      ? { category: filters.category }
      : {}),
    ...(filters.difficulty && filters.difficulty !== "ALL"
      ? { difficulty: filters.difficulty }
      : {}),
    ...(filters.type && filters.type !== "ALL"
      ? { source: filters.type }
      : {}),
  };

  const questionSets = await prisma.questionSet.findMany({
    where: {
      userId,
      ...(filters.applicationId ? { applicationId: filters.applicationId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: {
          id: true,
          company: true,
          roleTitle: true,
        },
      },
      questions: {
        where: questionWhere,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const filteredSets = questionSets.filter((set) => set.questions.length > 0);
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: [{ company: "asc" }, { roleTitle: "asc" }],
    select: {
      id: true,
      company: true,
      roleTitle: true,
    },
  });

  return {
    applications,
    questionSets: filteredSets,
    totalQuestionSets: questionSets.length,
  };
}
