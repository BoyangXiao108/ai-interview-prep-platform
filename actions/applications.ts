"use server";

import { ApplicationStatus, PrepNoteType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/applications";
import { jobDescriptionSchema } from "@/lib/validations/job-description";
import { prepNoteSchema } from "@/lib/validations/notes";

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

function getValidationMessage(
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>,
) {
  const issue = issues[0];

  if (!issue) {
    return "Invalid input.";
  }

  const field = issue.path[0];

  if (typeof field === "string" && field.length > 0) {
    return `${field}: ${issue.message}`;
  }

  return issue.message;
}

async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

async function assertOwnership(userId: string, applicationId: string) {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    redirect("/applications");
  }

  return application;
}

export async function createApplicationAction(formData: FormData) {
  const userId = await requireUserId();

  const parsed = applicationSchema.safeParse({
    company: formData.get("company"),
    roleTitle: formData.get("roleTitle"),
    location: formData.get("location"),
    sourceUrl: formData.get("sourceUrl"),
    salaryRange: formData.get("salaryRange"),
    status: formData.get("status"),
    resumeId: formData.get("resumeId"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        "/applications",
        getValidationMessage(parsed.error.issues),
      ),
    );
  }

  await prisma.jobApplication.create({
    data: {
      userId,
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

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect(withMessage("/applications", "Application created."));
}

export async function updateApplicationStatusAction(formData: FormData) {
  const userId = await requireUserId();

  const applicationId = String(formData.get("applicationId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/applications");
  const status = String(formData.get("status") ?? "");

  if (!applicationId) {
    redirect(withMessage(returnPath, "Application id is required."));
  }

  if (!Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    redirect(withMessage(returnPath, "Select a valid status."));
  }

  await assertOwnership(userId, applicationId);

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: status as ApplicationStatus,
      activities: {
        create: {
          label: `Updated status to ${status.toLowerCase()}`,
        },
      },
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  revalidatePath(`/applications/${applicationId}`);
  redirect(withMessage(returnPath, "Application status updated."));
}

export async function saveJobDescriptionAction(formData: FormData) {
  const userId = await requireUserId();

  const parsed = jobDescriptionSchema.safeParse({
    applicationId: formData.get("applicationId"),
    rawText: formData.get("rawText"),
  });

  const returnPath = String(
    formData.get("returnPath") ?? `/applications/${String(formData.get("applicationId") ?? "")}`,
  );

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        parsed.error.issues[0]?.message ?? "Unable to save job description.",
      ),
    );
  }

  await assertOwnership(userId, parsed.data.applicationId);

  await prisma.jobDescription.upsert({
    where: {
      applicationId: parsed.data.applicationId,
    },
    update: {
      rawText: parsed.data.rawText,
      summary: parsed.data.rawText.slice(0, 280),
    },
    create: {
      applicationId: parsed.data.applicationId,
      rawText: parsed.data.rawText,
      summary: parsed.data.rawText.slice(0, 280),
    },
  });

  revalidatePath(`/applications/${parsed.data.applicationId}`);
  redirect(withMessage(returnPath, "Job description saved."));
}

export async function createPrepNoteAction(formData: FormData) {
  const userId = await requireUserId();

  const parsed = prepNoteSchema.safeParse({
    applicationId: formData.get("applicationId"),
    noteType: formData.get("noteType"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  const returnPath = String(
    formData.get("returnPath") ?? `/applications/${String(formData.get("applicationId") ?? "")}`,
  );

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        parsed.error.issues[0]?.message ?? "Unable to save note.",
      ),
    );
  }

  if (parsed.data.applicationId) {
    await assertOwnership(userId, parsed.data.applicationId);
  }

  await prisma.prepNote.create({
    data: {
      userId,
      applicationId: parsed.data.applicationId || null,
      noteType: parsed.data.noteType,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  if (parsed.data.applicationId) {
    revalidatePath(`/applications/${parsed.data.applicationId}`);
  }

  revalidatePath("/applications");
  redirect(withMessage(returnPath, "Prep note saved."));
}

export async function updatePrepNoteAction(formData: FormData) {
  const userId = await requireUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/applications");
  const applicationId = String(formData.get("applicationId") ?? "");

  const parsed = prepNoteSchema.safeParse({
    applicationId: applicationId || undefined,
    noteType: formData.get("noteType"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!noteId) {
    redirect(withMessage(returnPath, "Note id is required."));
  }

  if (!parsed.success) {
    redirect(withMessage(returnPath, parsed.error.issues[0]?.message ?? "Unable to update note."));
  }

  const existingNote = await prisma.prepNote.findFirst({
    where: {
      id: noteId,
      userId,
    },
    select: {
      id: true,
      applicationId: true,
    },
  });

  if (!existingNote) {
    redirect(withMessage(returnPath, "Note not found."));
  }

  if (parsed.data.applicationId) {
    await assertOwnership(userId, parsed.data.applicationId);
  }

  await prisma.prepNote.update({
    where: { id: existingNote.id },
    data: {
      applicationId: parsed.data.applicationId || null,
      noteType: parsed.data.noteType as PrepNoteType,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  if (existingNote.applicationId) {
    revalidatePath(`/applications/${existingNote.applicationId}`);
  }

  if (parsed.data.applicationId) {
    revalidatePath(`/applications/${parsed.data.applicationId}`);
  }

  revalidatePath("/applications");
  redirect(withMessage(returnPath, "Prep note updated."));
}
