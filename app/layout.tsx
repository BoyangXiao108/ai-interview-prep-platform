import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Prep Platform",
  description:
    "A production-style interview preparation workspace for tracking applications, preparing resumes, and running AI-powered mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
