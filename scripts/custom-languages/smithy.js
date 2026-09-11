const SMITHY_KEYWORDS = [
  "namespace",
  "use",
  "metadata",
  "apply",
  "service",
  "resource",
  "operation",
  "structure",
  "list",
  "map",
  "set",
  "union",
  "enum",
  "intEnum",
  "with",
  "for",
];

const SMITHY_TYPES =
  "blob boolean string byte short integer long float double bigInteger bigDecimal timestamp document";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSmithy(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const VERSION_CONTROL = {
    className: "meta",
    begin: /\$version:\s*"[^"]*"/,
    relevance: 10,
  };

  const DOC_COMMENT = {
    className: "comment",
    begin: /\/\/\//,
    end: /$/,
  };

  const TRAIT = {
    className: "meta",
    begin: /@[A-Za-z][\w.#]*/,
    relevance: 0,
  };

  const SHAPE_ID = {
    className: "symbol",
    begin: /\b[a-zA-Z_][\w.]*#[A-Za-z_]\w*(?:\$[A-Za-z_]\w*)?/,
    relevance: 0,
  };

  const INLINE_SHAPE = {
    className: "operator",
    begin: /:=/,
    relevance: 0,
  };

  // Smithy 2.0 elided members: `$cityId` inside a `for Resource` or mixin
  // structure body. `\B` keeps `Foo$count` (a member shape ID) as-is.
  const ELIDED_MEMBER = {
    className: "variable",
    begin: /\B\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  return {
    name: "Smithy",
    aliases: ["smithy"],
    keywords: {
      keyword: SMITHY_KEYWORDS,
      type: SMITHY_TYPES,
      literal: "true false null",
    },
    contains: [
      VERSION_CONTROL,
      DOC_COMMENT,
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      TRAIT,
      SHAPE_ID,
      INLINE_SHAPE,
      ELIDED_MEMBER,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSmithy(hljs);
}

export const smithy = { name: "smithy", register };
export default smithy;
