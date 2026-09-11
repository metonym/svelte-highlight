// `catch` is the try/catch form added in 2022; `optional` marks optional
// function parameters.
const POWERQUERY_KEYWORDS =
  "let in each|5 if then else try otherwise catch error as is meta section shared and or not type nullable optional";

const POWERQUERY_LITERALS = "true false null";

const POWERQUERY_TYPES =
  "text number logical date datetime time duration binary record list table function any none";

const POWERQUERY_HASH_BUILTINS =
  "table date datetime datetimezone duration time binary shared sections infinity nan";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePowerQuery(hljs) {
  const QUOTED_IDENTIFIER = {
    className: "variable",
    begin: /#"[^"]*"/,
    relevance: 10,
  };

  const HASH_BUILTIN = {
    className: "built_in",
    begin: new RegExp(
      `#(?:${POWERQUERY_HASH_BUILTINS.split(" ").join("|")})\\b`,
    ),
    relevance: 5,
  };

  const KNOWN_TYPE_IDENTIFIER = {
    className: "type",
    begin: /\b(?:Int64|Currency|Percentage)\.Type\b/,
    relevance: 0,
  };

  const LIBRARY_FUNCTION = {
    className: "title function_",
    begin: /[A-Z][\w]*\.[A-Z]\w*/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      { className: "subst", begin: /""/, relevance: 0 },
      { className: "subst", begin: /#\(lf\)/, relevance: 0 },
    ],
  };

  // `...` (the "not implemented" expression and open record type marker)
  // and `??` (null coalescing) come before their shorter prefixes.
  const OPERATOR = {
    className: "operator",
    begin: /=>|\.\.\.|\.\.|@|&|\?\?|\?/,
    relevance: 0,
  };

  return {
    name: "Power Query M",
    aliases: ["m", "pq", "powerquery-m"],
    keywords: {
      keyword: POWERQUERY_KEYWORDS,
      literal: POWERQUERY_LITERALS,
      type: POWERQUERY_TYPES,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      QUOTED_IDENTIFIER,
      HASH_BUILTIN,
      STRING,
      KNOWN_TYPE_IDENTIFIER,
      LIBRARY_FUNCTION,
      OPERATOR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePowerQuery(hljs);
}

export const powerquery = { name: "powerquery", register };
export default powerquery;
