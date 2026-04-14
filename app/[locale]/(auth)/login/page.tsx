import { getTranslations } from "next-intl/server";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("Auth");
  const { message } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          {t("welcomeBack")}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold">{t("loginTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("loginDescription")}
        </p>
      </div>
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <form action={loginAction} className="space-y-4">
        <Input name="email" type="email" placeholder={t("email")} />
        <Input name="password" type="password" placeholder={t("password")} />
        <Button type="submit" className="w-full">
          {t("continue")}
        </Button>
      </form>
    </div>
  );
}
