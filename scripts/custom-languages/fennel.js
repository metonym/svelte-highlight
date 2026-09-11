// Special forms and macros through Fennel 1.5: `case`/`case-try` (1.3),
// `fcollect`/`faccumulate` (1.2), `tail!` (1.4), the threading macros,
// and the table-access forms (`.`, `?.`, `..`).
const FENNEL_KEYWORDS =
  "fn lambda λ let local var set global if when each for while do match icollect accumulate collect values not and or " +
  "tset case case-try match-try catch where fcollect faccumulate doto with-open import-macros require-macros macro macros eval-compiler include comment lua partial pick-values pick-args tail! assert-repl " +
  ". ?. .. -> ->> -?> -?>> not= length #";

const FENNEL_LITERALS = "true false nil";

const LUA_BUILTINS =
  "print pairs ipairs table string math os io tostring tonumber type pcall error assert require";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFennel(hljs) {
  // `:keyword` strings are a distinct mode from regular symbols, e.g. a
  // table key in `{:name "x"}`. The `:` must follow whitespace or an
  // opening delimiter: the one in a method call (`f:read`, `obj:method`)
  // is part of the identifier and must not open a symbol.
  const KEYWORD_STRING = {
    begin: [/(?:^|[\s()[\]{}])/, /:[A-Za-z_][\w-]*/],
    beginScope: { 2: "symbol" },
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
      literal: FENNEL_LITERALS,
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
