const TYPESPEC_KEYWORDS = [
  "import",
  "using",
  "namespace",
  "model",
  "op",
  "interface",
  "enum",
  "union",
  "scalar",
  "alias",
  "extends",
  "is",
  "extern",
  "dec",
  "fn",
  "projection",
  "valueof",
  "never",
  "unknown",
  "void",
];

const TYPESPEC_LITERALS = "null true false";

const TYPESPEC_TYPES =
  "string int8 int16 int32 int64 uint8 uint16 uint32 uint64 integer float32 float64 numeric boolean bytes plainDate plainTime utcDateTime offsetDateTime duration url Record Array";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineTypeSpec(hljs) {
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
      { begin: /"/, end: /"/ },
    ],
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const DECORATOR = {
    className: "meta",
    begin: /@[A-Za-z][\w]*/,
    relevance: 5,
  };

  const SPREAD = {
    className: "operator",
    begin: /\.\.\./,
    relevance: 0,
  };

  const OPTIONAL = {
    className: "operator",
    begin: /\?/,
    relevance: 0,
  };

  return {
    name: "TypeSpec",
    aliases: ["tsp"],
    keywords: {
      keyword: TYPESPEC_KEYWORDS,
      literal: TYPESPEC_LITERALS,
      type: TYPESPEC_TYPES,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      DECORATOR,
      SPREAD,
      OPTIONAL,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTypeSpec(hljs);
}

export const typespec = { name: "typespec", register };
export default typespec;
