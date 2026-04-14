"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/auth";

function getRedirectMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(getRedirectMessage("/register", parsed.error.issues[0]?.message ?? "Invalid input."));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    redirect(getRedirectMessage("/register", "An account with that email already exists."));
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
    redirectTo: "/dashboard",
  });
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(getRedirectMessage("/login", parsed.error.issues[0]?.message ?? "Invalid input."));
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(getRedirectMessage("/login", "Incorrect email or password."));
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/login",
  });
}
