import {
  createRegistry,
  TokenizerLoopError,
  UnknownLanguageError,
} from "../src/engine.js";
import css from "../src/languages/css.js";
import javascript from "../src/languages/javascript.js";
import typescript from "../src/languages/typescript.js";

const registry = createRegistry();
registry.register(javascript.register);

describe("UnknownLanguageError", () => {
  it("is thrown by tokenize for an unregistered language", () => {
    expect(() => registry.tokenize("code", "not-a-real-language")).toThrow(
      UnknownLanguageError,
    );
    try {
      registry.tokenize("code", "not-a-real-language");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(UnknownLanguageError);
      expect((err as UnknownLanguageError).language).toBe(
        "not-a-real-language",
      );
    }
  });

  it("is thrown by highlight and tokenizeRanges, via tokenize delegation", () => {
    expect(() =>
      registry.highlight("code", { language: "not-a-real-language" }),
    ).toThrow(UnknownLanguageError);
    expect(() =>
      registry.tokenizeRanges("code", { language: "not-a-real-language" }),
    ).toThrow(UnknownLanguageError);
  });

  it("is thrown by createSession for an unregistered language", () => {
    expect(() => registry.createSession("not-a-real-language")).toThrow(
      UnknownLanguageError,
    );
  });
});

describe("TokenizerLoopError", () => {
  it("carries name, message, and structured fields", () => {
    // Triggering the real 500,000-iteration path isn't a fast unit test;
    // this only pins the error's shape.
    const err = new TokenizerLoopError("fakelang", 500001);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("TokenizerLoopError");
    expect(err.message).toBe("potential infinite loop (fakelang)");
    expect(err.grammarName).toBe("fakelang");
    expect(err.iterations).toBe(500001);
  });
});

describe("Registry contract", () => {
  const contractRegistry = createRegistry();
  contractRegistry.register(javascript.register);
  contractRegistry.register(typescript.register);
  contractRegistry.register(css.register);

  it("get() resolves a canonical name and returns undefined for an unknown one", () => {
    expect(contractRegistry.get("javascript")?.ir.name).toBe("javascript");
    expect(contractRegistry.get("not-a-language")).toBeUndefined();
  });

  it("get() resolves an alias to the same program as its canonical name", () => {
    expect(contractRegistry.get("ts")).toBe(contractRegistry.get("typescript"));
  });

  it("listLanguages() includes exactly the registered languages", () => {
    expect(new Set(contractRegistry.listLanguages())).toEqual(
      new Set(["javascript", "typescript", "css"]),
    );
  });

  it("tokenizeRanges() ranges are sorted, non-overlapping, and in bounds", () => {
    // toRanges only emits a range for text inside some scope, so plain
    // unscoped text (whitespace, punctuation) between tokens has no range
    // at all - "gapless over [0, code.length)" doesn't hold in general, only
    // "no two ranges overlap".
    const code = "const x = 1;\nfunction f() { return x + 2; }\n";
    const ranges = [
      ...contractRegistry.tokenizeRanges(code, { language: "javascript" }),
    ].sort((a, b) => a.start - b.start);

    expect(ranges.length).toBeGreaterThan(0);
    for (const range of ranges) {
      expect(range.start).toBeGreaterThanOrEqual(0);
      expect(range.end).toBeLessThanOrEqual(code.length);
      expect(range.end).toBeGreaterThan(range.start);
    }
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i]?.start).toBeGreaterThanOrEqual(ranges[i - 1]?.end ?? 0);
    }
  });

  it("highlightAuto() picks one of the candidates and ranks secondBest below it", () => {
    const code = "const x = 1;\nfunction f() { return x + 2; }\n";
    const result = contractRegistry.highlightAuto(code, [
      "javascript",
      "typescript",
    ]);

    expect(["javascript", "typescript"]).toContain(result.language);
    if (result.secondBest) {
      const other =
        result.language === "javascript" ? "typescript" : "javascript";
      expect(result.secondBest.language).toBe(other);
      expect(result.secondBest.relevance).toBeLessThanOrEqual(result.relevance);
    }
  });

  it("illegal is inert on an explicit-language tokenize() call (pins the auto-detect-only behavior)", () => {
    // typescript's grammar sets illegal: "#(?![$_A-Za-z])"
    expect(() =>
      contractRegistry.tokenize("const x = 1; #bad", "typescript"),
    ).not.toThrow();
  });

  it("resume() throws on an unregistered language, but doesn't validate it upfront", () => {
    // engine.js:1440 (createSession comment): resume() reads program.states
    // without checking `program` itself, so an unregistered name throws a
    // lower-level error inside Tokenizer rather than UnknownLanguageError.
    const session = contractRegistry.createSession("javascript");
    const snapshot = session.snapshot();
    expect(() =>
      contractRegistry.resume("code", "not-a-language", snapshot),
    ).toThrow();
  });
});
