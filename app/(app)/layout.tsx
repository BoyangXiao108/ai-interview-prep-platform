import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <AppSidebar />
      <div className="app-shell flex-1 rounded-[32px] border border-white/50 p-5 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-white/60 px-5 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-semibold">{session.user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </div>
        {children}
      </div>
    </main>
  );
}
