import { describe, it, expect } from "vitest";
import reducer from "../paymentsSlice";
import { fetchMovements } from "../paymentsActions";

describe("paymentsSlice fetchMovements race condition", () => {
  it("ignora la respuesta de un fetch anterior si ya se pidió otra cuenta", () => {
    let state = reducer(undefined, { type: "@@INIT" });

    state = reducer(state, {
      type: fetchMovements.pending.type,
      meta: { arg: 7 },
    });
    state = reducer(state, {
      type: fetchMovements.pending.type,
      meta: { arg: 8 },
    });

    state = reducer(state, {
      type: fetchMovements.fulfilled.type,
      meta: { arg: 8 },
      payload: [{ id: "m8" }],
    });
    state = reducer(state, {
      type: fetchMovements.fulfilled.type,
      meta: { arg: 7 },
      payload: [{ id: "m7" }],
    });

    expect(state.movements).toEqual([{ id: "m8" }]);
  });

  it("ignora un rejected de un fetch anterior", () => {
    let state = reducer(undefined, { type: "@@INIT" });

    state = reducer(state, {
      type: fetchMovements.pending.type,
      meta: { arg: 7 },
    });
    state = reducer(state, {
      type: fetchMovements.pending.type,
      meta: { arg: 8 },
    });
    state = reducer(state, {
      type: fetchMovements.fulfilled.type,
      meta: { arg: 8 },
      payload: [{ id: "m8" }],
    });
    state = reducer(state, {
      type: fetchMovements.rejected.type,
      meta: { arg: 7 },
      payload: { message: "boom" },
    });

    expect(state.status).toBe("succeeded");
    expect(state.error).toBeNull();
    expect(state.movements).toEqual([{ id: "m8" }]);
  });
});
