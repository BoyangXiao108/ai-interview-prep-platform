import Link from "next/link";
import { ApplicationStatus, type JobApplication } from "@prisma/client";

import { updateApplicationStatusAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/date";

const columns: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

const labels: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

interface KanbanBoardProps {
  applications: JobApplication[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {columns.map((column) => {
        const items = applications.filter((application) => application.status === column);

        return (
          <div key={column} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading text-lg font-semibold">{labels[column]}</h3>
              <span className="text-sm text-muted-foreground">{items.length}</span>
            </div>
            {items.map((item) => (
              <Card key={item.id} className="bg-white/85">
                <CardContent className="space-y-3">
                  <div>
                    <Link
                      className="font-semibold hover:text-primary"
                      href={`/applications/${item.id}`}
                    >
                      {item.company}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.roleTitle}</p>
                  </div>
                  <p className="text-sm">{item.location || "Location TBD"}</p>
                  <p className="text-xs text-muted-foreground">Updated {formatDate(item.updatedAt)}</p>
                  <form action={updateApplicationStatusAction} className="space-y-2">
                    <input name="applicationId" type="hidden" value={item.id} />
                    <input name="returnPath" type="hidden" value="/applications" />
                    <Select
                      aria-label={`Update status for ${item.company}`}
                      className="h-10 text-xs"
                      defaultValue={item.status}
                      name="status"
                    >
                      {columns.map((status) => (
                        <option key={status} value={status}>
                          {labels[status]}
                        </option>
                      ))}
                    </Select>
                    <Button className="h-9 w-full rounded-2xl text-xs" type="submit" variant="outline">
                      Save status
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}
