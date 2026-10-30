import { describe, it, expect } from "vitest";
import {
  PERMISSION_MESSAGES,
  getApiErrorMessage,
  getPermissionMotivo,
  isForbidden,
} from "../apiError";

const forbidden = (motivo, message = "x", status = 403) => ({
  response: { status, data: { error: { code: status, message, motivo } } },
});

describe("permission errors", () => {
  it.each(Object.keys(PERMISSION_MESSAGES))("maps %s to its text", (motivo) => {
    expect(getApiErrorMessage(forbidden(motivo))).toBe(
      PERMISSION_MESSAGES[motivo]
    );
  });

  it("falls back to the server message for unknown or missing motivo", () => {
    expect(getApiErrorMessage(forbidden("OTRO", "del servidor"))).toBe(
      "del servidor"
    );
    expect(getApiErrorMessage(forbidden(undefined, "sin motivo"))).toBe(
      "sin motivo"
    );
  });

  it("ignores motivo outside a 403", () => {
    expect(
      getPermissionMotivo(forbidden("SUJETO_SIN_CVU", "x", 400))
    ).toBeNull();
    expect(isForbidden(forbidden("SUJETO_SIN_CVU", "x", 400))).toBe(false);
    expect(isForbidden(forbidden("SUJETO_SIN_CVU"))).toBe(true);
  });
});
