import { describe, it, expect } from "vitest";
import {
  buildPaymentSchema,
  PAYMENT_INITIAL_VALUES,
  isFutureDate,
} from "../lib/paymentSchema";

const today = new Date(Date.UTC(2026, 8, 21, 12));
const valid = {
  ...PAYMENT_INITIAL_VALUES,
  destinoTipo: "alias",
  destino: "prov.alias",
  monto: "100",
  motivoPago: "HON",
  metodoDePago: "2",
};
const check = (overrides) =>
  buildPaymentSchema().isValidSync({ ...valid, ...overrides });

describe("paymentSchema", () => {
  it("accepts a valid immediate payment", () => {
    expect(check({})).toBe(true);
  });

  it("validates the destination by type", () => {
    expect(
      check({ destinoTipo: "cbu", destino: "0140999703000000000001" })
    ).toBe(true);
    expect(check({ destinoTipo: "cbu", destino: "123" })).toBe(false);
    expect(check({ destinoTipo: "alias", destino: "a b" })).toBe(false);
  });

  it("requires a positive amount", () => {
    expect(check({ monto: "0" })).toBe(false);
    expect(check({ monto: "" })).toBe(false);
  });

  it("acepta cualquier fecha: la pasada no se envía, no se rechaza", () => {
    expect(check({ fechaProgramada: "2026-09-20" })).toBe(true);
    expect(check({ fechaProgramada: "2026-09-21" })).toBe(true);
    expect(check({ fechaProgramada: "2026-09-30" })).toBe(true);
  });

  it("validates notification emails", () => {
    expect(check({ emails: "a@b.com, c@d.com" })).toBe(true);
    expect(check({ emails: "a@b.com, nope" })).toBe(false);
  });

  it("detects future dates", () => {
    expect(isFutureDate("2026-09-22", today)).toBe(true);
    expect(isFutureDate("2026-09-21", today)).toBe(false);
    expect(isFutureDate("", today)).toBe(false);
  });

  it("usa el día UTC como referencia, no el local (21/09 22:00 ART)", () => {
    const lateNightUtc = new Date(Date.UTC(2026, 8, 22, 1));
    expect(isFutureDate("2026-09-22", lateNightUtc)).toBe(false);
    expect(isFutureDate("2026-09-23", lateNightUtc)).toBe(true);
  });
});
