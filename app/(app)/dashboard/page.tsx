import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { getDashboardData } from "@/lib/dashboard";
import { auth } from "@/lib/auth";

const statusLabels = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-5 p-8">
            <Badge className="bg-white/10 text-white" tone="neutral">
              Dashboard
            </Badge>
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight">
                Stay interview-ready across every application.
              </h1>
              <p className="mt-3 max-w-2xl text-white/72">
                This MVP dashboard surfaces your application momentum, practice
                activity, and AI-generated prep materials in one place.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Counts by status
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(data.countsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {statusLabels[status as keyof typeof statusLabels]}
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      <StatsGrid data={data} />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Recent applications
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Latest updates</h2>
            </div>
            {data.recentApplications.length ? (
              data.recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{application.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.roleTitle}
                      </p>
                    </div>
                    <Badge tone="info">
                      {statusLabels[application.status]}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm">
                    {application.location || "Location TBD"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated {formatDate(application.updatedAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm text-muted-foreground">
                No applications yet. Create your first one from the tracker page.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Recent interview sessions
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Practice history</h2>
            </div>
            {data.recentInterviewSessions.length ? (
              data.recentInterviewSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-4"
                >
                  <a className="font-semibold hover:text-primary" href={`/mock/${session.id}`}>
                    {session.title}
                  </a>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">
                    Status: {session.status}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated {formatDate(session.updatedAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm text-muted-foreground">
                No mock sessions yet. Session activity will appear here once interviews are created.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
