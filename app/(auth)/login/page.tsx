import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Welcome back
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your account to continue into the interview prep workspace.
        </p>
      </div>
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <form action={loginAction} className="space-y-4">
        <Input name="email" type="email" placeholder="Email address" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}
