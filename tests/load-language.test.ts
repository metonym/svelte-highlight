import { createRegistry, registerAll } from "../src/engine.js";
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

  it("round-trips through ensureRegistered/registerAll with its dependencies", async () => {
    const registry = createRegistry();

    const astro = await loadLanguage("astro");
    registerAll(registry, astro);

    expect(registry.get("astro")).toBeTruthy();
    expect(registry.get("html")).toBeTruthy();
    expect(registry.get("typescript")).toBeTruthy();
    expect(registry.get("css")).toBeTruthy();
    expect(registry.get("javascript")).toBeTruthy();
  });
});
