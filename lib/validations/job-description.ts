import { z } from "zod";

export const jobDescriptionSchema = z.object({
  applicationId: z.string().trim().min(1, "Application id is required."),
  rawText: z.string().trim().min(20, "Job description must be at least 20 characters."),
});
