const FENNEL_KEYWORDS =
  "fn lambda λ let local var set global if when each for while do match icollect accumulate collect values not and or true false nil";

const LUA_BUILTINS =
  "print pairs ipairs table string math os io tostring tonumber type pcall error assert require";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFennel(hljs) {
  // `:keyword` strings are a distinct mode from regular symbols, e.g. a
  // table key in `{:name "x"}`.
  const KEYWORD_STRING = {
    className: "symbol",
    begin: /:[A-Za-z_][\w-]*/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  return {
    name: "Fennel",
    aliases: ["fennel", "fnl"],
    keywords: {
      // Fennel/Lua identifiers routinely include `-`, `?`, `!`, `.`, `:`
      // (`table.insert`, `obj:method`) - anything not whitespace or a
      // delimiter is a candidate identifier.
      $pattern: "[^\\s()\\[\\]{}\"'`,;]+",
      keyword: FENNEL_KEYWORDS,
      built_in: LUA_BUILTINS,
    },
    contains: [hljs.COMMENT(/;/, /$/), KEYWORD_STRING, STRING, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineFennel(hljs);
}

export const fennel = { name: "fennel", register };
export default fennel;
