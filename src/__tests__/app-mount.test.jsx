import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("../lib/axiosInstance", () => ({
  default: {
    get: async () => ({ data: { code: 200, data: [] } }),
    post: async () => ({ data: {} }),
    patch: async () => ({ data: {} }),
  },
}));

const { rootReducer } = await import("../store/store");
const { default: App } = await import("../App");

const renderWith = (auth) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: auth ? { auth } : undefined,
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

const session = (scope) => ({
  token: "t",
  scope,
  sujetoId: "1",
  status: "idle",
  error: null,
});

describe("App mount", () => {
  it("shows the login without session", () => {
    renderWith(null);
    expect(screen.getByLabelText("Contraseña")).toBeTruthy();
  });

  it("shows the onboarding notice for an onboarding session", () => {
    renderWith(session("onboarding"));
    expect(
      screen.getByText("Tu cuenta todavía está en proceso de alta")
    ).toBeTruthy();
  });

  it("shows the header for a user session", () => {
    renderWith(session("usuario"));
    expect(screen.getByRole("link", { name: "Pagos" })).toBeTruthy();
  });
});
