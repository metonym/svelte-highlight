import { loadLanguage } from "../src/load-language.js";

describe("loadLanguage", () => {
  it("loads a known language", async () => {
    const language = await loadLanguage("typescript");
    expect(language.name).toBe("typescript");
    expect(Array.isArray(language.register.states)).toBe(true);
  });

  it("rejects an unknown language", async () => {
    // @ts-expect-error — intentionally invalid name
    await expect(loadLanguage("not-a-language")).rejects.toThrow(
      /Unknown language/,
    );
  });
});
