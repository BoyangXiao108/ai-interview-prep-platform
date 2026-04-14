import { auth } from "@/lib/auth";
import { getMockSessionsForUser } from "@/lib/mock/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";

interface MockIndexPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function MockIndexPage({ searchParams }: MockIndexPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { message } = await searchParams;
  const sessions = await getMockSessionsForUser(session.user.id);

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Mock interviews
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Practice against your saved question sets.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Start a session from the Question Bank, then come back here to revisit saved answers and continue active practice sessions.
        </p>
      </div>
      {sessions.length ? (
        <div className="space-y-4">
          {sessions.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 p-7 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.status === "completed" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                    {item.questionSet ? (
                      <Badge tone="neutral">{item.questionSet.title}</Badge>
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-heading text-2xl font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.jobApplication
                      ? `${item.jobApplication.company} · ${item.jobApplication.roleTitle}`
                      : "General mock session"}{" "}
                    • {item._count.responses} answer(s) saved • Updated{" "}
                    {formatDateTime(item.updatedAt)}
                  </p>
                </div>
                <Button href={`/mock/${item.id}`}>Open session</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-8 text-sm leading-7 text-muted-foreground">
          No mock sessions yet. Start one from a question set in the Question Bank.
        </div>
      )}
    </div>
  );
}
