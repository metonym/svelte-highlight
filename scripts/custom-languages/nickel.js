const NICKEL_KEYWORDS =
  "let in if then else fun match import default doc optional priority force rec forall not";

const NICKEL_TYPES = "Number String Bool Array Dyn";

const NICKEL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineNickel(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  // Balances a bare `{...}` record literal nested inside an interpolation,
  // e.g. `%{ {name = "Bob"}.name }`. Without this, INTERPOLATION's own
  // `end: /\}/` would match the record literal's closing brace instead of
  // the interpolation's.
  const NESTED_BRACES = {
    begin: /\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /%\{/,
    end: /\}/,
    keywords: { keyword: NICKEL_KEYWORDS, literal: NICKEL_LITERALS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      NESTED_BRACES,
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /m%%%"/, end: /"%%%/, contains: [INTERPOLATION] },
      { begin: /m%%"/, end: /"%%/, contains: [INTERPOLATION] },
      { begin: /m%"/, end: /"%/, contains: [INTERPOLATION] },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const ENUM_TAG = {
    className: "symbol",
    begin: /'[A-Za-z_]\w*/,
    relevance: 0,
  };

  const META = {
    className: "meta",
    begin: /\b(?:std|builtin)\b/,
    relevance: 0,
  };

  const RECORD_FIELD = {
    begin: [/[A-Za-z_][\w-]*/, /\s*/, /=(?!=)/],
    beginScope: { 1: "attr", 3: "operator" },
    relevance: 0,
  };

  // `let x = ...` uses the same `identifier = value` surface syntax as a
  // record field, so RECORD_FIELD above can't tell them apart on its own.
  // Matching `let` together with the bound name (starting earlier than
  // RECORD_FIELD's own match on just the name) lets this mode claim the
  // name first, styling it as a binding rather than a record key.
  const LET_BINDING = {
    begin: [/\blet\b/, /\s+/, /[A-Za-z_][\w-]*/],
    beginScope: { 1: "keyword", 3: "variable" },
    relevance: 0,
  };

  return {
    name: "Nickel",
    aliases: ["nickel", "ncl"],
    keywords: {
      keyword: NICKEL_KEYWORDS,
      type: NICKEL_TYPES,
      literal: NICKEL_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      LET_BINDING,
      RECORD_FIELD,
      STRING,
      ENUM_TAG,
      META,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineNickel(hljs);
}

export const nickel = { name: "nickel", register };
export default nickel;
