import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

export async function MarketingNav() {
  const t = await getTranslations("Marketing");

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">
            AI Interview Prep Platform
          </p>
          <p className="text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button variant="ghost" href="/login">
            {t("logIn")}
          </Button>
          <Button href="/register">{t("startFree")}</Button>
        </div>
      </div>
    </header>
  );
}
