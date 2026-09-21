import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";

const get = vi.fn();
const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: {
    get: (...a) => get(...a),
    post: (...a) => post(...a),
    patch: vi.fn(),
  },
}));

const { rootReducer } = await import("../../../store/store");
const { default: Payments } = await import("../pages/Payments");

const account = {
  id: 7,
  cuenta_id_externo: "ext-7",
  cvu: "0000003100000000000007",
  situacion_cuenta: "ACTIVA",
  alias_activo: { value: "mi.alias", freeze: false },
  saldo: 1000,
};

const movements = [
  {
    id: 1,
    monto: 100,
    tipo: "DEBITO",
    estado: "EN_PROGRESO",
    detalle: "Pendiente uno",
    fechaCreacion: "2026-09-20T00:00:00Z",
    transferenciaDetalle: { cuentaDestinoAlias: "prov.alias" },
  },
  {
    id: 2,
    monto: 200,
    tipo: "DEBITO",
    estado: "PROGRAMADO",
    detalle: "Programado dos",
    fechaCreacion: "2026-09-19T00:00:00Z",
    fechaEjecucion: "2026-10-01T12:00:00Z",
  },
  {
    id: 3,
    monto: 300,
    tipo: "CREDITO",
    estado: "COMPLETADO",
    detalle: "Ingreso tres",
    fechaCreacion: "2026-09-18T00:00:00Z",
  },
];

const renderPage = () => {
  const store = configureStore({ reducer: rootReducer });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <Payments />
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

describe("Payments page", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockImplementation((url) =>
      Promise.resolve(
        url === "/v1/cuentas/me"
          ? { data: { code: 200, data: [account] } }
          : { data: { code: 200, data: movements } }
      )
    );
  });

  it("lists pending payments by default", async () => {
    renderPage();
    expect(await screen.findByText("Pendiente uno")).toBeTruthy();
    expect(screen.queryByText("Ingreso tres")).toBeNull();
    expect(get).toHaveBeenCalledWith("/v1/movimientos", {
      params: { cuentaCvuId: 7 },
    });
  });

  it("shows scheduled payments without actions", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("tab", { name: /Programados/ }));
    expect(screen.getByText("Programado dos")).toBeTruthy();
    expect(screen.getByText("01/10/2026")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull();
  });

  it("shows credits in the history", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("tab", { name: /Historial/ }));
    expect(screen.getByText("Ingreso tres")).toBeTruthy();
    expect(screen.getByText("+ $ 300,00")).toBeTruthy();
    expect(screen.getByText("Completado")).toBeTruthy();
  });

  it("authorizes a pending payment and reloads", async () => {
    post.mockResolvedValueOnce({ data: { code: 200, data: {} } });
    renderPage();
    await screen.findByText("Pendiente uno");
    const callsBefore = get.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Autorizar" }));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/v1/movimientos/1/autorizar")
    );
    await waitFor(() =>
      expect(get.mock.calls.length).toBeGreaterThan(callsBefore)
    );
  });

  it("shows the error of a failed cancel", async () => {
    post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: "Solo se pueden cancelar movimientos en estado EN_PROGRESO.",
        },
      },
    });
    renderPage();
    await screen.findByText("Pendiente uno");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(
      await screen.findByText(
        "Solo se pueden cancelar movimientos en estado EN_PROGRESO."
      )
    ).toBeTruthy();
  });
});
