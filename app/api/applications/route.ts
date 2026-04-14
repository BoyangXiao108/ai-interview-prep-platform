import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/applications";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: applications });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = applicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        company: parsed.data.company,
        roleTitle: parsed.data.roleTitle,
        location: parsed.data.location || null,
        sourceUrl: parsed.data.sourceUrl || null,
        salaryRange: parsed.data.salaryRange || null,
        status: parsed.data.status,
        resumeId: parsed.data.resumeId || null,
        activities: {
          create: {
            label: `Created application for ${parsed.data.company}`,
          },
        },
      },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while creating the application." },
      { status: 500 },
    );
  }
}
