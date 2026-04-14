import { z } from "zod";

export const optionalStringField = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  return value;
}, z.string().optional());

export const requiredTrimmedString = (message: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value.trim();
    }

    return value;
  }, z.string().min(1, message));

export function getFirstValidationMessage(
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>,
  fallback = "Please check your input and try again.",
) {
  return issues[0]?.message ?? fallback;
}
