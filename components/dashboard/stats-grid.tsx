import { Card, CardContent } from "@/components/ui/card";
import type { DashboardDataRequirements } from "@/lib/dashboard";

interface StatsGridProps {
  data: DashboardDataRequirements;
}

export function StatsGrid({ data }: StatsGridProps) {
  const applicationStats = [
    {
      label: "Total applications",
      value: String(data.totalApplications),
      trend: `${data.countsByStatus.INTERVIEW} in interview`,
    },
    {
      label: "Applied",
      value: String(data.countsByStatus.APPLIED),
      trend: `${data.countsByStatus.WISHLIST} on wishlist`,
    },
    {
      label: "Offers",
      value: String(data.countsByStatus.OFFER),
      trend: `${data.countsByStatus.REJECTED} closed out`,
    },
    {
      label: "Generated questions",
      value: String(data.totalGeneratedQuestions),
      trend: "Across all question sets",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {applicationStats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="font-heading text-4xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {stat.trend}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
