import { createRegistry } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import python from "../src/languages/python.js";

const registry = createRegistry();
registry.register(javascript.register);
registry.register(python.register);

// Long enough to exceed DETECT_SAMPLE_LIMIT (8000 chars) many times over, so
// the truncated-scoring path is actually exercised, not just the code path
// that skips it for short inputs.
const JS_SNIPPET = `function add(a, b) {
  // sums two numbers
  return a + b;
}
const result = add(1, 2);
console.log(\`result: \${result}\`);
`;

function repeatPast(snippet: string, minLength: number) {
  const times = Math.ceil(minLength / snippet.length) + 1;
  return snippet.repeat(times);
}

describe("tokenizeAuto's per-candidate scoring sample limit", () => {
  it("still detects the correct language for input far past the sample limit", () => {
    const code = repeatPast(JS_SNIPPET, 30000);
    expect(code.length).toBeGreaterThan(8000);

    const result = registry.tokenizeAuto(code);

    expect(result.language).toBe("javascript");
  });

  it("returns events/relevance for the FULL document, not just the sample", () => {
    const code = repeatPast(JS_SNIPPET, 30000);
    const truncated = registry.tokenizeAuto(code);
    const full = registry.tokenize(code, "javascript");

    expect(truncated.events).toEqual(full.events);
    expect(truncated.relevance).toEqual(full.relevance);
  });

  it("agrees with a manually untruncated scoring pass on which language wins", () => {
    // Simulates "no limit" by scoring every candidate over the full code via
    // the public tokenize() API, then compares against tokenizeAuto's
    // (sample-limited) pick for the same input.
    const code = repeatPast(JS_SNIPPET, 30000);
    const jsRelevance = registry.tokenize(code, "javascript").relevance;
    const pyRelevance = registry.tokenize(code, "python").relevance;
    expect(jsRelevance).toBeGreaterThan(pyRelevance);

    const result = registry.tokenizeAuto(code, ["javascript", "python"]);
    expect(result.language).toBe("javascript");
  });

  it("short input (below the limit) is unaffected", () => {
    const code = "def greet(name):\n    return f'hello {name}'\n";
    const result = registry.tokenizeAuto(code, ["javascript", "python"]);
    expect(result.language).toBe("python");
    expect(result.events).toEqual(registry.tokenize(code, "python").events);
  });
});
