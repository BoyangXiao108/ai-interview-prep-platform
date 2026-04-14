import { getTranslations } from "next-intl/server";

import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const t = await getTranslations("Auth");
  const { message } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          {t("startPrepSystem")}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold">{t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("registerDescription")}
        </p>
      </div>
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <form action={registerAction} className="space-y-4">
        <Input name="name" placeholder={t("fullName")} />
        <Input name="email" type="email" placeholder={t("email")} />
        <Input name="password" type="password" placeholder={t("createPassword")} />
        <Button type="submit" className="w-full">
          {t("createAccount")}
        </Button>
      </form>
    </div>
  );
}
