import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">
            AI Interview Prep Platform
          </p>
          <p className="text-sm text-muted-foreground">
            Prepare smarter. Interview sharper.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" href="/login">
            Log in
          </Button>
          <Button href="/register">Start free</Button>
        </div>
      </div>
    </header>
  );
}
