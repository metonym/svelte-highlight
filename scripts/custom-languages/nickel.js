const NICKEL_KEYWORDS =
  "let in if then else fun match import default doc optional priority force not_exported rec forall not";

// Words that RECORD_FIELD must leave to the keyword table even when an `=`
// follows: metadata keywords (`| default = "web"`) and type names in an
// annotated field (`port : Number = 8080`).
const NICKEL_NOT_A_FIELD =
  /(?!(?:default|doc|optional|priority|force|not_exported|Number|String|Bool|Array|Dyn)\b)/;

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

  // The `=` must not be the start of `==` or of a `=>` arrow, or every
  // `fun p =>` parameter and `match` arm pattern would become a field.
  const RECORD_FIELD = {
    begin: [
      // The `\b` keeps the excluded words from matching one character in
      // (`d` + `efault`).
      new RegExp(
        String.raw`\b` + NICKEL_NOT_A_FIELD.source + /[A-Za-z_][\w-]*/.source,
      ),
      /\s*/,
      /=(?![=>])/,
    ],
    beginScope: { 1: "attr", 3: "operator" },
    relevance: 0,
  };

  // `let x = ...` uses the same `identifier = value` surface syntax as a
  // record field, so RECORD_FIELD above can't tell them apart on its own.
  // Matching `let` together with the bound name (starting earlier than
  // RECORD_FIELD's own match on just the name) lets this mode claim the
  // name first, styling it as a binding rather than a record key.
  // `let rec f = ...` (recursive bindings, Nickel 1.x): `rec` is a keyword,
  // not the bound name. The `\b` keeps `let recurse = ...` whole.
  const LET_BINDING = {
    begin: [/\blet\b/, /\s+/, /(?:rec\b)?/, /\s*/, /[A-Za-z_][\w-]*/],
    beginScope: { 1: "keyword", 3: "keyword", 5: "variable" },
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
