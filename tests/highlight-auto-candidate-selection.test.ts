import { createRegistry } from "../src/engine.js";

// Synthetic, minimal grammars so these assertions depend only on
// tokenizeAuto/beats's own candidate-selection logic, not on real grammars'
// relevance scores (which can shift as grammars are tuned).
describe("tokenizeAuto/highlightAuto candidate selection", () => {
  describe("secondBest", () => {
    const registry = createRegistry();
    registry.register({
      name: "alpha",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [{ rules: [], keywords: { alphakeyword: ["_", 10] } }],
    });
    registry.register({
      name: "beta",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [{ rules: [], keywords: { betakeyword: ["_", 6] } }],
    });

    it("reports the runner-up language and its relevance", () => {
      const result = registry.highlightAuto("alphakeyword betakeyword");
      expect(result.language).toBe("alpha");
      expect(result.secondBest).toEqual({ language: "beta", relevance: 6 });
    });

    it("is undefined when only one candidate is viable", () => {
      const result = registry.highlightAuto("alphakeyword betakeyword", [
        "alpha",
      ]);
      expect(result.language).toBe("alpha");
      expect(result.secondBest).toBeUndefined();
    });
  });

  describe("disableAutodetect", () => {
    const registry = createRegistry();
    registry.register({
      name: "loud-disabled",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: true,
      states: [{ rules: [], keywords: { shout: ["_", 100] } }],
    });
    registry.register({
      name: "quiet",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [{ rules: [], keywords: { whisper: ["_", 1] } }],
    });

    it("excludes a disableAutodetect grammar even though it would score highest", () => {
      const result = registry.highlightAuto("shout whisper");
      expect(result.language).toBe("quiet");
    });

    it("stays excluded even when explicitly named in the candidate subset", () => {
      const result = registry.highlightAuto("shout whisper", [
        "loud-disabled",
        "quiet",
      ]);
      expect(result.language).toBe("quiet");
    });

    it("no candidates survive if the whole subset is disableAutodetect", () => {
      const result = registry.highlightAuto("shout whisper", ["loud-disabled"]);
      expect(result.language).toBeUndefined();
    });
  });

  describe("supersetOf tie-break", () => {
    function makeRegistry() {
      const registry = createRegistry();
      registry.register({
        name: "base-lang",
        caseInsensitive: false,
        unicode: false,
        disableAutodetect: false,
        states: [{ rules: [], keywords: { shared: ["_", 5] } }],
      });
      registry.register({
        name: "super-lang",
        caseInsensitive: false,
        unicode: false,
        disableAutodetect: false,
        supersetOf: "base-lang",
        states: [{ rules: [], keywords: { shared: ["_", 5] } }],
      });
      return registry;
    }

    it("the superset wins a tie regardless of candidate order (base first)", () => {
      const registry = makeRegistry();
      const result = registry.highlightAuto("shared", [
        "base-lang",
        "super-lang",
      ]);
      expect(result.language).toBe("super-lang");
    });

    it("the superset wins a tie regardless of candidate order (super first)", () => {
      const registry = makeRegistry();
      const result = registry.highlightAuto("shared", [
        "super-lang",
        "base-lang",
      ]);
      expect(result.language).toBe("super-lang");
    });
  });
});
