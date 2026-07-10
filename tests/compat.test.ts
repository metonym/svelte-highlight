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
});
