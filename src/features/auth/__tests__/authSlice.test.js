import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: { post: (...a) => post(...a) },
}));

const storage = {
  getToken: vi.fn(() => null),
  getSujetoId: vi.fn(() => null),
  getScope: vi.fn(() => null),
  setToken: vi.fn(),
  setSujetoId: vi.fn(),
  setScope: vi.fn(),
  clear: vi.fn(),
};
vi.mock("../../../lib/authStorage", () => ({ authStorage: storage }));

const {
  default: authReducer,
  login,
  logout,
  markOnboarding,
} = await import("../authSlice");

const makeStore = () => configureStore({ reducer: { auth: authReducer } });

describe("authSlice", () => {
  beforeEach(() => {
    post.mockReset();
    Object.values(storage).forEach((fn) => fn.mockClear());
  });

  it("stores the session after a successful login", async () => {
    post.mockResolvedValueOnce({
      data: {
        token: "tok",
        scope: "usuario",
        sujetos: [{ sujetoId: "38", estado: "aprobado" }],
      },
    });
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    expect(post).toHaveBeenCalledWith("/v1/auth/login", {
      mail: "a@b.com",
      password: "x",
    });
    expect(store.getState().auth).toMatchObject({
      token: "tok",
      scope: "usuario",
      sujetoId: "38",
      status: "idle",
      error: null,
    });
    expect(storage.setToken).toHaveBeenCalledWith("tok");
    expect(storage.setScope).toHaveBeenCalledWith("usuario");
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
      data: { token: "tok", scope: "usuario", sujetos: [] },
    });
    post.mockRejectedValueOnce(new Error("down"));
    const store = makeStore();
    await store.dispatch(login({ mail: "a@b.com", password: "x" }));
    await store.dispatch(logout());
    expect(store.getState().auth.token).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });

  it("marks the session as onboarding", () => {
    const store = makeStore();
    store.dispatch(markOnboarding());
    expect(store.getState().auth.scope).toBe("onboarding");
    expect(storage.setScope).toHaveBeenCalledWith("onboarding");
  });
});
