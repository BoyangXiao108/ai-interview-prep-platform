import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getDirection } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Prep Platform",
  description:
    "A production-style interview preparation workspace for tracking applications, preparing resumes, and running AI-powered mock interviews.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className="h-full scroll-smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
