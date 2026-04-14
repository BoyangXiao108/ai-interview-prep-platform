import { prisma } from "@/lib/prisma";

export async function getMockSessionsForUser(userId: string) {
  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      jobApplication: {
        select: {
          id: true,
          company: true,
          roleTitle: true,
        },
      },
      questionSet: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });
}

export async function getMockSessionDetailForUser(userId: string, sessionId: string) {
  return prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      jobApplication: {
        select: {
          id: true,
          company: true,
          roleTitle: true,
        },
      },
      questionSet: {
        include: {
          questions: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      responses: {
        orderBy: { updatedAt: "asc" },
      },
    },
  });
}
