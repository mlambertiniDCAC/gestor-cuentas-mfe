import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";

const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: { post: (...a) => post(...a) },
}));

const { default: authReducer } = await import("../authSlice");
const { default: LoginPage } = await import("../LoginPage");

const renderPage = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <LoginPage />
      </ThemeProvider>
    </Provider>
  );
  return store;
};

describe("LoginPage", () => {
  it("logs in with mail and password", async () => {
    post.mockResolvedValueOnce({
      data: { token: "tok", scope: "usuario", sujetos: [] },
    });
    const store = renderPage();
    fireEvent.change(screen.getByLabelText("Mail"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    await waitFor(() => expect(store.getState().auth.token).toBe("tok"));
  });

  it("redirects to onboarding when the mail has no PSP identity", async () => {
    const assignSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    });
    post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "no existe una cuenta PSP para ese mail" },
      },
    });
    const store = renderPage();
    fireEvent.change(screen.getByLabelText("Mail"), {
      target: { value: "nuevo@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    await waitFor(() => expect(assignSpy).toHaveBeenCalledTimes(1));
    expect(store.getState().auth.token).toBeNull();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("does not redirect on wrong password", async () => {
    const assignSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    });
    post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "mail o contraseña incorrectos" },
      },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText("Mail"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(
      await screen.findByText("mail o contraseña incorrectos")
    ).toBeTruthy();
    expect(assignSpy).not.toHaveBeenCalled();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("shows the API error", async () => {
    post.mockRejectedValueOnce({
      response: { status: 401, data: { message: "credenciales inválidas" } },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText("Mail"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByText("credenciales inválidas")).toBeTruthy();
  });
});
