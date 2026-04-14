"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { withLocale } from "@/lib/locale";
import { getLoginSchema, getRegisterSchema } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/auth";

function getRedirectMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function registerAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const parsed = getRegisterSchema((key) => validation(key)).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      getRedirectMessage(
        withLocale(locale, "/register"),
        parsed.error.issues[0]?.message ?? "Invalid input.",
      ),
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    redirect(
      getRedirectMessage(withLocale(locale, "/register"), messages("accountExists")),
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: withLocale(locale, "/dashboard"),
  });
}

export async function loginAction(formData: FormData) {
  const locale = (await getLocale()) as Locale;
  const validation = await getTranslations({ locale, namespace: "Validation" });
  const messages = await getTranslations({ locale, namespace: "Messages" });
  const parsed = getLoginSchema((key) => validation(key)).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      getRedirectMessage(
        withLocale(locale, "/login"),
        parsed.error.issues[0]?.message ?? "Invalid input.",
      ),
    );
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: withLocale(locale, "/dashboard"),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(getRedirectMessage(withLocale(locale, "/login"), messages("loginInvalid")));
    }

    throw error;
  }
}

export async function logoutAction() {
  const locale = (await getLocale()) as Locale;

  await signOut({
    redirectTo: withLocale(locale, "/login"),
  });
}
