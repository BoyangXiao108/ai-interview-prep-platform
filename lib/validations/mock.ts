import { z } from "zod";

export const startSessionSchema = z.object({
  questionSetId: z.string().trim().min(1, "Question set id is required."),
});

export const saveInterviewAnswerSchema = z.object({
  sessionId: z.string().trim().min(1, "Session id is required."),
  questionId: z.string().trim().min(1, "Question id is required."),
  answer: z.string().trim().min(1, "Answer cannot be empty."),
});
