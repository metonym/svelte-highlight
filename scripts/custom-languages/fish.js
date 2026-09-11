const FISH_KEYWORDS =
  "function end if else switch case while for in begin and or not " +
  "return break continue";

const FISH_BUILTINS =
  "set read echo printf string math test command builtin source eval " +
  "exec status type abbr alias bind complete functions count contains " +
  "argparse cd pwd exit history jobs trap fg bg wait";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFish(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /\$+[A-Za-z_][\w]*/,
    relevance: 0,
  };

  const SUBSTITUTION = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [VARIABLE],
  };

  const BARE_SUBSTITUTION = {
    className: "subst",
    begin: /\(/,
    end: /\)/,
    contains: [VARIABLE, hljs.BACKSLASH_ESCAPE],
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, VARIABLE, SUBSTITUTION],
  };

  const LITERAL_STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // A single bounded match (keyword + whitespace + name): the previous
  // `end: /$/` form kept the title matcher live for the rest of the line,
  // styling every word of `function greet --argument-names who -d "hi"`
  // as a function title.
  const FUNCTION = {
    begin: [/\bfunction\b/, /\s+/, /[A-Za-z_][\w-]*/],
    beginScope: { 1: "keyword", 3: "title function_" },
  };

  return {
    name: "fish",
    aliases: ["fish"],
    keywords: { keyword: FISH_KEYWORDS, built_in: FISH_BUILTINS },
    contains: [
      hljs.HASH_COMMENT_MODE,
      FUNCTION,
      STRING,
      LITERAL_STRING,
      VARIABLE,
      SUBSTITUTION,
      BARE_SUBSTITUTION,
      hljs.NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineFish(hljs);
}

export const fish = { name: "fish", register };
export default fish;
