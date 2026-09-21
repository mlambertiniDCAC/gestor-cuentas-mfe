import { describe, it, expect } from "vitest";
import {
  getApiErrorMessage,
  isOnboardingScopeError,
  GENERIC_ERROR_MESSAGE,
} from "../apiError";

const httpError = (status, data) => ({ response: { status, data } });

describe("getApiErrorMessage", () => {
  it("uses the Nest string message", () => {
    expect(
      getApiErrorMessage(httpError(400, { message: "alias en uso" }))
    ).toBe("alias en uso");
  });

  it("joins a Nest message array", () => {
    expect(
      getApiErrorMessage(httpError(400, { message: ["a inválido", "b vacío"] }))
    ).toBe("a inválido. b vacío");
  });

  it("uses the ms-psp error envelope", () => {
    expect(
      getApiErrorMessage(httpError(409, { error: { code: 409, message: "x" } }))
    ).toBe("x");
  });

  it("returns the generic message on 5xx", () => {
    expect(getApiErrorMessage(httpError(502, { message: "bad gw" }))).toBe(
      GENERIC_ERROR_MESSAGE
    );
  });

  it("returns the generic message on network errors", () => {
    expect(getApiErrorMessage(new Error("Network Error"))).toBe(
      GENERIC_ERROR_MESSAGE
    );
  });
});

describe("isOnboardingScopeError", () => {
  it("detects the onboarding 403", () => {
    expect(
      isOnboardingScopeError(
        httpError(403, { message: "la sesión todavía está en onboarding" })
      )
    ).toBe(true);
  });

  it("ignores other 403s", () => {
    expect(isOnboardingScopeError(httpError(403, { message: "otro" }))).toBe(
      false
    );
  });
});
