const CEL_KEYWORDS = "in";

const CEL_LITERALS = "true false null";

const CEL_BUILT_INS =
  "size type matches contains startsWith endsWith timestamp duration dyn bytes int uint double bool " +
  "string getDate getDayOfMonth getDayOfWeek getDayOfYear getFullYear getHours getMilliseconds " +
  "getMinutes getMonth getSeconds";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCel(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /r?"""/, end: /"""/ },
      { begin: /r?'''/, end: /'''/ },
      { begin: /r?"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /r?'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /b"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /b'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
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

  const FIELD = {
    className: "property",
    begin: /\.[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const BRACKET_FIELD = {
    className: "property",
    begin: /\[/,
    end: /\]/,
    contains: [STRING, NUMBER],
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
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      MACRO,
      BRACKET_FIELD,
      FIELD,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCel(hljs);
}

export const cel = { name: "cel", register };
export default cel;
