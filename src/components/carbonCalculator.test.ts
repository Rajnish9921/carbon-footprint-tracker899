import { describe, test, expect } from "vitest";

import { calculateCarbon } from "./carbonCalculator";

describe("Carbon Calculator", () => {
  test("calculates carbon emissions correctly", () => {
    expect(calculateCarbon(100)).toBe(20);
  });

  test("returns zero for zero input", () => {
    expect(calculateCarbon(0)).toBe(0);
  });
});
