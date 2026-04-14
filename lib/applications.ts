import { type ApplicationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface ApplicationFilters {
  query?: string;
  status?: ApplicationStatus | "ALL";
}

export async function getApplicationsForUser(
  userId: string,
  filters: ApplicationFilters = {},
) {
  const where: Prisma.JobApplicationWhereInput = {
    userId,
    ...(filters.query
      ? {
          OR: [
            { company: { contains: filters.query, mode: "insensitive" } },
            { roleTitle: { contains: filters.query, mode: "insensitive" } },
            { location: { contains: filters.query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.status && filters.status !== "ALL"
      ? { status: filters.status }
      : {}),
  };

  return prisma.jobApplication.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      jobDescription: true,
      notes: {
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
    },
  });
}

export async function getApplicationDetailForUser(userId: string, applicationId: string) {
  return prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: {
      jobDescription: true,
      notes: {
        orderBy: { updatedAt: "desc" },
      },
      resume: true,
      questionSets: {
        include: {
          questions: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      interviewSessions: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          questionSet: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}
