import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { logoutAction } from "@/actions/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { withLocale } from "@/lib/locale";

export default async function AppLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("Auth");

  if (!session?.user) {
    redirect(withLocale(locale, "/login"));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <AppSidebar />
      <div className="app-shell flex-1 rounded-[32px] border border-white/50 p-5 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-white/60 px-5 py-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("signedInAs")}</p>
            <p className="font-semibold">{session.user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                {t("logOut")}
              </Button>
            </form>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
