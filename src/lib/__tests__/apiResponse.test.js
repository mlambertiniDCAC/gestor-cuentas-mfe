import { describe, it, expect } from "vitest";
import { unwrap } from "../apiResponse";

describe("unwrap", () => {
  it("returns inner data when the body has the ms-psp envelope", () => {
    expect(unwrap({ data: { code: 200, data: [1, 2] } })).toEqual([1, 2]);
  });

  it("returns the body when there is no envelope", () => {
    expect(unwrap({ data: { token: "t" } })).toEqual({ token: "t" });
  });

  it("returns undefined for an empty response", () => {
    expect(unwrap(undefined)).toBeUndefined();
  });
});
