import { z } from "zod";
import enMessages from "@/messages/en.json";

import { optionalStringField, requiredTrimmedString } from "@/lib/validations/helpers";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getGenerateQuestionSetSchema(
  t: ValidationTranslator = defaultValidation,
) {
  return z.object({
    applicationId: requiredTrimmedString(t("selectApplicationGenerate")),
  });
}

export const questionBankFilterSchema = z.object({
  applicationId: optionalStringField,
  category: z
    .enum(["ALL", "BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "LEADERSHIP"])
    .optional(),
  difficulty: z.enum(["ALL", "EASY", "MEDIUM", "HARD"]).optional(),
  type: z.enum(["ALL", "behavioral", "technical", "resume-based"]).optional(),
});

export const generateQuestionSetSchema = getGenerateQuestionSetSchema();
