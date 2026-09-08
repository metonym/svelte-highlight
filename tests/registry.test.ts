import {
  createRegistry,
  TokenizerLoopError,
  UnknownLanguageError,
} from "../src/engine.js";
import javascript from "../src/languages/javascript.js";

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
