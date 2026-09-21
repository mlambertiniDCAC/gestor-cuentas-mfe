import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";

vi.mock("../../../lib/axiosInstance", () => ({
  default: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

const { default: authReducer } = await import("../authSlice");
const { default: OnboardingPendingPage } =
  await import("../OnboardingPendingPage");

describe("OnboardingPendingPage", () => {
  it("opens onboarding in a new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <ThemeProvider theme={lightTheme}>
          <OnboardingPendingPage />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Completar alta" }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.any(String),
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });
});
