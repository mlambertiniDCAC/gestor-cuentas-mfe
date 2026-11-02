import { describe, it, expect } from "vitest";
import {
  AUTHORIZE_REJECTED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  PERMISSION_MESSAGES,
} from "src/lib/apiError";
import { adaptBatchResult, buildBatchMessage } from "../store/paymentsAdapters";

describe("adaptBatchResult", () => {
  it("splits authorized, permission-rejected and failed", () => {
    const result = adaptBatchResult([
      { id: 1, exitoso: true },
      { id: 2, exitoso: false, error: "x", motivo: "USUARIO_SIN_PERMISO" },
      { id: 3, exitoso: false, error: "otro" },
    ]);
    expect(result).toEqual({
      authorized: [1],
      rejected: [{ id: 2, motivo: "USUARIO_SIN_PERMISO" }],
      failed: [{ id: 3, error: "otro" }],
    });
  });

  it.each(["SUJETO_SIN_CVU", "SUJETO_SIN_CREDITOS"])(
    "treats %s as failed with its own text",
    (motivo) => {
      const result = adaptBatchResult([
        { id: 4, exitoso: false, error: "del servidor", motivo },
      ]);
      expect(result.rejected).toEqual([]);
      expect(result.failed).toEqual([
        { id: 4, error: PERMISSION_MESSAGES[motivo] },
      ]);
    }
  );
});

describe("buildBatchMessage", () => {
  const rejected = [{ id: 2, motivo: "USUARIO_SIN_PERMISO" }];

  it("returns the permission text only when nothing was authorized", () => {
    expect(buildBatchMessage({ authorized: [], rejected, failed: [] })).toBe(
      AUTHORIZE_REJECTED_MESSAGE
    );
    expect(
      buildBatchMessage({ authorized: [1], rejected, failed: [] })
    ).toBeNull();
  });

  it("joins failed errors", () => {
    expect(
      buildBatchMessage({
        authorized: [1],
        rejected: [],
        failed: [
          { id: 3, error: "a" },
          { id: 4, error: "b" },
        ],
      })
    ).toBe("a. b");
  });

  it("shows rejected and failed together", () => {
    expect(
      buildBatchMessage({
        authorized: [],
        rejected,
        failed: [{ id: 3, error: "a" }],
      })
    ).toBe(`${AUTHORIZE_REJECTED_MESSAGE}. a`);
  });

  it("falls back to the generic text for failures without error", () => {
    expect(
      buildBatchMessage({
        authorized: [1],
        rejected: [],
        failed: [{ id: 3, error: null }],
      })
    ).toBe(GENERIC_ERROR_MESSAGE);
  });
});
