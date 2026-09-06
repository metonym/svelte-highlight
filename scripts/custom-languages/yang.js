const YANG_KEYWORDS = [
  "module",
  "submodule",
  "namespace",
  "prefix",
  "import",
  "include",
  "revision",
  "organization",
  "contact",
  "description",
  "reference",
  "yang-version",
  "container",
  "list",
  "leaf",
  "leaf-list|5",
  "choice",
  "case",
  "grouping",
  "uses",
  "augment|5",
  "typedef",
  "type",
  "identity",
  "base",
  "feature",
  "if-feature",
  "rpc",
  "action",
  "notification",
  "input",
  "output",
  "anydata",
  "anyxml",
  "key",
  "unique",
  "config",
  "mandatory",
  "default",
  "units",
  "status",
  "presence",
  "ordered-by",
  "min-elements",
  "max-elements",
  "must",
  "when",
  "error-message",
  "error-app-tag",
  "pattern",
  "length",
  "range",
  "enum",
  "value",
  "bit",
  "position",
  "fraction-digits",
  "path",
  "require-instance",
  "extension",
  "argument",
  "deviation",
  "deviate",
  "refine",
  "belongs-to",
];

const YANG_TYPES =
  "string boolean int8 int16 int32 int64 uint8 uint16 uint32 uint64 decimal64 enumeration bits binary leafref identityref empty union instance-identifier";

const YANG_LITERALS = "true false current deprecated obsolete";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineYang(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const PREFIXED_ID = {
    className: "symbol",
    begin: /\b[a-zA-Z_][\w-]*:[a-zA-Z_][\w-]*/,
    relevance: 0,
  };

  return {
    name: "YANG",
    aliases: ["yang"],
    keywords: {
      $pattern: /[a-zA-Z][a-zA-Z0-9-]*/,
      keyword: YANG_KEYWORDS,
      type: YANG_TYPES,
      literal: YANG_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      PREFIXED_ID,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineYang(hljs);
}

export const yang = { name: "yang", register };
export default yang;
