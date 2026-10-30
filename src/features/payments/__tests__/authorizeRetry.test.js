import { describe, it, expect, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  AUTHORIZE_REJECTED_MESSAGE,
  PERMISSION_MESSAGES,
} from "src/lib/apiError";

const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: { get: vi.fn(), post: (...a) => post(...a), patch: vi.fn() },
}));

const { default: paymentsReducer } = await import("../store/paymentsSlice");
const { authorizePayment } = await import("../store/paymentsActions");

const makeStore = () =>
  configureStore({ reducer: { payments: paymentsReducer } });

const forbidden = () => ({
  response: {
    status: 403,
    data: {
      error: { code: 403, message: "x", motivo: "USUARIO_SIN_PERMISO" },
    },
  },
});

describe("authorize retry of a rejected payment", () => {
  it("shows the permission text first and the retry text after", async () => {
    post.mockImplementation(() => Promise.reject(forbidden()));
    const store = makeStore();

    await store.dispatch(authorizePayment(5));
    expect(store.getState().payments.actionError).toBe(
      PERMISSION_MESSAGES.USUARIO_SIN_PERMISO
    );
    expect(store.getState().payments.permissionRejected[5]).toBe(
      "USUARIO_SIN_PERMISO"
    );

    await store.dispatch(authorizePayment(5));
    expect(store.getState().payments.actionError).toBe(
      AUTHORIZE_REJECTED_MESSAGE
    );
  });
});
