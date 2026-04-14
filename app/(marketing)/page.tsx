import { MarketingNav } from "@/components/layout/marketing-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  "Track every application with a recruiter-ready Kanban workflow.",
  "Generate targeted interview questions from your resume and job description.",
  "Practice mock interviews and collect AI feedback with saved notes.",
];

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
        <section className="hero-grid overflow-hidden rounded-[40px] border border-border/60 bg-[rgba(255,253,248,0.82)] p-8 shadow-[var(--shadow)] lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
                Full-stack portfolio project starter
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
                Turn job search chaos into a focused interview prep system.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                AI Interview Prep Platform combines application tracking, resume-aware
                question generation, mock interview practice, and job-specific notes in
                one monolithic Next.js app.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/register">Create account</Button>
                <Button href="/dashboard" variant="outline">
                  Preview dashboard
                </Button>
              </div>
            </div>
            <Card className="bg-slate-950 text-white">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                    Weekly prep
                  </p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    84% ready
                  </span>
                </div>
                <div className="space-y-4">
                  {pillars.map((pillar) => (
                    <div
                      key={pillar}
                      className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                    >
                      <p className="leading-7 text-white/88">{pillar}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
