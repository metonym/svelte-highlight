const KCL_KEYWORDS = [
  "schema|5",
  "mixin",
  "protocol",
  "check|5",
  "rule",
  "import",
  "as",
  "lambda",
  "if",
  "elif",
  "else",
  "for",
  "in",
  "not",
  "and",
  "or",
  "assert",
  "all",
  "any",
  "map",
  "filter",
  "type",
];

const KCL_LITERALS = "True False None Undefined";
const KCL_TYPES = "str int float bool any";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKcl(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/ },
      { begin: /'''/, end: /'''/ },
      { begin: /"/, end: /"/ },
      { begin: /'/, end: /'/ },
    ],
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const DECORATOR = {
    className: "meta",
    begin: /@[A-Za-z_][\w]*/,
    relevance: 0,
  };

  const SCHEMA_NAME = {
    begin: [/\bschema\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 0,
  };

  const CHECK_BLOCK = {
    className: "keyword",
    begin: /\bcheck\s*:/,
    relevance: 5,
  };

  return {
    name: "KCL",
    aliases: ["kcl"],
    keywords: {
      keyword: KCL_KEYWORDS,
      literal: KCL_LITERALS,
      type: KCL_TYPES,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      DECORATOR,
      CHECK_BLOCK,
      SCHEMA_NAME,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineKcl(hljs);
}

export const kcl = { name: "kcl", register };
export default kcl;
