import { fromHighlightJs } from "../src/compat.js";
import { createRegistry } from "../src/engine.js";

// A minimal hljs-format grammar, hand-authored the same way third-party
// hljs language plugins and older svelte-highlight custom-language
// examples are: a `register(hljs)` function returning a mode object.
function defineCurl(hljs: any) {
  return {
    name: "cURL",
    // biome-ignore lint/style/useNamingConvention: hljs's own grammar API property name
    case_insensitive: true,
    contains: [
      { className: "keyword", begin: /-{1,2}[a-zA-Z-]+/ },
      hljs.QUOTE_STRING_MODE,
    ],
  };
}

describe("fromHighlightJs", () => {
  it("converts an hljs-format grammar into a registerable LanguageType", async () => {
    const language = await fromHighlightJs("curl", defineCurl);
    expect(language.name).toBe("curl");
    expect(Array.isArray(language.register.states)).toBe(true);

    const registry = createRegistry();
    registry.register(language.register);
    const result = registry.highlight(
      'curl --verbose -X POST "https://example.com"',
      {
        language: "curl",
      },
    );

    expect(result.value).toContain(
      '<span class="hljs-keyword">--verbose</span>',
    );
    expect(result.value).toContain('<span class="hljs-keyword">-X</span>');
    expect(result.value).toContain(
      '<span class="hljs-string">&quot;https://example.com&quot;</span>',
    );
  });

  it("reuses one hljs instance across repeated calls (registerLanguage is idempotent)", async () => {
    await fromHighlightJs("curl", defineCurl);
    const language = await fromHighlightJs("curl", defineCurl);
    expect(language.name).toBe("curl");
  });

  it("recovers an on:begin word-set guard only when given the grammar's source", async () => {
    function defineWordSetGrammar(_hljs: any) {
      // biome-ignore lint/style/useNamingConvention: must match grammarSource's literal text below
      const SYMS = ["Alpha", "Beta"];
      // biome-ignore lint/style/useNamingConvention: must match grammarSource's literal text below
      const SYMS_SET = new Set(SYMS);
      return {
        name: "wordset-lang",
        contains: [
          {
            className: "built_in",
            begin: /[A-Za-z]+/,
            "on:begin": (match: any, response: any) => {
              if (!SYMS_SET.has(match[0])) response.ignoreMatch();
            },
          },
        ],
      };
    }
    const grammarSource = `
      const SYMS_SET = new Set(SYMS);
      const SYMS = ["Alpha", "Beta"];
    `;

    const withoutSource = await fromHighlightJs(
      "wordset-a",
      defineWordSetGrammar,
    );
    expect(
      withoutSource.warnings.some((w) =>
        w.includes("on:begin not convertible"),
      ),
    ).toBe(true);
    const registryWithout = createRegistry();
    registryWithout.register(withoutSource.register);
    const resultWithout = registryWithout.highlight("Alpha Zulu", {
      language: "wordset-a",
    });
    expect(resultWithout.value).toContain(
      '<span class="hljs-built_in">Alpha</span>',
    );
    expect(resultWithout.value).toContain(
      '<span class="hljs-built_in">Zulu</span>',
    );

    const withSource = await fromHighlightJs(
      "wordset-b",
      defineWordSetGrammar,
      grammarSource,
    );
    expect(withSource.warnings).toEqual([]);
    const registryWith = createRegistry();
    registryWith.register(withSource.register);
    const resultWith = registryWith.highlight("Alpha Zulu", {
      language: "wordset-b",
    });
    expect(resultWith.value).toContain(
      '<span class="hljs-built_in">Alpha</span>',
    );
    expect(resultWith.value).not.toContain(
      '<span class="hljs-built_in">Zulu</span>',
    );
  });

  it("degrades an unrecognized on:begin guard regardless of source", async () => {
    function defineUnrecognizedGuardGrammar(_hljs: any) {
      return {
        name: "unrecognized-guard-lang",
        contains: [
          {
            className: "built_in",
            begin: /[A-Za-z]+/,
            "on:begin": (match: any, response: any) => {
              if (match[0].length < 3) response.ignoreMatch();
            },
          },
        ],
      };
    }

    const language = await fromHighlightJs(
      "unrecognized-guard-lang",
      defineUnrecognizedGuardGrammar,
      "irrelevant source text",
    );
    expect(
      language.warnings.some((w) => w.includes("on:begin not convertible")),
    ).toBe(true);

    const registry = createRegistry();
    registry.register(language.register);
    const result = registry.highlight("Hi Alphabet", {
      language: "unrecognized-guard-lang",
    });
    expect(result.value).toContain('<span class="hljs-built_in">Hi</span>');
    expect(result.value).toContain(
      '<span class="hljs-built_in">Alphabet</span>',
    );
  });
});
