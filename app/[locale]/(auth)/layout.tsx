import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-12 lg:px-8">
      <div className="w-full max-w-md rounded-[32px] border bg-white/80 p-8 shadow-[var(--shadow)]">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </main>
  );
}
