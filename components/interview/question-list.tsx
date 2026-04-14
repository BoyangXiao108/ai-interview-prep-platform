import { questionBank } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function QuestionList() {
  return (
    <div className="space-y-4">
      {questionBank.map((question) => (
        <Card key={question.id}>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{question.category}</Badge>
              <Badge tone="warning">{question.difficulty}</Badge>
              <Badge>{question.source}</Badge>
            </div>
            <p className="text-base font-medium leading-7">{question.prompt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
