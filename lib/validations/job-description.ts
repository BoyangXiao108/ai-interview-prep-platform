import { z } from "zod";
import enMessages from "@/messages/en.json";

import { requiredTrimmedString } from "@/lib/validations/helpers";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getJobDescriptionSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    applicationId: requiredTrimmedString(t("jobDescriptionUnavailable")),
    rawText: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().min(20, t("jobDescriptionTooShort")),
    ),
  });
}

export const jobDescriptionSchema = getJobDescriptionSchema();
