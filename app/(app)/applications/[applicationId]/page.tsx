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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getApplicationDetailForUser } from "@/lib/applications";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";

const statusLabels = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
} as const;

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
                  <Badge tone="info">Application detail</Badge>
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
                      Location
                    </span>
                    <span className="font-medium text-slate-700">
                      {application.location || "Location TBD"}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Created
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatDateTime(application.createdAt)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Updated
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
                  Update status
                </p>
                <Select className="w-full" defaultValue={application.status} name="status">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button className="w-full" type="submit" variant="outline">
                  Update status
                </Button>
              </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0 rounded-[24px] border border-border/60 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Source
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
                    <p className="text-muted-foreground">No source URL yet</p>
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-[24px] border border-border/60 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Resume
                </p>
                <p className="mt-2 text-sm leading-7">
                  {application.resume ? (
                    application.resume.fileName
                  ) : (
                    <span className="text-muted-foreground">No resume linked yet</span>
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
                Related prep activity
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">
                Snapshot
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">Notes</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.notes.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">Question sets</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.questionSets.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">Interview sessions</p>
                <p className="mt-3 font-heading text-4xl font-bold">
                  {application.interviewSessions.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/64">Job description</p>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  {application.jobDescription
                    ? "Saved and ready for future AI flows"
                    : "Not added yet"}
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
              Recent mock sessions
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              Practice history for this application
            </h2>
          </div>
          {application.interviewSessions.length ? (
            <div className="space-y-4">
              {application.interviewSessions.map((session) => (
                <a
                  key={session.id}
                  className="block rounded-[24px] border border-border/60 bg-white/70 p-5 transition hover:bg-white"
                  href={`/mock/${session.id}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Updated {formatDateTime(session.updatedAt)}
                      </p>
                    </div>
                    <Badge tone={session.status === "completed" ? "success" : "warning"}>
                      {session.status}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
              No mock sessions for this application yet. Start one from a question set after generating questions.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-7 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Question generation
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              Generate a fresh interview question set
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Create behavioral, technical, and resume-based questions for this specific application.
            </p>
          </div>

          {application.jobDescription ? (
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">
                    {application.questionSets.length
                      ? `${application.questionSets.length} question set(s) already saved`
                      : "No generated question sets yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {application.resume
                      ? `Resume linked: ${application.resume.fileName}`
                      : "No resume linked yet. We can still generate a solid starter set."}
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
                    <SubmitButton pendingText="Generating..." variant="primary">
                      Generate questions
                    </SubmitButton>
                  </form>
                  <Button href={`/question-bank?applicationId=${application.id}`} variant="outline">
                    Open question bank
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-5 text-sm leading-7 text-muted-foreground">
              Add a job description before generating questions so the set can be tailored to the role.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-7 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Job description
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              Store the role description in a dedicated record
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Keep the original job posting here so future question generation and
              prep workflows can use a clean, application-specific source.
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
              placeholder="Paste the job description here..."
            />
            <Button type="submit">Save job description</Button>
          </form>

          {!application.jobDescription ? (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-4 text-sm text-muted-foreground">
              No job description saved yet.
            </div>
          ) : (
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Current summary
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {application.jobDescription.summary ||
                  "Summary will appear here as this record evolves."}
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
                Add prep note
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Capture job-specific prep
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Save research, answer drafts, and interview strategy notes tied
                directly to this role.
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
                <option value="GENERAL">General</option>
                <option value="RESEARCH">Research</option>
                <option value="INTERVIEW_STRATEGY">Interview strategy</option>
                <option value="COMPANY_CONTEXT">Company context</option>
                <option value="ANSWER_DRAFT">Answer draft</option>
              </Select>
              <Input className="bg-white" name="title" placeholder="Note title" />
              <Textarea
                className="min-h-36 bg-white"
                name="content"
                placeholder="Write your preparation notes..."
              />
              <Button type="submit">Save note</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Saved prep notes
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Keep notes editable
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Update your notes as you learn more about the company, recruiter,
                and interview loop.
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
                      <option value="GENERAL">General</option>
                      <option value="RESEARCH">Research</option>
                      <option value="INTERVIEW_STRATEGY">Interview strategy</option>
                      <option value="COMPANY_CONTEXT">Company context</option>
                      <option value="ANSWER_DRAFT">Answer draft</option>
                    </Select>
                    <Input className="bg-white" defaultValue={note.title} name="title" />
                  </div>
                  <Textarea className="bg-white" defaultValue={note.content} name="content" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDateTime(note.updatedAt)}
                    </p>
                    <Button type="submit" variant="outline">
                      Update note
                    </Button>
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
                No prep notes yet. Add your first job-specific note from the form on the left.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
