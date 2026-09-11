const CEL_KEYWORDS = "in";

const CEL_LITERALS = "true false null";

const CEL_BUILT_INS =
  "size type matches contains startsWith endsWith timestamp duration dyn bytes int uint double bool " +
  "string getDate getDayOfMonth getDayOfWeek getDayOfYear getFullYear getHours getMilliseconds " +
  "getMinutes getMonth getSeconds";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCel(hljs) {
  // The raw and bytes prefixes are case-insensitive in the spec (`R"..."`,
  // `B'...'`, and the `bR` / `Rb` combination).
  const STRING = {
    className: "string",
    variants: [
      { begin: /(?:[rR][bB]?|[bB][rR]?)?"""/, end: /"""/ },
      { begin: /(?:[rR][bB]?|[bB][rR]?)?'''/, end: /'''/ },
      {
        begin: /(?:[rR][bB]?|[bB][rR]?)?"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      {
        begin: /(?:[rR][bB]?|[bB][rR]?)?'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
    ],
  };

  const NUMBER = {
    className: "number",
    begin: /\b0x[0-9a-fA-F]+[uU]?\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uU]?\b/,
    relevance: 0,
  };

  // Comprehension macros are always calls, so requiring the trailing `(`
  // keeps this from firing on unrelated identifiers named `map` or `filter`.
  const MACRO = {
    className: "built_in",
    begin: /\b(?:has|all|exists_one|exists|filter|map)(?=\()/,
    relevance: 0,
  };

  // `.field` and the optional-field form `.?field`. Index access (`a["k"]`)
  // and list literals (`[1, 2]`) are plain: an earlier `[ ... ]` mode wrapped
  // every list literal in a property span.
  const FIELD = {
    className: "property",
    begin: /\.\??[a-zA-Z_]\w*/,
    relevance: 0,
  };

  return {
    name: "CEL",
    aliases: ["cel"],
    keywords: {
      keyword: CEL_KEYWORDS,
      literal: CEL_LITERALS,
      built_in: CEL_BUILT_INS,
    },
    contains: [hljs.C_LINE_COMMENT_MODE, STRING, MACRO, FIELD, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCel(hljs);
}

export const cel = { name: "cel", register };
export default cel;
