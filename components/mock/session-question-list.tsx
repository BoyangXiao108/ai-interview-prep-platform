"use client";

import { useTranslations } from "next-intl";

import { saveInterviewAnswerAction } from "@/actions/mock";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SessionQuestionListProps {
  sessionId: string;
  returnPath: string;
  highlightedQuestionId?: string;
  questions: Array<{
    id: string;
    prompt: string;
    category: string;
    difficulty: string;
  }>;
  responses: Array<{
    questionId: string;
    answer: string;
    updatedAt: Date;
  }>;
}

const difficultyTone = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
} as const;

export function SessionQuestionList({
  sessionId,
  returnPath,
  highlightedQuestionId,
  questions,
  responses,
}: SessionQuestionListProps) {
  const t = useTranslations("Mock");
  const questionBank = useTranslations("QuestionBank");
  const responsesByQuestionId = new Map(
    responses.map((response) => [response.questionId, response]),
  );

  return (
    <div className="space-y-5">
      {questions.map((question, index) => {
        const existingResponse = responsesByQuestionId.get(question.id);
        const questionAnchor = `question-${index + 1}`;
        const isHighlighted = highlightedQuestionId === question.id;

        return (
          <Card
            id={questionAnchor}
            key={question.id}
            className={cn(
              existingResponse ? "border-primary/30" : "",
              isHighlighted ? "ring-2 ring-primary/25" : "",
            )}
          >
            <CardContent className="space-y-4 p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{questionBank(`category.${question.category}`)}</Badge>
                <Badge tone={difficultyTone[question.difficulty as keyof typeof difficultyTone]}>
                  {questionBank(`difficulty.${question.difficulty}`)}
                </Badge>
                {existingResponse ? <Badge tone="success">{t("saved")}</Badge> : null}
                {isHighlighted ? <Badge tone="success">{t("justUpdated")}</Badge> : null}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("questionIndex", { current: index + 1, total: questions.length })}
                </p>
                <p className="mt-2 text-lg font-medium leading-8">{question.prompt}</p>
              </div>
              <form action={saveInterviewAnswerAction} className="space-y-4">
                <input name="sessionId" type="hidden" value={sessionId} />
                <input name="questionId" type="hidden" value={question.id} />
                <input name="returnPath" type="hidden" value={returnPath} />
                <Textarea
                  className="min-h-32 bg-white"
                  defaultValue={existingResponse?.answer ?? ""}
                  name="answer"
                  placeholder={t("writeAnswer")}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {existingResponse
                      ? t("savedHint")
                      : t("draftHint")}
                  </p>
                  <SubmitButton pendingText={t("savingAnswer")} variant="outline">
                    {existingResponse ? t("updateAnswer") : t("saveAnswer")}
                  </SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
