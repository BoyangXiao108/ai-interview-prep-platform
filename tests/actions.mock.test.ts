import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

const revalidatePathMock = vi.fn();
const authMock = vi.fn();

const prismaMock = {
  interviewSession: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  interviewResponse: {
    upsert: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("mock answer actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("upserts an answer and marks the session completed when all questions are answered", async () => {
    prismaMock.interviewSession.findFirst.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      jobApplicationId: "app-1",
      questionSet: {
        questions: [
          { id: "q-1", prompt: "Tell me about yourself." },
          { id: "q-2", prompt: "Why this role?" },
        ],
      },
    });
    prismaMock.interviewResponse.count.mockResolvedValue(2);

    const { saveInterviewAnswerAction } = await import("@/actions/mock");
    const formData = new FormData();
    formData.set("sessionId", "session-1");
    formData.set("questionId", "q-2");
    formData.set("answer", "Because I enjoy product-focused engineering.");
    formData.set("returnPath", "/mock/session-1");

    await expect(saveInterviewAnswerAction(formData)).rejects.toThrow(
      "REDIRECT:/mock/session-1?savedQuestionId=q-2&message=Answer+saved.",
    );

    expect(prismaMock.interviewResponse.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          interviewSessionId_questionId: {
            interviewSessionId: "session-1",
            questionId: "q-2",
          },
        },
        update: {
          answer: "Because I enjoy product-focused engineering.",
        },
      }),
    );
    expect(prismaMock.interviewSession.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: { status: "completed" },
    });
  });
});
