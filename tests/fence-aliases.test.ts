import { existsSync } from "node:fs";
import { resolveLanguageName } from "../src/fence.js";
import { LANGUAGE_ALIASES } from "../src/languages/aliases.js";

describe("resolveLanguageName", () => {
  it('resolves "ts" to "typescript"', () => {
    expect(resolveLanguageName("ts")).toBe("typescript");
  });

  it('resolves "TypeScript" case-insensitively', () => {
    expect(resolveLanguageName("TypeScript")).toBe("typescript");
  });

  it('resolves "sh" to "bash"', () => {
    expect(resolveLanguageName("sh")).toBe("bash");
  });

  it("resolves a canonical name to itself", () => {
    expect(resolveLanguageName("plaintext")).toBe("plaintext");
  });

  it("returns undefined for an unknown name", () => {
    expect(resolveLanguageName("nope")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(resolveLanguageName("")).toBeUndefined();
  });
});

describe("LANGUAGE_ALIASES", () => {
  it("has only lowercase keys, each mapping to a shipped grammar file", () => {
    for (const [alias, canonical] of Object.entries(LANGUAGE_ALIASES)) {
      expect(alias).toBe(alias.toLowerCase());
      expect(existsSync(`src/languages/${canonical}.js`)).toBe(true);
    }
  });
});
