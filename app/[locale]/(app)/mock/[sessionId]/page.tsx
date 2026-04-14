import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    savedQuestionId?: string;
  }>;
}

export default async function MockInterviewPage({
  params,
  searchParams,
}: MockInterviewPageProps) {
  const t = await getTranslations("Mock");
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { sessionId } = await params;
  const { message, savedQuestionId } = await searchParams;
  const mockSession = await getMockSessionDetailForUser(session.user.id, sessionId);

  if (!mockSession) {
    notFound();
  }

  const totalQuestions = mockSession.questionSet?.questions.length ?? 0;
  const savedAnswers = mockSession.responses.length;
  const completionPercent =
    totalQuestions > 0 ? Math.round((savedAnswers / totalQuestions) * 100) : 0;
  const isCompleted = totalQuestions > 0 && savedAnswers >= totalQuestions;

  return (
    <div className="space-y-6">
      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            isCompleted
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {message}
        </p>
      ) : null}
      {isCompleted ? (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {t("sessionComplete")}
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
                  {t("allQuestionsAnswered")}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t("completionDescription")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/question-bank" variant="outline">
                  {t("backToQuestionBank")}
                </Button>
                {mockSession.jobApplication ? (
                  <Button href={`/applications/${mockSession.jobApplication.id}`} variant="outline">
                    {t("openApplication")}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[20px] border border-emerald-200 bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">{t("totalQuestions")}</p>
                <p className="mt-2 font-heading text-3xl font-bold">{totalQuestions}</p>
              </div>
              <div className="rounded-[20px] border border-emerald-200 bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">{t("answered")}</p>
                <p className="mt-2 font-heading text-3xl font-bold">{savedAnswers}</p>
              </div>
              <div className="rounded-[20px] border border-emerald-200 bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="mt-2 font-heading text-3xl font-bold capitalize">
                  {t(`statusValue.${mockSession.status}`)}
                </p>
              </div>
              <div className="rounded-[20px] border border-emerald-200 bg-white/70 p-4">
                <p className="text-sm text-muted-foreground">{t("updated")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {formatDateTime(mockSession.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-5 p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
                <Badge tone={mockSession.status === "completed" ? "success" : "warning"}>
                {t(`statusValue.${mockSession.status}`)}
                </Badge>
              {mockSession.jobApplication ? (
                <Badge tone="neutral" className="bg-white/10 text-white">
                  {mockSession.jobApplication.company}
                </Badge>
              ) : null}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                {t("sessionLabel")}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold">{mockSession.title}</h1>
              <p className="mt-3 text-white/70">
                {t("sessionDescription")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">{t("questions")}</p>
                <p className="mt-2 font-heading text-4xl font-bold">{totalQuestions}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">{t("savedAnswers")}</p>
                <p className="mt-2 font-heading text-4xl font-bold">{savedAnswers}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <p className="text-white/70">{t("progress")}</p>
                <p className="font-semibold text-white">
                  {t("answeredCount", { answered: savedAnswers, total: totalQuestions || 0 })}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-secondary transition-[width]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-sm text-white/60">{t("percentComplete", { percent: completionPercent })}</p>
            </div>
            <p className="text-sm text-white/60">
              {t("lastUpdated", { date: formatDateTime(mockSession.updatedAt) })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-7 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {t("sessionContext")}
            </p>
            <div className="rounded-[24px] border border-border/60 bg-white/70 p-5">
              <p className="text-sm text-muted-foreground">{t("questionSet")}</p>
              <p className="mt-2 font-semibold">
                {mockSession.questionSet?.title ?? t("questionSetUnavailable")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mockSession.jobApplication
                  ? `${mockSession.jobApplication.company} · ${mockSession.jobApplication.roleTitle}`
                  : t("generalPracticeSession")}
              </p>
            </div>
            {totalQuestions === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
                {t("noQuestions")}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {t("questionWorkHint")}
                </p>
                <div className="rounded-[24px] border border-border/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("questionNavigation")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mockSession.questionSet?.questions.map((question, index) => {
                      const answered = mockSession.responses.some(
                        (response) => response.questionId === question.id,
                      );

                      return (
                        <a
                          key={question.id}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                            answered
                              ? "border-primary/30 bg-emerald-50 text-emerald-700"
                              : "border-border bg-white text-slate-700 hover:bg-muted/70"
                          }`}
                          href={`#question-${index + 1}`}
                        >
                          <span>Q{index + 1}</span>
                          <span className="text-xs opacity-75">
                            {answered ? t("saved") : t("open")}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {mockSession.questionSet?.questions.length ? (
        <SessionQuestionList
          highlightedQuestionId={savedQuestionId}
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
