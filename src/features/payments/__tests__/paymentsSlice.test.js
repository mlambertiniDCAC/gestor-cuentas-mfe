import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const get = vi.fn();
const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: {
    get: (...a) => get(...a),
    post: (...a) => post(...a),
    patch: vi.fn(),
  },
}));

const { default: paymentsReducer, selectSplitMovements } =
  await import("../store/paymentsSlice");
const {
  fetchMotivos,
  fetchMovements,
  createPayment,
  authorizePayment,
  cancelPayment,
} = await import("../store/paymentsActions");

const makeStore = () =>
  configureStore({ reducer: { payments: paymentsReducer } });

describe("payments store", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("loads the payment reasons", async () => {
    get.mockResolvedValueOnce({
      data: { code: 200, data: [{ codigo: "HON", descripcion: "Honorarios" }] },
    });
    const store = makeStore();
    await store.dispatch(fetchMotivos());
    expect(get).toHaveBeenCalledWith("/v1/motivos-pago");
    expect(store.getState().payments.motivos).toEqual([
      { codigo: "HON", descripcion: "Honorarios" },
    ]);
  });

  it("loads and splits the movements of an account", async () => {
    get.mockResolvedValueOnce({
      data: {
        code: 200,
        data: [
          {
            id: 1,
            monto: 10,
            tipo: "DEBITO",
            estado: "EN_PROGRESO",
            fechaCreacion: "2026-09-20T00:00:00Z",
          },
          {
            id: 2,
            monto: 20,
            tipo: "CREDITO",
            estado: "COMPLETADO",
            fechaCreacion: "2026-09-19T00:00:00Z",
          },
        ],
      },
    });
    const store = makeStore();
    await store.dispatch(fetchMovements(7));
    expect(get).toHaveBeenCalledWith("/v1/movimientos", {
      params: { cuentaCvuId: 7 },
    });
    const { pending, history } = selectSplitMovements(store.getState());
    expect(pending.map((m) => m.id)).toEqual([1]);
    expect(history.map((m) => m.id)).toEqual([2]);
  });

  it("creates a payment and returns the adapted result", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    const store = makeStore();
    const values = {
      destinoTipo: "alias",
      destino: "prov.alias",
      monto: "100",
      motivoPago: "HON",
      metodoDePago: "2",
      detalle: "",
      fechaProgramada: "",
      emails: "",
    };
    const result = await store.dispatch(
      createPayment({ values, cuentaCvuId: 7 })
    );
    expect(post).toHaveBeenCalledWith(
      "/v1/movimientos",
      expect.objectContaining({
        cuentaCvuId: 7,
        destino: { alias: "prov.alias" },
      })
    );
    expect(result.payload.movimientoId).toBe(9);
  });

  it("rejects with the API message", async () => {
    post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message:
            "La fecha programada debe ser hoy o posterior a la fecha actual.",
        },
      },
    });
    const store = makeStore();
    const values = {
      destinoTipo: "alias",
      destino: "prov.alias",
      monto: "100",
      motivoPago: "HON",
      metodoDePago: "2",
    };
    const result = await store.dispatch(
      createPayment({ values, cuentaCvuId: 7 })
    );
    expect(result.payload).toBe(
      "La fecha programada debe ser hoy o posterior a la fecha actual."
    );
  });

  it("authorizes and cancels by id", async () => {
    post.mockResolvedValue({ data: { code: 200, data: { message: "ok" } } });
    const store = makeStore();
    await store.dispatch(authorizePayment(9));
    await store.dispatch(cancelPayment(9));
    expect(post).toHaveBeenCalledWith("/v1/movimientos/9/autorizar");
    expect(post).toHaveBeenCalledWith("/v1/movimientos/9/cancelar");
  });

  it("stores the action error of a failed cancel", async () => {
    post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: "Solo se pueden cancelar movimientos en estado EN_PROGRESO.",
        },
      },
    });
    const store = makeStore();
    await store.dispatch(cancelPayment(9));
    expect(store.getState().payments.actionError).toBe(
      "Solo se pueden cancelar movimientos en estado EN_PROGRESO."
    );
  });
});
