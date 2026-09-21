import { describe, it, expect } from "vitest";
import {
  adaptAccount,
  adaptAccounts,
  pickDefaultAccountId,
} from "../store/accountAdapters";

const raw = {
  id: 7,
  cuenta_id_externo: "ext-7",
  client_id: 38,
  cuit: "20445609103",
  cvu: "0000003100000000000007",
  currency: "ARS",
  situacion_cuenta: "ACTIVA",
  origen: "PSP",
  version: 3,
  alias_activo: {
    value: "mi.alias",
    freeze: true,
    habilitado_dia: "2026-09-24",
    habilitado_hora: "15:30",
  },
  saldo: "1234.5",
  fecha_creacion: "2026-09-01T00:00:00.000Z",
};

describe("accountAdapters", () => {
  it("maps the ms-psp summary account", () => {
    const account = adaptAccount(raw);
    expect(account).toMatchObject({
      id: 7,
      cuentaIdExterno: "ext-7",
      cvu: "0000003100000000000007",
      situacionCuenta: "ACTIVA",
      alias: "mi.alias",
      aliasFreeze: true,
      saldo: 1234.5,
      saldoFormateado: "1.234,50",
    });
    expect(account.aliasHabilitadoTexto).toMatch(
      /^\d{2}\/\d{2}\/2026 a las \d{2}:\d{2}$/
    );
  });

  it("tolerates missing alias and saldo", () => {
    const account = adaptAccount({ ...raw, alias_activo: null, saldo: null });
    expect(account).toMatchObject({
      alias: "",
      aliasFreeze: false,
      aliasHabilitadoTexto: null,
      saldo: 0,
      saldoFormateado: "0,00",
    });
  });

  it("returns an empty list for non arrays", () => {
    expect(adaptAccounts(null)).toEqual([]);
  });

  it("prefers the active account as default", () => {
    const accounts = adaptAccounts([
      { ...raw, cuenta_id_externo: "a", situacion_cuenta: "EN_PROCESO" },
      { ...raw, cuenta_id_externo: "b", situacion_cuenta: "ACTIVA" },
    ]);
    expect(pickDefaultAccountId(accounts)).toBe("b");
    expect(pickDefaultAccountId([])).toBeNull();
  });
});
