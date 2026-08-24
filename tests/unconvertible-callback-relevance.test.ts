import { registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import mathematica from "../src/languages/mathematica.js";
import { registry } from "../src/registry.js";

// mathematica's real "builtin-symbol" rule matches any identifier
// (`[a-zA-Z$][a-zA-Z0-9$]*`) but hljs guards it with an `on:begin` callback
// that only lets it through for recognized Mathematica built-ins - a check
// against a large word list with no declarative IR equivalent (see
// convert-language.js's `recognizeCallbacks`). Without the guard the rule
// would match *every* identifier in *any* language and inflate mathematica's
// relevance on unrelated input, letting it win auto-detection against other
// languages. Since the guard can't be faithfully reproduced, its state's
// relevance is zeroed at conversion time instead of left at the default (1).
for (const language of allLanguages) registerAll(registry, language);

describe("states with an unconvertible on:begin/on:end callback don't contribute relevance", () => {
  it("mathematica's unguarded builtin-symbol rule has relevance 0", () => {
    const guarded = mathematica.register.states.filter(
      (s) => s.begin === "[a-zA-Z$][a-zA-Z0-9$]*",
    );
    expect(guarded.length).toBeGreaterThan(0);
    for (const state of guarded) expect(state.relevance ?? 1).toBe(0);
  });

  it("a solidity snippet wins full-corpus auto-detection instead of mathematica", () => {
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
