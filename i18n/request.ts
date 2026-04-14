import {getRequestConfig} from "next-intl/server";

import {routing} from "@/i18n/routing";

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const merged = {...base};

  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      merged[key] = deepMerge(
        base[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const defaultMessages = (await import(`../messages/${routing.defaultLocale}.json`)).default;
  const localeMessages =
    locale === routing.defaultLocale
      ? defaultMessages
      : (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMerge(defaultMessages, localeMessages),
  };
});
