// F*'s surface syntax (`let rec`, `type`, `in`, `fun`, `match ... with`) is
// near-identical to OCaml's, which ships as an hljs builtin. Those generic
// ML keywords are marked `|0` here - detection instead rests on the
// contract/effect vocabulary (requires, ensures, Lemma, squash, noeq, and
// the other attributes below) that OCaml doesn't have.
// Given raised relevance so a Lemma/requires/ensures-bearing sample clearly
// outscores plain OCaml, which otherwise earns its own relevance bonus from
// the generic `let rec`/`type ... = { }` shapes F* shares with it.
const FSTAR_KEYWORDS =
  "noeq|3 unfold|2 irreducible|2 inline_for_extraction|2 total|2 ghost|2 admit|2 " +
  "assume|2 assert|2 requires|3 ensures|3 decreases|2 reflectable|2 reifiable|2 " +
  "let|0 rec|0 and|0 in|0 fun|0 match|0 with|0 type|0 val|0 module|0 open|0 private|0 abstract|0 as|0 if|0 then|0 else|0";

const FSTAR_LITERALS = "true false";

// The effect vocabulary: distinctive to F*, not shared with OCaml.
const FSTAR_BUILT_INS =
  "Tot|2 GTot|3 Lemma|4 Dv|2 ML|2 Pure|3 Ghost|3 squash|4";

const IDENT_RE = /[A-Za-z_][A-Za-z0-9_']*/;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFStar(hljs) {
  // Nested `(* *)` comments recurse via "self" - hljs.COMMENT alone does not
  // nest. Same pattern as lean.js/agda.js's NESTED_COMMENT.
  const NESTED_COMMENT = {
    className: "comment",
    begin: /\(\*/,
    end: /\*\)/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `val name :` and `let (rec )?name` headers scope the declared name -
  // they don't raise relevance, since both forms exist in plain OCaml too
  // (`.mli` val declarations, ordinary `let` bindings).
  const VAL_HEADER = {
    begin: [/\bval\s+/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  const LET_HEADER = {
    begin: [/\blet\s+(?:rec\s+)?/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  // `[@@ ... ]` attributes, e.g. `[@@expect_failure]`.
  const ATTRIBUTE = {
    className: "meta",
    begin: /\[@@/,
    end: /\]/,
    relevance: 0,
  };

  // Longest first: `<==>` before `==>`; `|>`/`<|` before a bare `|`/`<`
  // (unused elsewhere); `->` before `-`; `<-` before `-`.
  const OPERATOR = {
    className: "operator",
    begin: /<==>|==>|\/\\|\\\/|~|\|>|<\||->|<-|==|<>|@/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/,
    relevance: 0,
  };

  return {
    name: "F*",
    aliases: ["fst", "fsti"],
    keywords: {
      keyword: FSTAR_KEYWORDS,
      literal: FSTAR_LITERALS,
      built_in: FSTAR_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/\/\//, /$/),
      NESTED_COMMENT,
      ATTRIBUTE,
      VAL_HEADER,
      LET_HEADER,
      STRING,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineFStar(hljs);
}

export const fstar = { name: "fstar", register };
export default fstar;
