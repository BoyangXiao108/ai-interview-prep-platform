"use server";

import { ApplicationStatus, PrepNoteType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { withLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { getFirstValidationMessage } from "@/lib/validations/helpers";
import { getApplicationSchema } from "@/lib/validations/applications";
import { getJobDescriptionSchema } from "@/lib/validations/job-description";
import { getPrepNoteSchema } from "@/lib/validations/notes";

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

async function requireUserId() {
  const session = await auth();
  const locale = (await getLocale()) as Locale;

  if (!session?.user?.id) {
    redirect(withLocale(locale, "/login"));
  }

  return session.user.id;
}

async function assertOwnership(userId: string, applicationId: string) {
  const locale = (await getLocale()) as Locale;
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
    redirect(withLocale(locale, "/applications"));
  }

  return application;
}

export async function createApplicationAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const userId = await requireUserId();

  const parsed = getApplicationSchema((key) => validation(key)).safeParse({
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
        withLocale(locale, "/applications"),
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableCreateApplication"),
        ),
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

  revalidatePath(withLocale(locale, "/applications"));
  revalidatePath(withLocale(locale, "/dashboard"));
  redirect(withMessage(withLocale(locale, "/applications"), messages("applicationCreated")));
}

export async function updateApplicationStatusAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const userId = await requireUserId();

  const applicationId = String(formData.get("applicationId") ?? "");
  const returnPath = withLocale(
    locale,
    String(formData.get("returnPath") ?? "/applications"),
  );
  const status = String(formData.get("status") ?? "");

  if (!applicationId) {
    redirect(withMessage(returnPath, messages("unableUpdateApplication")));
  }

  if (!Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    redirect(withMessage(returnPath, validation("validApplicationStatus")));
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

  revalidatePath(withLocale(locale, "/applications"));
  revalidatePath(withLocale(locale, "/dashboard"));
  revalidatePath(withLocale(locale, `/applications/${applicationId}`));
  redirect(withMessage(returnPath, messages("applicationStatusUpdated")));
}

export async function saveJobDescriptionAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const userId = await requireUserId();

  const parsed = getJobDescriptionSchema((key) => validation(key)).safeParse({
    applicationId: formData.get("applicationId"),
    rawText: formData.get("rawText"),
  });

  const returnPath = withLocale(
    locale,
    String(
      formData.get("returnPath") ?? `/applications/${String(formData.get("applicationId") ?? "")}`,
    ),
  );

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        getFirstValidationMessage(
          parsed.error.issues,
          validation("jobDescriptionUnavailable"),
        ),
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

  revalidatePath(withLocale(locale, `/applications/${parsed.data.applicationId}`));
  redirect(withMessage(returnPath, messages("jobDescriptionSaved")));
}

export async function createPrepNoteAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const userId = await requireUserId();

  const parsed = getPrepNoteSchema((key) => validation(key)).safeParse({
    applicationId: formData.get("applicationId"),
    noteType: formData.get("noteType"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  const returnPath = withLocale(
    locale,
    String(
      formData.get("returnPath") ?? `/applications/${String(formData.get("applicationId") ?? "")}`,
    ),
  );

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableSaveNote"),
        ),
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
      noteType: parsed.data.noteType as PrepNoteType,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  if (parsed.data.applicationId) {
    revalidatePath(withLocale(locale, `/applications/${parsed.data.applicationId}`));
  }

  revalidatePath(withLocale(locale, "/applications"));
  redirect(withMessage(returnPath, messages("prepNoteSaved")));
}

export async function updatePrepNoteAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const userId = await requireUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const returnPath = withLocale(
    locale,
    String(formData.get("returnPath") ?? "/applications"),
  );
  const applicationId = String(formData.get("applicationId") ?? "");

  const parsed = getPrepNoteSchema((key) => validation(key)).safeParse({
    applicationId: applicationId || undefined,
    noteType: formData.get("noteType"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!noteId) {
    redirect(withMessage(returnPath, messages("unableUpdateNote")));
  }

  if (!parsed.success) {
    redirect(
      withMessage(
        returnPath,
        getFirstValidationMessage(
          parsed.error.issues,
          messages("unableUpdateNote"),
        ),
      ),
    );
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
    redirect(withMessage(returnPath, messages("prepNoteMissing")));
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
    revalidatePath(withLocale(locale, `/applications/${existingNote.applicationId}`));
  }

  if (parsed.data.applicationId) {
    revalidatePath(withLocale(locale, `/applications/${parsed.data.applicationId}`));
  }

  revalidatePath(withLocale(locale, "/applications"));
  redirect(withMessage(returnPath, messages("prepNoteUpdated")));
}
