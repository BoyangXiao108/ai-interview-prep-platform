import { ApplicationStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { ApplicationForm } from "@/components/forms/application-form";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date";
import { getApplicationsForUser } from "@/lib/applications";
import { auth } from "@/lib/auth";

const statusBadgeTone = {
  WISHLIST: "neutral",
  APPLIED: "info",
  INTERVIEW: "warning",
  OFFER: "success",
  REJECTED: "danger",
} as const;

interface ApplicationsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    message?: string;
  }>;
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const t = await getTranslations("Applications");
  const common = await getTranslations("Common");
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { q, status, message } = await searchParams;
  const statusFilter =
    status && status !== "ALL" && Object.values(ApplicationStatus).includes(status as ApplicationStatus)
      ? (status as ApplicationStatus)
      : "ALL";

  const applications = await getApplicationsForUser(session.user.id, {
    query: q,
    status: statusFilter,
  });

  const statusOptions = [
    { value: "ALL", label: t("allStatuses") },
    { value: "WISHLIST", label: t("status.WISHLIST") },
    { value: "APPLIED", label: t("status.APPLIED") },
    { value: "INTERVIEW", label: t("status.INTERVIEW") },
    { value: "OFFER", label: t("status.OFFER") },
    { value: "REJECTED", label: t("status.REJECTED") },
  ] as const;

  const statusLabels = {
    WISHLIST: t("status.WISHLIST"),
    APPLIED: t("status.APPLIED"),
    INTERVIEW: t("status.INTERVIEW"),
    OFFER: t("status.OFFER"),
    REJECTED: t("status.REJECTED"),
  } as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {t("tracker")}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Card>
          <CardContent>
            <ApplicationForm message={message} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
            <Input defaultValue={q} name="q" placeholder={t("searchPlaceholder")} />
            <Select defaultValue={statusFilter} name="status">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              type="submit"
            >
              {t("applyFilters")}
            </button>
          </form>
          {applications.length ? (
            <div className="overflow-hidden rounded-[24px] border border-border/60">
              <div className="grid grid-cols-[1.1fr_1.1fr_1fr_0.8fr_1.2fr] gap-4 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>{t("company")}</span>
                <span>{t("roleLabel")}</span>
                <span>{common("location")}</span>
                <span>{t("statusLabel")}</span>
                <span>{t("createdUpdated")}</span>
              </div>
              <div className="divide-y divide-border/60 bg-white/70">
                {applications.map((application) => (
                  <Link
                    key={application.id}
                    className="grid grid-cols-[1.1fr_1.1fr_1fr_0.8fr_1.2fr] gap-4 px-4 py-4 text-sm transition hover:bg-white"
                    href={`/applications/${application.id}`}
                  >
                    <span className="font-semibold">{application.company}</span>
                    <span>{application.roleTitle}</span>
                    <span>{application.location || t("locationTbd")}</span>
                    <span>
                      <Badge tone={statusBadgeTone[application.status]}>
                        {statusLabels[application.status]}
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">
                      <span className="block">
                        {t("createdLabel", { date: formatDate(application.createdAt) })}
                      </span>
                      <span className="block">
                        {t("updatedLabel", { date: formatDate(application.updatedAt) })}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm leading-7 text-muted-foreground">
              {q || statusFilter !== "ALL"
                ? t("emptyFiltered")
                : t("empty")}
            </div>
          )}
        </CardContent>
      </Card>
      <KanbanBoard applications={applications} />
    </div>
  );
}
