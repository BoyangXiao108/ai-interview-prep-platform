import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  jobApplication: {
    findFirst: vi.fn(),
  },
  questionSet: {
    create: vi.fn(),
  },
};

const getOpenAIClientMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: getOpenAIClientMock,
}));

describe("question generation fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to starter questions when AI generation fails", async () => {
    prismaMock.jobApplication.findFirst.mockResolvedValue({
      id: "app-1",
      userId: "user-1",
      company: "Notion",
      roleTitle: "Product Engineer",
      location: "Remote",
      status: "APPLIED",
      sourceUrl: null,
      salaryRange: null,
      resumeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobDescription: {
        id: "jd-1",
        applicationId: "app-1",
        rawText: "We are hiring a product engineer to work across frontend systems.",
        summary: null,
        keywordsJson: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      resume: null,
    });
    getOpenAIClientMock.mockImplementation(() => {
      throw new Error("OPENAI_API_KEY is not configured.");
    });
    prismaMock.questionSet.create.mockResolvedValue({ id: "qs-1" });

    const { generateQuestionSetForApplication } = await import(
      "@/lib/questions/generator"
    );

    const result = await generateQuestionSetForApplication("user-1", "app-1");

    expect(result.ok).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(prismaMock.questionSet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourceType: "MANUAL",
          title: "Starter set · Notion",
          questions: {
            create: expect.arrayContaining([
              expect.objectContaining({ source: "behavioral" }),
              expect.objectContaining({ source: "technical" }),
              expect.objectContaining({ source: "resume-based" }),
            ]),
          },
        }),
      }),
    );
  });
});
