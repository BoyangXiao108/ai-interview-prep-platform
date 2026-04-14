import { ApplicationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface DashboardDataRequirements {
  totalApplications: number;
  countsByStatus: Record<ApplicationStatus, number>;
  recentApplications: Array<{
    id: string;
    company: string;
    roleTitle: string;
    status: ApplicationStatus;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  recentInterviewSessions: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
  }>;
  totalGeneratedQuestions: number;
}

const emptyCounts: Record<ApplicationStatus, number> = {
  WISHLIST: 0,
  APPLIED: 0,
  INTERVIEW: 0,
  OFFER: 0,
  REJECTED: 0,
};

export async function getDashboardData(
  userId: string,
): Promise<DashboardDataRequirements> {
  const [
    totalApplications,
    groupedStatuses,
    recentApplications,
    recentInterviewSessions,
    totalGeneratedQuestions,
  ] = await Promise.all([
    prisma.jobApplication.count({
      where: { userId },
    }),
    prisma.jobApplication.groupBy({
      by: ["status"],
      where: { userId },
      _count: {
        _all: true,
      },
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        company: true,
        roleTitle: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.question.count({
      where: {
        questionSet: {
          userId,
        },
      },
    }),
  ]);

  const countsByStatus = groupedStatuses.reduce(
    (accumulator, entry) => {
      accumulator[entry.status] = entry._count._all;
      return accumulator;
    },
    { ...emptyCounts },
  );

  return {
    totalApplications,
    countsByStatus,
    recentApplications,
    recentInterviewSessions,
    totalGeneratedQuestions,
  };
}
