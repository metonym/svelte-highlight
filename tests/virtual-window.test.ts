import { windowRange } from "../src/virtual-window.js";

describe("windowRange", () => {
  it("pads the visible range by overscan on both sides", () => {
    const { start, end } = windowRange({
      scrollTop: 100,
      clientHeight: 50,
      lineHeight: 10,
      overscan: 2,
      total: 1000,
    });

    // Visible lines 10-15 (100/10 to 150/10), padded by 2 on each side.
    expect(start).toBe(8);
    expect(end).toBe(17);
  });

  it("clamps start to 0 near the top", () => {
    const { start, end } = windowRange({
      scrollTop: 0,
      clientHeight: 50,
      lineHeight: 10,
      overscan: 10,
      total: 1000,
    });

    expect(start).toBe(0);
    expect(end).toBe(15);
  });

  it("clamps end to total near the bottom", () => {
    const { start, end } = windowRange({
      scrollTop: 990,
      clientHeight: 50,
      lineHeight: 10,
      overscan: 10,
      total: 100,
    });

    expect(end).toBe(100);
    expect(start).toBeLessThan(end);
  });

  it("returns an empty, clamped range for an empty document", () => {
    const { start, end } = windowRange({
      scrollTop: 0,
      clientHeight: 50,
      lineHeight: 10,
      overscan: 5,
      total: 0,
    });

    expect(start).toBe(0);
    expect(end).toBe(0);
  });
});
