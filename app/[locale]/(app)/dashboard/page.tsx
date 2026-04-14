import { getTranslations } from "next-intl/server";

import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/date";
import { getDashboardData } from "@/lib/dashboard";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
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
              {t("label")}
            </Badge>
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-white/72">
                {t("description")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {t("countsByStatus")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(data.countsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {t(`status.${status}`)}
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
                {t("recentApplications")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">{t("latestUpdates")}</h2>
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
                    {t(`status.${application.status}`)}
                  </Badge>
                  </div>
                  <p className="mt-3 text-sm">{application.location || t("locationTbd")}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("updatedAt", { date: formatDate(application.updatedAt) })}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm text-muted-foreground">
                {t("noApplications")}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {t("recentInterviewSessions")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">{t("practiceHistory")}</h2>
            </div>
            {data.recentInterviewSessions.length ? (
              data.recentInterviewSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[24px] border border-border/60 bg-white/70 p-4"
                >
                  <Link className="font-semibold hover:text-primary" href={`/mock/${session.id}`}>
                    {session.title}
                  </Link>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">
                    {t("statusLabelValue", { status: t(`sessionStatus.${session.status}`) })}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("updatedAt", { date: formatDate(session.updatedAt) })}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm text-muted-foreground">
                {t("noMockSessions")}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
