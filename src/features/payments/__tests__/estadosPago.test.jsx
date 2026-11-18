import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

const { default: StatusBadge } = await import("../components/StatusBadge");
const { splitMovements, adaptMovement } =
  await import("../store/paymentsAdapters");
const { default: paymentsReducer } = await import("../store/paymentsSlice");
const { fetchMovements } = await import("../store/paymentsActions");

const renderBadge = (estado) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <StatusBadge estado={estado} />
    </ThemeProvider>
  );

const movimiento = (id, estado) =>
  adaptMovement({
    id,
    cuentaCvuId: 7,
    movimientoPadreId: null,
    monto: 100,
    tipo: "DEBITO",
    estado,
    fechaCreacion: "2026-09-20T00:00:00.000Z",
  });

const idsPorEstado = (estados) => {
  const movimientos = estados.map((estado, i) => movimiento(i + 1, estado));
  const { pending, scheduled, history } = splitMovements(movimientos);
  const estadosDe = (lista) => lista.map((m) => m.estado).sort();
  return {
    pending: estadosDe(pending),
    scheduled: estadosDe(scheduled),
    history: estadosDe(history),
  };
};

describe("estados del pago en el front", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("FR-1 muestra los textos con los valores nuevos", () => {
    const textos = {
      PENDIENTE_AUTORIZACION: "Pendiente de autorización",
      PROGRAMADO: "Programado",
      ENVIADO: "Iniciado",
      REALIZADO: "Completado",
      RECHAZADO: "Fallido",
      CANCELADO: "Cancelado",
    };
    Object.entries(textos).forEach(([estado, texto]) => {
      const { unmount } = renderBadge(estado);
      expect(screen.getByText(texto)).toBeTruthy();
      expect(screen.queryByText(estado)).toBeNull();
      unmount();
    });
  });

  it("FR-2 muestra los mismos textos con los valores viejos", () => {
    const textos = {
      EN_PROGRESO: "Pendiente de autorización",
      INICIADO: "Iniciado",
      COMPLETADO: "Completado",
      FALLIDO: "Fallido",
    };
    Object.entries(textos).forEach(([estado, texto]) => {
      const { unmount } = renderBadge(estado);
      expect(screen.getByText(texto)).toBeTruthy();
      unmount();
    });
  });

  it("FR-3 clasifica los estados nuevos", () => {
    expect(
      idsPorEstado([
        "PENDIENTE_AUTORIZACION",
        "PROGRAMADO",
        "ENVIADO",
        "REALIZADO",
        "RECHAZADO",
        "CANCELADO",
      ])
    ).toEqual({
      pending: ["PENDIENTE_AUTORIZACION"],
      scheduled: ["PROGRAMADO"],
      history: ["CANCELADO", "ENVIADO", "REALIZADO", "RECHAZADO"],
    });
  });

  it("FR-4 clasifica los estados viejos", () => {
    expect(
      idsPorEstado([
        "EN_PROGRESO",
        "PROGRAMADO",
        "INICIADO",
        "COMPLETADO",
        "FALLIDO",
        "CANCELADO",
      ])
    ).toEqual({
      pending: ["EN_PROGRESO"],
      scheduled: ["PROGRAMADO"],
      history: ["CANCELADO", "COMPLETADO", "FALLIDO", "INICIADO"],
    });
  });

  it("FR-5 el rechazo por permisos sigue a los pendientes nuevos", async () => {
    const store = configureStore({
      reducer: { payments: paymentsReducer },
      preloadedState: {
        payments: {
          ...paymentsReducer(undefined, { type: "init" }),
          lastRequestedCuentaCvuId: 7,
          permissionRejected: { 1: "SIN_PERMISO" },
        },
      },
    });
    const respuesta = (estado) => ({
      data: {
        code: 200,
        data: [
          {
            id: 1,
            monto: 10,
            tipo: "DEBITO",
            estado,
            fechaCreacion: "2026-09-20T00:00:00Z",
          },
        ],
      },
    });

    get.mockResolvedValueOnce(respuesta("PENDIENTE_AUTORIZACION"));
    await store.dispatch(fetchMovements(7));
    expect(store.getState().payments.permissionRejected).toHaveProperty("1");

    get.mockResolvedValueOnce(respuesta("ENVIADO"));
    await store.dispatch(fetchMovements(7));
    expect(store.getState().payments.permissionRejected).not.toHaveProperty(
      "1"
    );
  });
});
