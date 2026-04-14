import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { message } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Start your prep system
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure credentials auth is enabled with Prisma-backed user storage.
        </p>
      </div>
      {message ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </p>
      ) : null}
      <form action={registerAction} className="space-y-4">
        <Input name="name" placeholder="Full name" />
        <Input name="email" type="email" placeholder="Email address" />
        <Input name="password" type="password" placeholder="Create password" />
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}
