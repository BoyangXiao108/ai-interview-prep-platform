import { z } from "zod";

export const generateQuestionSetSchema = z.object({
  applicationId: z.string().trim().min(1, "Application id is required."),
});

export const questionBankFilterSchema = z.object({
  applicationId: z.string().trim().optional(),
  category: z
    .enum(["ALL", "BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "LEADERSHIP"])
    .optional(),
  difficulty: z.enum(["ALL", "EASY", "MEDIUM", "HARD"]).optional(),
  type: z.enum(["ALL", "behavioral", "technical", "resume-based"]).optional(),
});
