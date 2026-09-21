import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "../store";
import { login, logout } from "../../features/auth/authSlice";

const buildStoreWithData = () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch({
    type: "account/fetchMine/fulfilled",
    payload: [{ cuentaIdExterno: 1 }],
  });
  store.dispatch({
    type: "payments/fetchMovements/fulfilled",
    payload: [{ id: 1 }],
    meta: { arg: undefined },
  });
  return store;
};

describe("rootReducer", () => {
  it("resetea account y payments a su estado inicial en logout.fulfilled", () => {
    const store = buildStoreWithData();
    expect(store.getState().account.items).toHaveLength(1);
    expect(store.getState().payments.movements).toHaveLength(1);

    store.dispatch({ type: logout.fulfilled.type });

    expect(store.getState().account.items).toEqual([]);
    expect(store.getState().payments.movements).toEqual([]);
  });

  it("resetea account y payments a su estado inicial en login.fulfilled", () => {
    const store = buildStoreWithData();

    store.dispatch({
      type: login.fulfilled.type,
      payload: { token: "t", scope: "usuario", sujetos: [] },
    });

    expect(store.getState().account.items).toEqual([]);
    expect(store.getState().payments.movements).toEqual([]);
    expect(store.getState().auth.token).toBe("t");
    expect(store.getState().auth.scope).toBe("usuario");
  });
});
