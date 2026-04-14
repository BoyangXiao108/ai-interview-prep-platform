"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", match: "/dashboard" },
  { label: "Applications", href: "/applications", match: "/applications" },
  { label: "Question Bank", href: "/question-bank", match: "/question-bank" },
  { label: "Mock Interviews", href: "/mock", match: "/mock" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-shell hidden w-72 rounded-[32px] border border-white/50 p-5 lg:block">
      <div className="rounded-[24px] bg-slate-900 px-5 py-6 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-white/60">Prep OS</p>
        <h2 className="mt-3 font-heading text-2xl font-bold">
          Interview momentum, all in one place.
        </h2>
        <Badge className="mt-4 bg-white/12 text-white" tone="neutral">
          MVP build
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
            <span className="text-xs opacity-70">Open</span>
          </Link>
        )})}
      </nav>
    </aside>
  );
}
