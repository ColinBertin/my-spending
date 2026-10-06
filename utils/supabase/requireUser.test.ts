import { describe, expect, it, vi } from "vitest";
import { requirePageUser, requireUser } from "./requireUser";

const getUserMock = vi.fn();
const supabaseMock = { auth: { getUser: getUserMock } };

vi.mock("./server", () => ({
  createClient: async () => supabaseMock,
}));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe("requireUser", () => {
  it("returns the user and client when authenticated", async () => {
    const user = { id: "user-1" };
    getUserMock.mockResolvedValue({ data: { user } });

    const result = await requireUser();

    expect(result).toEqual({ ok: true, user, supabase: supabaseMock });
  });

  it("returns a 401 JSON response when there is no user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const result = await requireUser();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toEqual({
        error: "Unauthorized",
      });
    }
  });
});

describe("requirePageUser", () => {
  it("returns the user and client when authenticated", async () => {
    const user = { id: "user-1" };
    getUserMock.mockResolvedValue({ data: { user } });

    await expect(requirePageUser()).resolves.toEqual({
      user,
      supabase: supabaseMock,
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    await expect(requirePageUser()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
