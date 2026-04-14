import { z } from "zod";

export const generateQuestionsSchema = z.object({
  applicationId: z.string().min(1, "Application id is required."),
  resumeText: z.string().trim().min(20, "Resume content is required."),
  jobDescription: z.string().trim().min(20, "Job description is required."),
});

export const feedbackSchema = z.object({
  interviewSessionId: z.string().min(1, "Interview session id is required."),
  questionPrompt: z.string().trim().min(5, "Question prompt is required."),
  answer: z.string().trim().min(20, "Answer is too short for feedback."),
});
