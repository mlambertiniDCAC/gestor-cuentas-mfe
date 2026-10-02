import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: { post: (...a) => post(...a) },
}));

const storage = {
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clear: vi.fn(),
};
vi.mock("../../../lib/authStorage", () => ({ authStorage: storage }));

const { default: authReducer, login, logout } = await import("../authSlice");
const { fetchMyAccounts } = await import("../../account/store/accountActions");

const makeStore = () => configureStore({ reducer: { auth: authReducer } });

describe("authSlice", () => {
  beforeEach(() => {
    post.mockReset();
    Object.values(storage).forEach((fn) => fn.mockClear());
  });

  it("stores only the token after a successful login", async () => {
    post.mockResolvedValueOnce({ data: { token: "tok" } });
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    expect(post).toHaveBeenCalledWith("/v1/auth/login", {
      mail: "a@b.com",
      password: "x",
    });
    expect(store.getState().auth).toMatchObject({
      token: "tok",
      onboardingPendiente: false,
      status: "idle",
      error: null,
    });
    expect(storage.setToken).toHaveBeenCalledWith("tok");
  });

  it("ignores scope and sujetos if the API still sends them", async () => {
    post.mockResolvedValueOnce({
      data: {
        token: "tok",
        scope: "onboarding",
        sujetos: [{ sujetoId: "38", estado: "en_progreso" }],
      },
    });
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    const { auth } = store.getState();
    expect(auth.token).toBe("tok");
    expect(auth.onboardingPendiente).toBe(false);
    expect(auth).not.toHaveProperty("scope");
    expect(auth).not.toHaveProperty("sujetoId");
  });

  it("exposes the API message when login fails", async () => {
    post.mockRejectedValueOnce({
      response: { status: 401, data: { message: "credenciales inválidas" } },
    });
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    expect(store.getState().auth).toMatchObject({
      token: null,
      status: "failed",
      error: "credenciales inválidas",
    });
  });

  it("clears the session on logout even if the API fails", async () => {
    post.mockResolvedValueOnce({
      data: { token: "tok" },
    });
    post.mockRejectedValueOnce(new Error("down"));
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    await store.dispatch(logout());
    expect(store.getState().auth.token).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });

  it("marks onboarding as pending on the onboarding 403 and clears it on logout", async () => {
    post.mockResolvedValueOnce(undefined);
    const store = makeStore();
    store.dispatch({
      type: fetchMyAccounts.rejected.type,
      payload: { onboarding: true },
    });
    expect(store.getState().auth.onboardingPendiente).toBe(true);
    await store.dispatch(logout());
    expect(store.getState().auth.onboardingPendiente).toBe(false);
  });

  it("does not mark onboarding on other account errors", () => {
    const store = makeStore();
    store.dispatch({
      type: fetchMyAccounts.rejected.type,
      payload: { message: "error" },
    });
    expect(store.getState().auth.onboardingPendiente).toBe(false);
  });
});
