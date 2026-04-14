"use client";

import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";
import {startTransition} from "react";

import {usePathname, useRouter} from "@/i18n/navigation";
import {Select} from "@/components/ui/select";

const localeOptions = [
  {value: "en", label: "English"},
  {value: "zh", label: "中文"},
  {value: "es", label: "Español"},
  {value: "hi", label: "हिन्दी"},
  {value: "ar", label: "العربية"},
] as const;

export function LanguageSwitcher() {
  const t = useTranslations("Language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("label")}</span>
      <Select
        aria-label={t("label")}
        className="h-10 min-w-[140px] bg-white"
        defaultValue={locale}
        onChange={(event) => {
          const nextLocale = event.target.value;
          startTransition(() => {
            router.replace(
              // @ts-expect-error next-intl params typing is route-derived at runtime
              {pathname, params},
              {locale: nextLocale},
            );
          });
        }}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
