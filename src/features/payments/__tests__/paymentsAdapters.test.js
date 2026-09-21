import { describe, it, expect } from "vitest";
import {
  adaptMovement,
  splitMovements,
  adaptCreateResult,
  buildCreatePayload,
} from "../store/paymentsAdapters";

const raw = (overrides) => ({
  id: 1,
  cuentaCvuId: 7,
  movimientoPadreId: null,
  monto: 1500,
  tipo: "DEBITO",
  motivo: "TRANSFERENCIA",
  detalle: "Honorarios",
  fechaCreacion: "2026-09-20T13:00:00.000Z",
  fechaEjecucion: null,
  estado: "COMPLETADO",
  transferenciaDetalle: {
    cuentaDestinoAlias: "prov.alias",
    cuentaDestinoCvu: null,
  },
  ...overrides,
});

describe("paymentsAdapters", () => {
  it("adapts a debit", () => {
    expect(adaptMovement(raw())).toMatchObject({
      id: 1,
      esHijo: false,
      esCredito: false,
      montoFormateado: "- $ 1.500,00",
      contraparte: "prov.alias",
      estado: "COMPLETADO",
      fechaTexto: "20/09/2026",
    });
  });

  it("adapts a credit without transfer detail", () => {
    expect(
      adaptMovement(raw({ tipo: "CREDITO", transferenciaDetalle: null }))
    ).toMatchObject({
      esCredito: true,
      montoFormateado: "+ $ 1.500,00",
      contraparte: "",
    });
  });

  it("splits pending, scheduled and history", () => {
    const movements = [
      raw({ id: 1, estado: "EN_PROGRESO" }),
      raw({ id: 2, estado: "EN_PROGRESO", movimientoPadreId: 1 }),
      raw({
        id: 3,
        estado: "PROGRAMADO",
        fechaEjecucion: "2026-10-01T00:00:00.000Z",
      }),
      raw({
        id: 4,
        estado: "COMPLETADO",
        fechaCreacion: "2026-09-01T00:00:00.000Z",
      }),
      raw({
        id: 5,
        estado: "FALLIDO",
        fechaCreacion: "2026-09-10T00:00:00.000Z",
      }),
    ].map(adaptMovement);
    const { pending, scheduled, history } = splitMovements(movements);
    expect(pending.map((m) => m.id)).toEqual([1]);
    expect(scheduled.map((m) => m.id)).toEqual([3]);
    expect(history.map((m) => m.id)).toEqual([5, 4]);
  });

  it("adapts the create result", () => {
    expect(
      adaptCreateResult({
        movimientoId: 9,
        montoTransferencia: 100,
        montoRetencion: 2.5,
        montoTotal: 102.5,
      })
    ).toMatchObject({
      movimientoId: 9,
      montoRetencionTexto: "$ 2,50",
      montoTotalTexto: "$ 102,50",
    });
  });

  it("builds the create payload with alias", () => {
    expect(
      buildCreatePayload(
        {
          destinoTipo: "alias",
          destino: " prov.alias ",
          monto: "100.5",
          motivoPago: "HON",
          metodoDePago: "2",
          detalle: "",
          fechaProgramada: "2026-10-01",
          emails: "a@b.com, c@d.com",
        },
        7
      )
    ).toEqual({
      cuentaCvuId: 7,
      monto: 100.5,
      destino: { alias: "prov.alias" },
      motivo: "TRANSFERENCIA",
      metodoDePago: 2,
      motivoPago: "HON",
      fechaProgramada: "2026-10-01",
      emails: ["a@b.com", "c@d.com"],
    });
  });

  it("builds the create payload with cbu and no optionals", () => {
    expect(
      buildCreatePayload(
        {
          destinoTipo: "cbu",
          destino: "0140999703000000000001",
          monto: "10",
          motivoPago: "VAR",
          metodoDePago: "1",
          detalle: "x",
          fechaProgramada: "",
          emails: "",
        },
        7
      )
    ).toEqual({
      cuentaCvuId: 7,
      monto: 10,
      destino: { cbu: "0140999703000000000001" },
      motivo: "TRANSFERENCIA",
      metodoDePago: 1,
      motivoPago: "VAR",
      detalle: "x",
    });
  });
});
