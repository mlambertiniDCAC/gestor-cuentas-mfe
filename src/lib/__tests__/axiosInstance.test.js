import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axiosInstance from "../axiosInstance";
import { authStorage } from "../authStorage";

const buildAdapter = (responses) => {
  let call = 0;
  return (config) => {
    const response = responses[Math.min(call, responses.length - 1)];
    call += 1;
    if (response.status >= 400) {
      const error = new Error("Request failed");
      error.config = config;
      error.response = {
        status: response.status,
        data: response.data,
        headers: {},
        config,
      };
      return Promise.reject(error);
    }
    return Promise.resolve({
      data: response.data,
      status: response.status,
      statusText: "OK",
      headers: {},
      config,
    });
  };
};

describe("axiosInstance interceptor", () => {
  let reloadSpy;
  const originalAdapter = axiosInstance.defaults.adapter;

  beforeEach(() => {
    authStorage.clear();
    reloadSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
  });

  it("401 en /v1/auth/login sin token rechaza sin recargar la página", async () => {
    const adapter = buildAdapter([
      { status: 401, data: { message: "Credenciales inválidas" } },
    ]);

    await expect(
      axiosInstance.post(
        "/v1/auth/login",
        { mail: "a@a.com", password: "x" },
        { adapter }
      )
    ).rejects.toBeTruthy();

    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("401 sin token en otra ruta rechaza sin recargar la página", async () => {
    const adapter = buildAdapter([{ status: 401, data: {} }]);

    await expect(
      axiosInstance.get("/v1/psp/cuentas", { adapter })
    ).rejects.toBeTruthy();

    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("401 con token en otra ruta intenta refresh y reintenta la request original", async () => {
    authStorage.setToken("token-viejo");

    const adapter = buildAdapter([
      { status: 401, data: {} },
      { status: 200, data: { ok: true } },
      { status: 200, data: { ok: true } },
    ]);
    axiosInstance.defaults.adapter = adapter;

    const response = await axiosInstance.get("/v1/psp/cuentas");

    expect(response.status).toBe(200);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("refresh que falla con token limpia storage y fuerza logout", async () => {
    authStorage.setToken("token-viejo");

    const adapter = buildAdapter([
      { status: 401, data: {} },
      { status: 401, data: {} },
    ]);
    axiosInstance.defaults.adapter = adapter;

    await expect(axiosInstance.get("/v1/psp/cuentas")).rejects.toBeTruthy();

    expect(reloadSpy).toHaveBeenCalled();
    expect(authStorage.getToken()).toBeNull();
  });
});
