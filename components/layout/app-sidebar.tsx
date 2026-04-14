"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const t = useTranslations("Nav");
  const common = useTranslations("Common");
  const pathname = usePathname();
  const navItems = [
    { label: t("dashboard"), href: "/dashboard", match: "/dashboard" },
    { label: t("applications"), href: "/applications", match: "/applications" },
    { label: t("questionBank"), href: "/question-bank", match: "/question-bank" },
    { label: t("mockInterviews"), href: "/mock", match: "/mock" },
  ];

  return (
    <aside className="app-shell hidden w-72 rounded-[32px] border border-white/50 p-5 lg:block">
      <div className="rounded-[24px] bg-slate-900 px-5 py-6 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t("prepOs")}</p>
        <h2 className="mt-3 font-heading text-2xl font-bold">
          {t("sidebarTitle")}
        </h2>
        <Badge className="mt-4 bg-white/12 text-white" tone="neutral">
          {t("mvpBuild")}
        </Badge>
      </div>
      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.match}/`);

          return (
          <Link
            key={item.href}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-white/80",
            )}
            href={item.href}
          >
            <span>{item.label}</span>
            <span className="text-xs opacity-70">{common("open")}</span>
          </Link>
        )})}
      </nav>
    </aside>
  );
}
