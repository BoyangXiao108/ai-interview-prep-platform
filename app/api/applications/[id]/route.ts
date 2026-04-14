import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/applications";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = applicationSchema.partial().safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const application = await prisma.jobApplication.update({
      where: {
        id: existingApplication.id,
      },
      data: {
        company: parsed.data.company,
        roleTitle: parsed.data.roleTitle,
        location: parsed.data.location || undefined,
        sourceUrl: parsed.data.sourceUrl || undefined,
        salaryRange: parsed.data.salaryRange || undefined,
        status: parsed.data.status,
        resumeId: parsed.data.resumeId || undefined,
      },
    });

    return NextResponse.json({ data: application });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while updating the application." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    await prisma.jobApplication.delete({
      where: {
        id: existingApplication.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while deleting the application." },
      { status: 500 },
    );
  }
}
