import { z } from "zod";
import enMessages from "@/messages/en.json";

import {
  optionalStringField,
  requiredTrimmedString,
} from "@/lib/validations/helpers";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getPrepNoteSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    applicationId: optionalStringField,
    noteType: z
      .enum([
        "RESEARCH",
        "INTERVIEW_STRATEGY",
        "COMPANY_CONTEXT",
        "ANSWER_DRAFT",
        "GENERAL",
      ])
      .or(z.literal("").transform(() => "GENERAL"))
      .default("GENERAL"),
    title: requiredTrimmedString(t("noteTitleRequired")),
    content: requiredTrimmedString(t("noteContentRequired")),
  });
}

export const prepNoteSchema = getPrepNoteSchema();
