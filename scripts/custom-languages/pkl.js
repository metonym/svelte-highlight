const PKL_KEYWORDS =
  "abstract amends as class const else extends external fixed for function hidden if import in is let local module new open out outer read super this throw trace typealias when";

// `unknown` (top) and `nothing` (bottom) are types, not values, so they sit
// here rather than in the literal table. `Bytes` arrived in Pkl 0.29.
const PKL_TYPES =
  "String Int Float Boolean Number Listing Mapping List Map Set Collection Pair Dynamic Object Class Module Null Any Duration DataSize " +
  "unknown nothing Regex IntSeq Typed TypeAlias Resource Bytes " +
  "Int8 Int16 Int32 UInt UInt8 UInt16 UInt32";

const PKL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePkl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F_]+\b/ },
      { begin: /\b0[oO][0-7_]+\b/ },
      { begin: /\b0[bB][01_]+\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  // Balances a plain `(...)` call/group nested inside an interpolation,
  // e.g. `\(items.size())`. Without this, INTERPOLATION's own `end: /\)/`
  // would match the nested call's closing paren instead of the
  // interpolation's.
  const NESTED_PARENS = {
    begin: /\(/,
    end: /\)/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\\\(/,
    end: /\)/,
    keywords: { keyword: PKL_KEYWORDS, literal: PKL_LITERALS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      NESTED_PARENS,
    ]),
  };

  // In a `#"..."#` string the escape prefix is `\#`, so `\(x)` is literal
  // text and `\#(x)` is the interpolation.
  const POUND_INTERPOLATION = {
    className: "subst",
    begin: /\\#\(/,
    end: /\)/,
    keywords: { keyword: PKL_KEYWORDS, literal: PKL_LITERALS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      NESTED_PARENS,
    ]),
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /"""/,
        end: /"""/,
        // INTERPOLATION must come first: its begin (`\(`) is a strict
        // subset of BACKSLASH_ESCAPE's generic `\<anything>`, so listing
        // the escape mode first would always win the tie and interpolation
        // would never fire.
        contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
      },
      { begin: /#"""/, end: /"""#/, contains: [POUND_INTERPOLATION] },
      { begin: /#"/, end: /"#/, contains: [POUND_INTERPOLATION] },
      {
        begin: /"/,
        end: /"/,
        contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
      },
    ],
  };

  const ANNOTATION = {
    className: "meta",
    begin: /@[a-zA-Z_][\w.]*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfunction/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  // `class Foo` / `typealias Foo`: the declared name, bounded to the one
  // identifier after the keyword.
  const CLASS = {
    begin: [/\b(?:class|typealias)\b/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.class" },
  };

  return {
    name: "Pkl",
    aliases: ["pkl"],
    keywords: {
      keyword: PKL_KEYWORDS,
      type: PKL_TYPES,
      literal: PKL_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ANNOTATION,
      STRING,
      FUNCTION,
      CLASS,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePkl(hljs);
}

export const pkl = { name: "pkl", register };
export default pkl;
