import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  createPrepNoteAction,
  saveJobDescriptionAction,
  updateApplicationStatusAction,
  updatePrepNoteAction,
} from "@/actions/applications";
import { generateQuestionsAction } from "@/actions/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getApplicationDetailForUser } from "@/lib/applications";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";

const statusTones = {
  WISHLIST: "neutral",
  APPLIED: "info",
  INTERVIEW: "warning",
  OFFER: "success",
  REJECTED: "danger",
} as const;

interface ApplicationDetailPageProps {
  params: Promise<{
    applicationId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const t = await getTranslations("ApplicationDetail");
  const common = await getTranslations("Common");
  const mock = await getTranslations("Mock");
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { applicationId } = await params;
  const { message } = await searchParams;
  const application = await getApplicationDetailForUser(
    session.user.id,
    applicationId,
  );

  if (!application) {
    notFound();
  }

  const statusLabels = {
    WISHLIST: t("status.WISHLIST"),
    APPLIED: t("status.APPLIED"),
    INTERVIEW: t("status.INTERVIEW"),
    OFFER: t("status.OFFER"),
    REJECTED: t("status.REJECTED"),
  } as const;

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-6 p-7 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="info">{t("applicationDetail")}</Badge>
                  <Badge tone={statusTones[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-2xl font-heading text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
                    {application.roleTitle}
                  </h1>
                  <p className="text-lg font-medium text-slate-700">
                    {application.company}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {common("location")}
                    </span>
                    <span className="font-medium text-slate-700">
                      {application.location || t("locationTbd")}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {common("created")}
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatDateTime(application.createdAt)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {common("updated")}
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatDateTime(application.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <form
                action={updateApplicationStatusAction}
                className="flex w-full flex-col gap-3 rounded-[24px] border border-border/60 bg-white/70 p-4 lg:w-auto lg:min-w-[280px]"
              >
                <input name="applicationId" type="hidden" value={application.id} />
                <input
                  name="returnPath"
                  type="hidden"
                  value={`/applications/${application.id}`}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("updateStatus")}
                </p>
                <Select className="w-full" defaultValue={application.status} name="status">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button className="w-full" type="submit" variant="outline">
                  {t("updateStatus")}
                </Button>
              </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0 rounded-[24px] border border-border/60 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("source")}
                </p>
                <div className="mt-2 min-w-0 text-sm">
                  {application.sourceUrl ? (
                    <a
                      className="block break-all leading-7 text-primary underline underline-offset-2"
                      href={application.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                      title={application.sourceUrl}
                    >
                      {application.sourceUrl}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{t("noSourceUrl")}</p>
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-[24px] border border-border/60 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("resume")}
                </p>
                <p className="mt-2 text-sm leading-7">
                  {application.resume ? (
                    application.resume.fileName
                  ) : (
                    <span className="text-muted-foreground">{t("noResumeLinkedYet")}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                {t("relatedPrepActivity")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">
                {t("snapshot")}
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">{t("notesCount")}</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.notes.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">{t("questionSetsCount")}</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.questionSets.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">{t("interviewSessionsCount")}</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.interviewSessions.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">{t("jobDescriptionStatus")}</p>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  {application.jobDescription
                    ? t("jobDescriptionReady")
                    : t("notAddedYet")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-5 p-7 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {t("recentMockSessions")}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              {t("practiceHistory")}
            </h2>
          </div>
          {application.interviewSessions.length ? (
            <div className="space-y-4">
              {application.interviewSessions.map((session) => (
                <Link
                  key={session.id}
                  className="block rounded-[24px] border border-border/60 bg-white/70 p-5 transition hover:bg-white"
                  href={`/mock/${session.id}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {mock("updatedAt", { date: formatDateTime(session.updatedAt) })}
                      </p>
                    </div>
                    <Badge tone={session.status === "completed" ? "success" : "warning"}>
                      {mock(`statusValue.${session.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
              {t("noMockSessions")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-7 lg:p-8">
          <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {t("questionGeneration")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                {t("generateTitle")}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {t("generateDescription")}
              </p>
          </div>

          {application.jobDescription ? (
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">
                    {application.questionSets.length
                      ? t("questionSetsSaved", { count: application.questionSets.length })
                      : t("noQuestionSets")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {application.resume
                      ? t("resumeLinked", { fileName: application.resume.fileName })
                      : t("resumeOptionalHint")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={generateQuestionsAction}>
                    <input name="applicationId" type="hidden" value={application.id} />
                    <input
                      name="returnPath"
                      type="hidden"
                      value={`/applications/${application.id}`}
                    />
                    <SubmitButton pendingText={t("generating")} variant="primary">
                      {t("generateQuestions")}
                    </SubmitButton>
                  </form>
                  <Button href={`/question-bank?applicationId=${application.id}`} variant="outline">
                    {t("openQuestionBank")}
                  </Button>
                </div>
              </div>
              {application.questionSets.length ? (
                <div className="mt-4 rounded-[20px] border border-border/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("recentQuestionSets")}
                  </p>
                  <div className="mt-3 space-y-3">
                    {application.questionSets.slice(0, 3).map((set) => (
                      <Link
                        key={set.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm transition hover:bg-muted/40"
                        href={`/question-bank?applicationId=${application.id}&generatedSetId=${set.id}`}
                      >
                        <span className="font-medium">{set.title}</span>
                        <span className="text-muted-foreground">
                          {t("questionCount", { count: set.questions.length })}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-5 text-sm leading-7 text-muted-foreground">
              {t("jobDescriptionRequired")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-7 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {t("jobDescription")}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              {t("jobDescriptionTitle")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {t("jobDescriptionDescription")}
            </p>
          </div>

          <form action={saveJobDescriptionAction} className="space-y-4">
            <input name="applicationId" type="hidden" value={application.id} />
            <input
              name="returnPath"
              type="hidden"
              value={`/applications/${application.id}`}
            />
            <Textarea
              className="min-h-40 bg-white"
              defaultValue={application.jobDescription?.rawText ?? ""}
              name="rawText"
              placeholder={t("jobDescriptionPlaceholder")}
            />
            <Button type="submit">{t("saveJobDescription")}</Button>
          </form>

          {!application.jobDescription ? (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-4 text-sm text-muted-foreground">
              {t("noJobDescription")}
            </div>
          ) : (
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("currentSummary")}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {application.jobDescription.summary ||
                  t("summaryPending")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {t("addPrepNote")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                {t("prepNoteTitle")}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {t("prepNoteDescription")}
              </p>
            </div>

            <form action={createPrepNoteAction} className="space-y-4">
              <input name="applicationId" type="hidden" value={application.id} />
              <input
                name="returnPath"
                type="hidden"
                value={`/applications/${application.id}`}
              />
              <Select className="bg-white" defaultValue="GENERAL" name="noteType">
                <option value="GENERAL">{t("noteType.GENERAL")}</option>
                <option value="RESEARCH">{t("noteType.RESEARCH")}</option>
                <option value="INTERVIEW_STRATEGY">{t("noteType.INTERVIEW_STRATEGY")}</option>
                <option value="COMPANY_CONTEXT">{t("noteType.COMPANY_CONTEXT")}</option>
                <option value="ANSWER_DRAFT">{t("noteType.ANSWER_DRAFT")}</option>
              </Select>
              <Input className="bg-white" name="title" placeholder={t("noteTitlePlaceholder")} />
              <Textarea
                className="min-h-36 bg-white"
                name="content"
                placeholder={t("noteContentPlaceholder")}
              />
              <Button type="submit">{t("saveNote")}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {t("savedPrepNotes")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                {t("savedPrepNotesTitle")}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {t("savedPrepNotesDescription")}
              </p>
            </div>

            {application.notes.length ? (
              application.notes.map((note) => (
                <form
                  key={note.id}
                  action={updatePrepNoteAction}
                  className="space-y-4 rounded-[24px] border border-border/60 bg-white/70 p-5"
                >
                  <input name="noteId" type="hidden" value={note.id} />
                  <input name="applicationId" type="hidden" value={application.id} />
                  <input
                    name="returnPath"
                    type="hidden"
                    value={`/applications/${application.id}`}
                  />
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <Select className="bg-white" defaultValue={note.noteType} name="noteType">
                      <option value="GENERAL">{t("noteType.GENERAL")}</option>
                      <option value="RESEARCH">{t("noteType.RESEARCH")}</option>
                      <option value="INTERVIEW_STRATEGY">{t("noteType.INTERVIEW_STRATEGY")}</option>
                      <option value="COMPANY_CONTEXT">{t("noteType.COMPANY_CONTEXT")}</option>
                      <option value="ANSWER_DRAFT">{t("noteType.ANSWER_DRAFT")}</option>
                    </Select>
                    <Input className="bg-white" defaultValue={note.title} name="title" />
                  </div>
                  <Textarea className="bg-white" defaultValue={note.content} name="content" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      {common("updated")} {formatDateTime(note.updatedAt)}
                    </p>
                    <Button type="submit" variant="outline">
                      {t("updateNote")}
                    </Button>
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
                {t("noPrepNotes")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
