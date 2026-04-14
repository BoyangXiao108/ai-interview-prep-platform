import { z } from "zod";
import enMessages from "@/messages/en.json";

import {
  optionalStringField,
  requiredTrimmedString,
} from "@/lib/validations/helpers";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getApplicationSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    company: requiredTrimmedString(t("companyRequired")),
    roleTitle: requiredTrimmedString(t("roleTitleRequired")),
    location: optionalStringField,
    sourceUrl: z.preprocess((value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      }

      return value;
    }, z.string().url(t("jobUrlInvalid")).optional()),
    salaryRange: optionalStringField,
    status: z
      .enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"], {
        message: t("validApplicationStatus"),
      })
      .default("WISHLIST"),
    resumeId: optionalStringField,
  });
}

export const applicationSchema = getApplicationSchema();
