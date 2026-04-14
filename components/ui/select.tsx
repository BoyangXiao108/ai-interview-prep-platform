import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
