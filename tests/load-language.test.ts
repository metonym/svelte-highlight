import { createRegistry, registerAll } from "../src/engine.js";
import { LanguageLoadError, loadLanguage } from "../src/load-language.js";

describe("loadLanguage", () => {
  it("loads a known language", async () => {
    const language = await loadLanguage("typescript");
    expect(language.name).toBe("typescript");
    expect(Array.isArray(language.register.states)).toBe(true);
  });

  it("rejects an unknown language", async () => {
    // @ts-expect-error — intentionally invalid name
    const promise = loadLanguage("not-a-language");
    await expect(promise).rejects.toThrow(/Unknown language/);
    await expect(promise).rejects.toBeInstanceOf(LanguageLoadError);
    await promise.catch((error) => {
      expect(error.language).toBe("not-a-language");
    });
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
