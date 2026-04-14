"use client";

import { useTranslations } from "next-intl";

import { startMockSessionAction } from "@/actions/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";

interface QuestionSetListProps {
  emptyMessage?: string;
  highlightedSetId?: string;
  questionSets: Array<{
    id: string;
    title: string;
    createdAt: Date;
    sourceType: string;
    application: {
      id: string;
      company: string;
      roleTitle: string;
    } | null;
    questions: Array<{
      id: string;
      prompt: string;
      category: string;
      difficulty: string;
      source: string;
    }>;
  }>;
}

const toneByDifficulty = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
} as const;

export function QuestionSetList({
  questionSets,
  highlightedSetId,
  emptyMessage,
}: QuestionSetListProps) {
  const t = useTranslations("QuestionBank");

  if (!questionSets.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-8 text-sm leading-7 text-muted-foreground">
        {emptyMessage ??
          "No question sets yet. Generate one from an application detail page or once you add a job description to an application."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questionSets.map((set) => (
        <Card
          key={set.id}
          className={cn(highlightedSetId === set.id ? "ring-2 ring-primary/25" : "")}
        >
          <CardContent className="space-y-5 p-7">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  {set.sourceType === "AI_GENERATED" ? t("aiGenerated") : t("starterSet")}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold">{set.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">
                    {set.application
                      ? `${set.application.company} · ${set.application.roleTitle}`
                      : t("generalQuestionSet")}
                  </Badge>
                  <Badge tone="neutral">
                    {t("createdOn", { date: formatDateTime(set.createdAt) })}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="neutral">{t("questions", { count: set.questions.length })}</Badge>
                <form action={startMockSessionAction}>
                  <input name="questionSetId" type="hidden" value={set.id} />
                  <SubmitButton pendingText={t("starting")} variant="outline">
                    {t("startMockSession")}
                  </SubmitButton>
                </form>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="info">
                {t("behavioral")}: {
                  set.questions.filter((question) => question.source === "behavioral").length
                }
              </Badge>
              <Badge tone="warning">
                {t("technical")}: {
                  set.questions.filter((question) => question.source === "technical").length
                }
              </Badge>
              <Badge tone="success">
                {t("resumeBased")}: {
                  set.questions.filter((question) => question.source === "resume-based").length
                }
              </Badge>
              {set.application ? (
                <Button href={`/applications/${set.application.id}`} variant="ghost">
                  {t("openApplication")}
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              {set.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{t(`category.${question.category}`)}</Badge>
                    <Badge tone={toneByDifficulty[question.difficulty as keyof typeof toneByDifficulty]}>
                      {t(`difficulty.${question.difficulty}`)}
                    </Badge>
                    <Badge tone="neutral">{t(`type.${question.source}`)}</Badge>
                  </div>
                  <p className="mt-3 text-base font-medium leading-7">
                    {index + 1}. {question.prompt}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
