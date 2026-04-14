import {routing} from "@/i18n/routing";

export function withLocale(locale: string, pathname: string) {
  if (!pathname.startsWith("/")) {
    return `/${locale}/${pathname}`;
  }

  const localePrefix = `/${locale}`;

  if (pathname === localePrefix || pathname.startsWith(`${localePrefix}/`)) {
    return pathname;
  }

  const hasKnownLocalePrefix = routing.locales.some(
    (knownLocale) =>
      pathname === `/${knownLocale}` || pathname.startsWith(`/${knownLocale}/`),
  );

  if (hasKnownLocalePrefix) {
    return pathname;
  }

  return `${localePrefix}${pathname}`;
}

export function getDirection(locale: string) {
  return locale === "ar" ? "rtl" : "ltr";
}
