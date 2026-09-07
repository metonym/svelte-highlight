const YARN_COMMAND_KEYWORDS =
  "jump set declare if elseif else endif stop wait call once endonce detour return enum case endenum local smart to as is eq neq lt gt lte gte and or not xor";

const YARN_LITERALS = "true false null number string bool";

const YARN_BUILTINS = "visited random dice round floor ceil visited_count";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineYarnSpinner(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const BUILTIN_FUNC = {
    className: "built_in",
    begin: new RegExp(
      `\\b(?:${YARN_BUILTINS.split(" ").join("|")})(?=\\s*\\()`,
    ),
    relevance: 0,
  };

  const TITLE_KEY = {
    className: "attr",
    begin: /^title(?=\s*:)/,
    relevance: 10,
  };

  const KEY_VALUE_LINE = {
    className: "attr",
    begin: /^[A-Za-z_][\w]*(?=\s*:)/,
    relevance: 0,
  };

  const NODE_DELIMITER = {
    className: "meta",
    begin: /^(?:---|===)[ \t]*$/,
    relevance: 5,
  };

  const OPTION_ARROW = {
    className: "bullet",
    begin: /^\s*->/,
    relevance: 5,
  };

  const COMMAND_BLOCK = {
    begin: /<</,
    end: />>/,
    beginScope: "meta",
    endScope: "meta",
    relevance: 0,
    keywords: {
      keyword: YARN_COMMAND_KEYWORDS,
      literal: YARN_LITERALS,
    },
    contains: [STRING, VARIABLE, BUILTIN_FUNC, hljs.C_NUMBER_MODE],
  };

  const INLINE_EXPRESSION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    contains: [VARIABLE, BUILTIN_FUNC, STRING, hljs.C_NUMBER_MODE],
    relevance: 0,
  };

  const MARKUP_TAG = {
    className: "tag",
    begin: /\[\/?[A-Za-z][\w-]*(?:\s+[\w-]+="[^"\n]*")*\s*\/?\]/,
    relevance: 0,
  };

  const HASHTAG = {
    className: "meta",
    begin: /#[\w:]+/,
    relevance: 0,
  };

  return {
    name: "Yarn Spinner",
    aliases: ["yarn", "yarn-spinner"],
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      TITLE_KEY,
      KEY_VALUE_LINE,
      NODE_DELIMITER,
      OPTION_ARROW,
      COMMAND_BLOCK,
      INLINE_EXPRESSION,
      MARKUP_TAG,
      HASHTAG,
      STRING,
      VARIABLE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineYarnSpinner(hljs);
}

export const yarnspinner = { name: "yarnspinner", register };
export default yarnspinner;
