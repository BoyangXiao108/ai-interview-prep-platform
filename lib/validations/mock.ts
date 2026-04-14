import { z } from "zod";
import enMessages from "@/messages/en.json";

import { requiredTrimmedString } from "@/lib/validations/helpers";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getStartSessionSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    questionSetId: requiredTrimmedString(t("selectQuestionSet")),
  });
}

export function getSaveInterviewAnswerSchema(
  t: ValidationTranslator = defaultValidation,
) {
  return z.object({
    sessionId: requiredTrimmedString(t("reloadSession")),
    questionId: requiredTrimmedString(t("questionSaveUnavailable")),
    answer: requiredTrimmedString(t("answerRequired")),
  });
}

export const startSessionSchema = getStartSessionSchema();
export const saveInterviewAnswerSchema = getSaveInterviewAnswerSchema();
