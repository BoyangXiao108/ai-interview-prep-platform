import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const storagePath = `${session.user.id}/${Date.now()}-${file.name}`;
    const supabase = getSupabaseAdminClient();

    const uploadResult = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET ?? "resumes")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        storagePath,
      },
    });

    return NextResponse.json({ data: resume }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload resume.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
