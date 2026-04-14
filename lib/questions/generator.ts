import {
  type JobApplication,
  type JobDescription,
  type QuestionCategory,
  type QuestionDifficulty,
  type QuestionSourceType,
  type Resume,
} from "@prisma/client";

import { getOpenAIClient } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type ApplicationContext = JobApplication & {
  jobDescription: JobDescription | null;
  resume: Resume | null;
};

interface GeneratedQuestionDraft {
  prompt: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  source: string;
}

export interface GenerateQuestionSetResult {
  ok: boolean;
  code:
    | "APPLICATION_NOT_FOUND"
    | "JOB_DESCRIPTION_REQUIRED"
    | "QUESTION_SET_GENERATED"
    | "QUESTION_SET_FALLBACK";
  questionSetId?: string;
  usedFallback?: boolean;
}

function getApplicationTitle(application: JobApplication) {
  return `${application.company} · ${application.roleTitle}`;
}

function sanitizePrompt(line: string) {
  return line
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/^[\-\*\u2022]\s*/, "")
    .trim();
}

function fallbackQuestions(context: ApplicationContext): GeneratedQuestionDraft[] {
  const resumeReference = context.resume
    ? `based on your uploaded resume (${context.resume.fileName})`
    : "based on your recent experience";

  return [
    {
      prompt: `Tell me about a time you solved an ambiguous problem that relates to ${context.roleTitle} responsibilities at ${context.company}.`,
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      source: "behavioral",
    },
    {
      prompt: `Describe a project from your background that best demonstrates why you are a fit for ${context.roleTitle}.`,
      category: "BEHAVIORAL",
      difficulty: "EASY",
      source: "resume-based",
    },
    {
      prompt: `What technical decisions would you prioritize in your first 30 days if you joined ${context.company} as a ${context.roleTitle}?`,
      category: "TECHNICAL",
      difficulty: "MEDIUM",
      source: "technical",
    },
    {
      prompt: `Which part of this job description would likely be the hardest to ramp into, and how would you close that gap?`,
      category: "TECHNICAL",
      difficulty: "HARD",
      source: "technical",
    },
    {
      prompt: `Walk me through a resume example ${resumeReference} that shows leadership, ownership, or cross-functional collaboration.`,
      category: "LEADERSHIP",
      difficulty: "MEDIUM",
      source: "resume-based",
    },
    {
      prompt: `If asked about a key accomplishment from your resume in this interview loop, which story would you choose and why?`,
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      source: "resume-based",
    },
  ];
}

function parseModelOutput(raw: string): GeneratedQuestionDraft[] {
  const parsedJson = JSON.parse(raw) as {
    questions?: Array<{
      prompt?: string;
      category?: QuestionCategory;
      difficulty?: QuestionDifficulty;
      type?: string;
    }>;
  };

  return (parsedJson.questions ?? [])
    .map((item) => ({
      prompt: sanitizePrompt(item.prompt ?? ""),
      category: item.category ?? "BEHAVIORAL",
      difficulty: item.difficulty ?? "MEDIUM",
      source: item.type?.trim().toLowerCase() || "behavioral",
    }))
    .filter((item) => item.prompt.length > 0);
}

async function generateWithOpenAI(
  context: ApplicationContext,
): Promise<GeneratedQuestionDraft[]> {
  const client = getOpenAIClient();
  const resumeContext = context.resume
    ? `The candidate has an uploaded resume file named "${context.resume.fileName}".`
    : "No resume file is available, so make the resume-based questions lean on likely background storytelling.";

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Generate interview questions as strict JSON. Return an object with a `questions` array. Each item must include `prompt`, `category`, `difficulty`, and `type`. Allowed categories: BEHAVIORAL, TECHNICAL, LEADERSHIP. Allowed difficulty: EASY, MEDIUM, HARD. Allowed type: behavioral, technical, resume-based.",
      },
      {
        role: "user",
        content: `Target application: ${getApplicationTitle(context)}.
Job description:
${context.jobDescription?.rawText ?? ""}

${resumeContext}

Generate 6 questions total:
- 2 behavioral
- 2 technical
- 2 resume-based

The questions should feel tailored to the role and company. Return only JSON.`,
      },
    ],
  });

  return parseModelOutput(completion.output_text);
}

async function getOwnedApplicationContext(userId: string, applicationId: string) {
  return prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: {
      jobDescription: true,
      resume: true,
    },
  });
}

export async function generateQuestionSetForApplication(
  userId: string,
  applicationId: string,
): Promise<GenerateQuestionSetResult> {
  const context = await getOwnedApplicationContext(userId, applicationId);

  if (!context) {
    return {
      ok: false,
      code: "APPLICATION_NOT_FOUND",
    };
  }

  if (!context.jobDescription?.rawText) {
    return {
      ok: false,
      code: "JOB_DESCRIPTION_REQUIRED",
    };
  }

  let drafts = fallbackQuestions(context);
  let usedFallback = true;
  let sourceType: QuestionSourceType = "MANUAL";
  let title = `Starter set · ${context.company}`;

  try {
    drafts = await generateWithOpenAI(context);

    if (drafts.length > 0) {
      usedFallback = false;
      sourceType = "AI_GENERATED";
      title = `AI interview set · ${context.company}`;
    }
  } catch {
    drafts = fallbackQuestions(context);
  }

  if (drafts.length === 0) {
    drafts = fallbackQuestions(context);
  }

  const questionSet = await prisma.questionSet.create({
    data: {
      userId,
      applicationId: context.id,
      title,
      sourceType,
      questions: {
        create: drafts.map((draft) => ({
          prompt: draft.prompt,
          category: draft.category,
          difficulty: draft.difficulty,
          source: draft.source,
        })),
      },
    },
    select: {
      id: true,
    },
  });

  return {
    ok: true,
    code: usedFallback ? "QUESTION_SET_FALLBACK" : "QUESTION_SET_GENERATED",
    questionSetId: questionSet.id,
    usedFallback,
  };
}
