import { saveInterviewAnswerAction } from "@/actions/mock";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SessionQuestionListProps {
  sessionId: string;
  returnPath: string;
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
  questions,
  responses,
}: SessionQuestionListProps) {
  const responsesByQuestionId = new Map(
    responses.map((response) => [response.questionId, response]),
  );

  return (
    <div className="space-y-5">
      {questions.map((question, index) => {
        const existingResponse = responsesByQuestionId.get(question.id);

        return (
          <Card key={question.id} className={cn(existingResponse ? "border-primary/30" : "")}>
            <CardContent className="space-y-4 p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{question.category}</Badge>
                <Badge tone={difficultyTone[question.difficulty as keyof typeof difficultyTone]}>
                  {question.difficulty}
                </Badge>
                {existingResponse ? <Badge tone="success">Saved</Badge> : null}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Question {index + 1}
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
                  placeholder="Write your answer here..."
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {existingResponse
                      ? "You can keep refining this saved answer."
                      : "Draft an answer and save your progress."}
                  </p>
                  <SubmitButton pendingText="Saving..." variant="outline">
                    {existingResponse ? "Update answer" : "Save answer"}
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
