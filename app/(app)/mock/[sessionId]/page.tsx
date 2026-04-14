import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SessionQuestionList } from "@/components/mock/session-question-list";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getMockSessionDetailForUser } from "@/lib/mock/queries";

interface MockInterviewPageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function MockInterviewPage({
  params,
  searchParams,
}: MockInterviewPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { sessionId } = await params;
  const { message } = await searchParams;
  const mockSession = await getMockSessionDetailForUser(session.user.id, sessionId);

  if (!mockSession) {
    notFound();
  }

  const totalQuestions = mockSession.questionSet?.questions.length ?? 0;
  const savedAnswers = mockSession.responses.length;

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={mockSession.status === "completed" ? "success" : "warning"}>
                {mockSession.status}
              </Badge>
              {mockSession.jobApplication ? (
                <Badge tone="neutral" className="bg-white/10 text-white">
                  {mockSession.jobApplication.company}
                </Badge>
              ) : null}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                Mock interview session
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold">{mockSession.title}</h1>
              <p className="mt-3 text-white/70">
                Save answers question by question. This MVP keeps the flow simple and focused on persistence rather than scoring.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Questions</p>
                <p className="mt-2 font-heading text-4xl font-bold">{totalQuestions}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Saved answers</p>
                <p className="mt-2 font-heading text-4xl font-bold">{savedAnswers}</p>
              </div>
            </div>
            <p className="text-sm text-white/60">
              Last updated {formatDateTime(mockSession.updatedAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-7 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Session context
            </p>
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-5">
              <p className="text-sm text-muted-foreground">Question set</p>
              <p className="mt-2 font-semibold">
                {mockSession.questionSet?.title ?? "Question set unavailable"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mockSession.jobApplication
                  ? `${mockSession.jobApplication.company} · ${mockSession.jobApplication.roleTitle}`
                  : "General practice session"}
              </p>
            </div>
            {totalQuestions === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
                This session does not have any questions yet.
              </div>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                Work through the list below and save answers as you go. You can revisit this session later and keep editing existing responses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {mockSession.questionSet?.questions.length ? (
        <SessionQuestionList
          questions={mockSession.questionSet.questions}
          responses={mockSession.responses.map((response) => ({
            questionId: response.questionId,
            answer: response.answer,
            updatedAt: response.updatedAt,
          }))}
          returnPath={`/mock/${mockSession.id}`}
          sessionId={mockSession.id}
        />
      ) : null}
    </div>
  );
}
