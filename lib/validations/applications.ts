import { z } from "zod";

const optionalTextField = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  return value;
}, z.string().optional());

export const applicationSchema = z.object({
  company: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(2, "Company is required."),
  ),
  roleTitle: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(2, "Role title is required."),
  ),
  location: optionalTextField,
  sourceUrl: z.preprocess((value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }

    return value;
  }, z.string().url("Job post URL must be a valid URL.").optional()),
  salaryRange: optionalTextField,
  status: z
    .enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"])
    .default("WISHLIST"),
  resumeId: optionalTextField,
});
