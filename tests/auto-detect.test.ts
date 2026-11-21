import {
  DEFAULT_CANDIDATES,
  detectCandidates,
  highlightAutoIfLoaded,
  highlightAutoLazy,
} from "../src/auto-detect.js";
import { createRegistry, registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import { DETECT_INDEX, SUB_LANGUAGES } from "../src/languages/detect-index.js";
import { SAMPLES } from "./detection-corpus.ts";

// The fingerprint step only has to get the right grammar into the top
// DEFAULT_CANDIDATES; the relevance engine picks the winner. So this
// measures recall, not top-1.
//
// Samples whose language is NOT in the top DEFAULT_CANDIDATES. Most are
// languages whose grammar has few or no keywords (angular, bibtex,
// dotenv, rst), or whose keywords are common words other grammars share
// (hcl, jq, just). Remove a language from this list when a change to the
// index makes it hit. The test fails if a listed language starts to hit,
// so the list stays honest.
const KNOWN_RECALL_MISSES = new Set([
  "angular",
  "bibtex",
  "blade",
  "dax",
  "dotenv",
  "earthfile",
  "flux",
  "hcl",
  "jq",
  "just",
  "kdl",
  "liquid",
  "nushell",
  "pkl",
  "rego",
  "rescript",
  "rst",
  "typst",
  "vyper",
]);

describe("detectCandidates", () => {
  test("returns at most k known grammar names, best first", () => {
    const names = new Set(DETECT_INDEX.map(([name]) => name));
    const candidates = detectCandidates("body { color: red; }", 3);
    expect(candidates.length).toBeLessThanOrEqual(3);
    for (const name of candidates) expect(names.has(name)).toBe(true);
  });

  test("returns nothing for empty or non-string input", () => {
    expect(detectCandidates("")).toEqual([]);
    expect(detectCandidates(undefined)).toEqual([]);
    expect(detectCandidates(null)).toEqual([]);
  });

  test("lists every index entry in all.js order", () => {
    const order = allLanguages.map((language) => language.name);
    const indexed = DETECT_INDEX.map(([name]) => name);
    const positions = indexed.map((name) => order.indexOf(name));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("lists only real grammars as sub-languages", () => {
    const order = new Set(allLanguages.map((language) => language.name));
    for (const subs of Object.values(SUB_LANGUAGES)) {
      for (const sub of subs) expect(order.has(sub)).toBe(true);
    }
  });

  describe(`recall@${DEFAULT_CANDIDATES} on tests/detection-corpus.ts`, () => {
    for (const [language, code] of Object.entries(SAMPLES)) {
      const hit = detectCandidates(code).includes(language);
      if (KNOWN_RECALL_MISSES.has(language)) {
        test(`${language} misses (known)`, () => expect(hit).toBe(false));
      } else {
        test(`${language} is a candidate`, () => expect(hit).toBe(true));
      }
    }
  });
});

describe("highlightAutoLazy", () => {
  test("loads only the candidates and the grammars they embed", async () => {
    const registry = createRegistry();
    const code = "@media (max-width: 600px) {\n  body { color: red; }\n}";
    const result = await highlightAutoLazy(code, { registry });
    expect(result.language).toBe("css");
    const loaded = registry.listLanguages();
    const expected = new Set(detectCandidates(code));
    for (const name of [...expected]) {
      for (const sub of SUB_LANGUAGES[name] ?? []) expected.add(sub);
    }
    // registerAll also registers the grammars a custom grammar imports,
    // so allow a few more, but nowhere near all of them.
    expect(loaded.length).toBeLessThan(allLanguages.length / 10);
    for (const name of expected) expect(registry.get(name)).toBeDefined();
  });

  test("lets already-registered grammars compete", async () => {
    const registry = createRegistry();
    const python = allLanguages.find(({ name }) => name === "python");
    if (!python) throw new Error("python grammar missing");
    registerAll(registry, python);
    // Too short for the fingerprint step to make python a candidate.
    const code = "def f(x):\n    return x * 2\n";
    expect(detectCandidates(code)).not.toContain("python");
    const result = await highlightAutoLazy(code, { registry });
    expect(result.language).toBe("python");
  });

  test("with languageNames, detects among those names only", async () => {
    const registry = createRegistry();
    const result = await highlightAutoLazy("const x = 1;", {
      registry,
      languageNames: ["javascript", "typescript"],
    });
    expect(["javascript", "typescript"]).toContain(result.language);
    // Embedded grammars (xml, css, graphql) load too, but nothing else.
    expect(registry.get("python")).toBeUndefined();
  });

  test("skips a name that fails to load", async () => {
    const registry = createRegistry();
    const result = await highlightAutoLazy("const x = 1;", {
      registry,
      languageNames: ["javascript", "not-a-language"],
    });
    expect(result.language).toBe("javascript");
  });

  test("returns plain text when nothing matches", async () => {
    const result = await highlightAutoLazy("", { registry: createRegistry() });
    expect(result.language).toBeUndefined();
    expect(result.value).toBe("");
  });

  // End to end on the same corpus as HighlightAuto's accuracy test. Each
  // sample starts from an empty registry, the worst case for the lazy
  // path. The lazy path picks from fewer grammars, so it often does better
  // than HighlightAuto here. This test only guards against it doing worse.
  test("is at least as accurate as HighlightAuto on the detection corpus", async () => {
    const full = createRegistry();
    for (const language of allLanguages) registerAll(full, language);
    const entries = Object.entries(SAMPLES);
    const auto = entries.filter(
      ([language, code]) => full.highlightAuto(code).language === language,
    ).length;
    const results = await Promise.all(
      entries.map(([, code]) =>
        highlightAutoLazy(code, { registry: createRegistry() }),
      ),
    );
    const lazy = results.filter(
      (result, i) => result.language === entries[i]?.[0],
    ).length;
    expect(lazy).toBeGreaterThanOrEqual(auto);
  });
});

describe("highlightAutoIfLoaded", () => {
  test("returns undefined until the candidates are registered", async () => {
    const registry = createRegistry();
    const code = "@media (max-width: 600px) {\n  body { color: red; }\n}";
    expect(highlightAutoIfLoaded(code, { registry })).toBeUndefined();
    const lazy = await highlightAutoLazy(code, { registry });
    const ready = highlightAutoIfLoaded(code, { registry });
    expect(ready?.language).toBe(lazy.language);
    expect(ready?.value).toBe(lazy.value);
  });
});
