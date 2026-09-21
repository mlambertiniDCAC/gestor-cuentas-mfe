import { describe, it, expect } from "vitest";
import { buildAliasValidationSchema } from "../lib/aliasRules";

const isValid = (alias, current = "actual.alias") =>
  buildAliasValidationSchema(current).isValidSync({ alias });

describe("aliasRules", () => {
  it("accepts a valid alias", () => {
    expect(isValid("nuevo.alias-1")).toBe(true);
  });

  it("rejects short and long aliases", () => {
    expect(isValid("abc")).toBe(false);
    expect(isValid("a".repeat(21))).toBe(false);
  });

  it("rejects invalid characters and ñ", () => {
    expect(isValid("mi alias")).toBe(false);
    expect(isValid("cañada.uno")).toBe(false);
  });

  it("rejects the current alias", () => {
    expect(isValid("actual.alias")).toBe(false);
  });
});
