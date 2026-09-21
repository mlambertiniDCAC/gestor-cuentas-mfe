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
