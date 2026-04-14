import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
}

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(15,118,110,0.22)] hover:opacity-95",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-95",
  outline: "border bg-white/70 hover:bg-white",
  ghost: "hover:bg-muted/70",
};

export function Button({
  className,
  variant = "primary",
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    styles[variant],
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {props.children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
