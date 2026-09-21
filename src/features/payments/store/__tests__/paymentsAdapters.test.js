import { describe, it, expect } from "vitest";
import { adaptMovement } from "../paymentsAdapters";

describe("adaptMovement", () => {
  it("usa el alias/cvu de la contraparte cuando existe", () => {
    const movimiento = adaptMovement({
      id: 1,
      tipo: "DEBITO",
      monto: "100",
      movimientoPadreId: null,
      transferenciaDetalle: { cuentaDestinoAlias: "prov.alias" },
    });

    expect(movimiento.contraparte).toBe("prov.alias");
  });

  it("marca 'Retención impositiva' en filas hijas sin contraparte", () => {
    const movimiento = adaptMovement({
      id: 2,
      tipo: "DEBITO",
      monto: "10",
      movimientoPadreId: 1,
      transferenciaDetalle: null,
    });

    expect(movimiento.esHijo).toBe(true);
    expect(movimiento.contraparte).toBe("Retención impositiva");
  });

  it("no aplica el fallback a filas que no son hijas", () => {
    const movimiento = adaptMovement({
      id: 3,
      tipo: "DEBITO",
      monto: "10",
      movimientoPadreId: null,
      transferenciaDetalle: null,
    });

    expect(movimiento.esHijo).toBe(false);
    expect(movimiento.contraparte).toBe("");
  });
});
