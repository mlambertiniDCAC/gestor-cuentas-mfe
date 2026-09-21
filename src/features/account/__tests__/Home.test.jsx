import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";

const get = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: { get: (...a) => get(...a), post: vi.fn(), patch: vi.fn() },
}));

const { rootReducer } = await import("../../../store/store");
const { default: Home } = await import("../pages/Home");

const rawAccount = (id, alias) => ({
  id,
  cuenta_id_externo: `ext-${id}`,
  cuit: "20445609103",
  cvu: `00000031000000000000${String(id).padStart(2, "0")}`,
  currency: "ARS",
  situacion_cuenta: "ACTIVA",
  alias_activo: {
    value: alias,
    freeze: false,
    habilitado_dia: null,
    habilitado_hora: null,
  },
  saldo: "1500",
});

const renderHome = () => {
  const store = configureStore({ reducer: rootReducer });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <Home />
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

describe("Home", () => {
  beforeEach(() => get.mockReset());

  it("shows the activation CTA without accounts", async () => {
    get.mockResolvedValueOnce({ data: { code: 200, data: [] } });
    renderHome();
    expect(await screen.findByText("Activar cuenta CVU")).toBeTruthy();
  });

  it("opens onboarding in a new tab from the activation CTA", async () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    get.mockResolvedValueOnce({ data: { code: 200, data: [] } });
    renderHome();
    fireEvent.click(await screen.findByText("Activar cuenta CVU"));
    expect(openSpy).toHaveBeenCalledWith(
      expect.any(String),
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });

  it("shows the wallet with balance, CVU and alias", async () => {
    get.mockResolvedValueOnce({
      data: { code: 200, data: [rawAccount(1, "mi.alias")] },
    });
    renderHome();
    expect(await screen.findByText("$ 1.500,00")).toBeTruthy();
    expect(screen.getByText("0000003100000000000001")).toBeTruthy();
    expect(screen.getByText("mi.alias")).toBeTruthy();
    expect(screen.queryByLabelText("Cuenta")).toBeNull();
  });

  it("hides the balance on demand", async () => {
    get.mockResolvedValueOnce({
      data: { code: 200, data: [rawAccount(1, "mi.alias")] },
    });
    renderHome();
    await screen.findByText("$ 1.500,00");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar saldo" }));
    expect(screen.getByText("$ ••••••")).toBeTruthy();
  });

  it("shows the selector with more than one account", async () => {
    get.mockResolvedValueOnce({
      data: {
        code: 200,
        data: [rawAccount(1, "uno.alias"), rawAccount(2, "dos.alias")],
      },
    });
    const store = renderHome();
    const select = await screen.findByLabelText("Cuenta");
    fireEvent.change(select, { target: { value: "ext-2" } });
    expect(store.getState().account.selectedId).toBe("ext-2");
  });

  it("offers a retry on errors", async () => {
    get.mockRejectedValueOnce({ response: { status: 500, data: {} } });
    get.mockResolvedValueOnce({ data: { code: 200, data: [] } });
    renderHome();
    fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Activar cuenta CVU")).toBeTruthy();
  });
});
