const KDL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKdl(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /r#+"/, end: /"#+/ },
    ],
  };

  const HASH_LITERAL = {
    className: "literal",
    begin: /#(?:true|false|null|inf|-inf|nan)\b/,
    relevance: 5,
  };

  const TYPE_ANNOTATION = {
    className: "type",
    begin: /\([A-Za-z_][\w.-]*\)/,
    relevance: 0,
  };

  const PROPERTY = {
    className: "attr",
    begin: /[A-Za-z_][\w.-]*(?==)/,
    relevance: 0,
  };

  // `/- node` and `/-{ ... }` slashdash comments. Line-oriented is enough
  // to keep the token from looking like a path.
  const SLASHDASH = {
    className: "comment",
    begin: /\/-/,
    end: /$/,
    relevance: 5,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0x[0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?\b/ },
      { begin: /\b0o[0-7](?:[0-7_]*[0-7])?\b/ },
      { begin: /\b0b[01](?:[01_]*[01])?\b/ },
      {
        begin:
          /[+-]?\b\d(?:[\d_]*\d)?(?:\.\d(?:[\d_]*\d)?)?(?:[eE][+-]?\d(?:[\d_]*\d)?)?\b/,
      },
    ],
    relevance: 0,
  };

  const NODE = {
    className: "title.function",
    begin: /\b(?!(?:true|false|null)\b)[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  return {
    name: "KDL",
    aliases: ["kdl"],
    keywords: { literal: KDL_LITERALS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      SLASHDASH,
      HASH_LITERAL,
      TYPE_ANNOTATION,
      STRING,
      PROPERTY,
      NUMBER,
      NODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineKdl(hljs);
}

export const kdl = { name: "kdl", register };
export default kdl;
