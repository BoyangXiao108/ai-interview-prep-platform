import { z } from "zod";
import enMessages from "@/messages/en.json";

type ValidationKey = keyof typeof enMessages.Validation;
type ValidationTranslator = (key: ValidationKey) => string;

const defaultValidation: ValidationTranslator = (key) => enMessages.Validation[key];

export function getRegisterSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    name: z.string().trim().min(2, t("registerName")),
    email: z.email(t("loginEmail")).trim().toLowerCase(),
    password: z
      .string()
      .min(8, t("registerPasswordShort"))
      .max(72, t("registerPasswordLong")),
  });
}

export function getLoginSchema(t: ValidationTranslator = defaultValidation) {
  return z.object({
    email: z.email(t("loginEmail")).trim().toLowerCase(),
    password: z.string().min(1, t("loginPassword")),
  });
}

export const registerSchema = getRegisterSchema();
export const loginSchema = getLoginSchema();
