import { describe, it, expect } from "vitest";
import { adaptErrors } from "../helpers";
import { lightTheme, darkTheme, color } from "../../assets/themes";

describe("leaf infra imports", () => {
  it("adaptErrors flattens field errors", () => {
    expect(adaptErrors({ errors: { a: ["x"], b: ["y", "z"] } })).toEqual([
      "x",
      "y",
      "z",
    ]);
  });

  it("adaptErrors returns [message] when no field errors", () => {
    expect(adaptErrors({ message: "boom" })).toEqual(["boom"]);
  });

  it("themes expose a color palette", () => {
    expect(lightTheme.colors.neutral).toBeTruthy();
    expect(darkTheme.colors.neutral).toBeTruthy();
    expect(color.neutral).toBeTruthy();
  });
});
