import { ApplicationStatus } from "@prisma/client";
import Link from "next/link";

import { ApplicationForm } from "@/components/forms/application-form";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date";
import { getApplicationsForUser } from "@/lib/applications";
import { auth } from "@/lib/auth";

const statusOptions = [
  { value: "ALL", label: "All statuses" },
  { value: "WISHLIST", label: "Wishlist" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
] as const;

const statusLabels = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
} as const;

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

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Tracker
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Manage every role from wishlist to offer.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Search, filter, create, and update applications in one place.
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
            <Input defaultValue={q} name="q" placeholder="Search company, role, or location" />
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
              Apply filters
            </button>
          </form>
          {applications.length ? (
            <div className="overflow-hidden rounded-[24px] border border-border/60">
              <div className="grid grid-cols-[1.1fr_1.1fr_1fr_0.8fr_1.2fr] gap-4 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Company</span>
                <span>Role</span>
                <span>Location</span>
                <span>Status</span>
                <span>Created / Updated</span>
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
                    <span>{application.location || "Location TBD"}</span>
                    <span>
                      <Badge tone={statusBadgeTone[application.status]}>
                        {statusLabels[application.status]}
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">
                      <span className="block">Created {formatDate(application.createdAt)}</span>
                      <span className="block">Updated {formatDate(application.updatedAt)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/60 p-6 text-sm text-muted-foreground">
              No applications match the current filters yet.
            </div>
          )}
        </CardContent>
      </Card>
      <KanbanBoard applications={applications} />
    </div>
  );
}
