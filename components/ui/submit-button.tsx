"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function SubmitButton({
  children,
  pendingText = "Saving...",
  className,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending} type="submit" variant={variant}>
      {pending ? pendingText : children}
    </Button>
  );
}
