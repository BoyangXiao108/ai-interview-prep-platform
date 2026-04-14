import { NextResponse } from "next/server";
import { PrepNoteType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepNoteSchema } from "@/lib/validations/notes";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.prepNote.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: notes });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = prepNoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const note = await prisma.prepNote.create({
      data: {
        userId: session.user.id,
        applicationId: parsed.data.applicationId || null,
        noteType: parsed.data.noteType as PrepNoteType,
        title: parsed.data.title,
        content: parsed.data.content,
      },
    });

    return NextResponse.json({ data: note }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while saving the note." },
      { status: 500 },
    );
  }
}
