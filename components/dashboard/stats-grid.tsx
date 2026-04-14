"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardDataRequirements } from "@/lib/dashboard";

interface StatsGridProps {
  data: DashboardDataRequirements;
}

export function StatsGrid({ data }: StatsGridProps) {
  const t = useTranslations("Dashboard");
  const applicationStats = [
    {
      label: t("stats.totalApplications"),
      value: String(data.totalApplications),
      trend: t("stats.inInterview", { count: data.countsByStatus.INTERVIEW }),
    },
    {
      label: t("stats.applied"),
      value: String(data.countsByStatus.APPLIED),
      trend: t("stats.onWishlist", { count: data.countsByStatus.WISHLIST }),
    },
    {
      label: t("stats.offers"),
      value: String(data.countsByStatus.OFFER),
      trend: t("stats.closedOut", { count: data.countsByStatus.REJECTED }),
    },
    {
      label: t("stats.generatedQuestions"),
      value: String(data.totalGeneratedQuestions),
      trend: t("stats.acrossAllQuestionSets"),
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
