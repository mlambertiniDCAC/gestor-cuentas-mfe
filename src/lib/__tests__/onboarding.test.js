import { describe, it, expect, vi } from "vitest";
import { openOnboarding } from "../onboarding";

describe("openOnboarding", () => {
  it("opens onboarding in a new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    openOnboarding();
    expect(openSpy).toHaveBeenCalledWith(
      expect.any(String),
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });
});
