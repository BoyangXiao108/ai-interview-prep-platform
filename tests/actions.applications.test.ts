import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

const revalidatePathMock = vi.fn();

const prismaMock = {
  jobApplication: {
    create: vi.fn(),
  },
};

const authMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

describe("application actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("creates an application and redirects with success feedback", async () => {
    const { createApplicationAction } = await import("@/actions/applications");
    const formData = new FormData();
    formData.set("company", "OpenAI");
    formData.set("roleTitle", "Frontend Engineer");
    formData.set("location", "Remote");
    formData.set("status", "APPLIED");

    await expect(createApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/applications?message=Application%20created%20successfully.",
    );

    expect(prismaMock.jobApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          company: "OpenAI",
          roleTitle: "Frontend Engineer",
          location: "Remote",
          status: "APPLIED",
        }),
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/applications");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });
});
