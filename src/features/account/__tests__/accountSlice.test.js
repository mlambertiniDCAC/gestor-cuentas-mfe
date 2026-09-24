import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

const get = vi.fn();
const patch = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: {
    get: (...a) => get(...a),
    patch: (...a) => patch(...a),
    post: vi.fn(),
  },
}));

const {
  default: accountReducer,
  selectAccount,
  selectSelectedAccount,
} = await import("../store/accountSlice");
const { fetchMyAccounts, updateAlias } =
  await import("../store/accountActions");
const { default: authReducer } = await import("../../auth/authSlice");

const rawAccount = (id, situacion) => ({
  id,
  cuenta_id_externo: `ext-${id}`,
  cuit: "20445609103",
  cvu: `00000031000000000000${String(id).padStart(2, "0")}`,
  currency: "ARS",
  situacion_cuenta: situacion,
  alias_activo: {
    value: `alias.${id}`,
    freeze: false,
    habilitado_dia: null,
    habilitado_hora: null,
  },
  saldo: 100,
});

const makeStore = () =>
  configureStore({
    reducer: combineReducers({ auth: authReducer, account: accountReducer }),
  });

describe("account store", () => {
  beforeEach(() => {
    get.mockReset();
    patch.mockReset();
  });

  it("loads my accounts and selects the active one", async () => {
    get.mockResolvedValueOnce({
      data: {
        code: 200,
        data: [rawAccount(1, "EN_PROCESO"), rawAccount(2, "ACTIVA")],
      },
    });
    const store = makeStore();
    await store.dispatch(fetchMyAccounts());
    expect(get).toHaveBeenCalledWith("/v1/cuentas/me");
    expect(store.getState().account.status).toBe("succeeded");
    expect(selectSelectedAccount(store.getState()).cuentaIdExterno).toBe(
      "ext-2"
    );
  });

  it("keeps the manual selection across reloads", async () => {
    get.mockResolvedValue({
      data: {
        code: 200,
        data: [rawAccount(1, "ACTIVA"), rawAccount(2, "ACTIVA")],
      },
    });
    const store = makeStore();
    await store.dispatch(fetchMyAccounts());
    store.dispatch(selectAccount("ext-2"));
    await store.dispatch(fetchMyAccounts());
    expect(selectSelectedAccount(store.getState()).cuentaIdExterno).toBe(
      "ext-2"
    );
  });

  it("switches the session to onboarding on the scope 403", async () => {
    get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: "la sesión todavía está en onboarding" },
      },
    });
    const store = makeStore();
    await store.dispatch(fetchMyAccounts());
    expect(store.getState().account.status).toBe("failed");
    expect(store.getState().auth.scope).toBe("onboarding");
  });

  it("updates the alias", async () => {
    patch.mockResolvedValueOnce({
      data: { code: 200, data: { success: true } },
    });
    const store = makeStore();
    const result = await store.dispatch(
      updateAlias({ cuentaIdExterno: "ext-1", alias: "nuevo.alias" })
    );
    expect(patch).toHaveBeenCalledWith("/v1/cuentas/ext-1/alias", {
      alias: "nuevo.alias",
    });
    expect(updateAlias.fulfilled.match(result)).toBe(true);
    expect(store.getState().account.aliasStatus).toBe("idle");
  });

  it("stores the alias error", async () => {
    patch.mockRejectedValueOnce({
      response: { status: 400, data: { message: "alias en uso" } },
    });
    const store = makeStore();
    await store.dispatch(
      updateAlias({ cuentaIdExterno: "ext-1", alias: "nuevo.alias" })
    );
    expect(store.getState().account).toMatchObject({
      aliasStatus: "failed",
      aliasError: "alias en uso",
    });
  });
});
