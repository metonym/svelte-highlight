import hljsFactory from "highlight.js/lib/core";
import hljsMathematica from "highlight.js/lib/languages/mathematica";
import { createRegistry, registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import mathematica from "../src/languages/mathematica.js";
import { registry } from "../src/registry.js";

// mathematica's "builtin-symbol" rule matches any identifier
// (`[a-zA-Z$][a-zA-Z0-9$]*`) but hljs guards it with an `on:begin` callback
// that only lets it through for recognized Mathematica built-ins - a check
// against a ~6000-word list (SYSTEM_SYMBOLS). The engine reproduces it
// declaratively as `beginWordSet` (Tokenizer#beginGuard in src/engine.js),
// extracted from the grammar's own source file at build time (see
// src/convert-language.js's `extractBeginWordSet`) since the word list lives
// in an outer module scope the compiled callback's own `toString()` can't
// reach.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("mathematica", hljsMathematica);

const engineRegistry = createRegistry();
engineRegistry.register(mathematica.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "mathematica" }).value;
  const actual = engineRegistry.highlight(code, {
    language: "mathematica",
  }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("mathematica builtin-symbol word-list guard (beginWordSet)", () => {
  it("a recognized system symbol opens built_in", () => {
    const html = expectMatchesHljs("Sin[x]");
    expect(html).toContain("hljs-built_in");
  });

  it("an unrecognized identifier falls back to plain variable", () => {
    const html = expectMatchesHljs("notARealBuiltin[x]");
    expect(html).not.toContain("hljs-built_in");
    expect(html).toContain("hljs-variable");
  });

  it("a solidity snippet wins full-corpus auto-detection instead of mathematica", () => {
    for (const language of allLanguages) registerAll(registry, language);

    const solidity = `pragma solidity ^0.8.0;

contract Token {
    mapping(address => uint256) public balanceOf;

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        return true;
    }
}
`;
    const result = registry.highlightAuto(solidity);
    expect(result.language).toBe("solidity");

    const mathematicaScore = registry.tokenize(solidity, "mathematica");
    expect(mathematicaScore.relevance).toBeLessThan(result.relevance);
  });
});
