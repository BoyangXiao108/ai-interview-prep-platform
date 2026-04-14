import { z } from "zod";

export const prepNoteSchema = z.object({
  applicationId: z.string().optional(),
  noteType: z
    .enum([
      "RESEARCH",
      "INTERVIEW_STRATEGY",
      "COMPANY_CONTEXT",
      "ANSWER_DRAFT",
      "GENERAL",
    ])
    .default("GENERAL"),
  title: z.string().trim().min(2, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
});
