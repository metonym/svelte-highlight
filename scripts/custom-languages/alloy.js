// Quantifier/logic keywords (all, some, no, lone, one, disj, implies, iff, and,
// or, not, for, exactly) are distinctive enough on their own. `module`, `open`,
// `abstract`, `extends`, and `in` are also Agda keywords, so they're marked
// `|0` here and detection instead rests on the `sig`/`pred`/`fun`/`assert`
// structural anchors below.
const ALLOY_KEYWORDS =
  "sig pred fun assert check run fact " +
  "module|0 open|0 abstract|0 extends|0 in|0 " +
  "all some no lone one disj let implies iff and or not for exactly";

const IDENT_RE = /[A-Za-z_][A-Za-z0-9_']*/;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAlloy(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `sig Name {}`, `sig Name extends Other {}`, `abstract sig Name {}` - the
  // structural anchor that carries relevance; the shared words above don't.
  const SIG_HEADER = {
    begin: [/\b(?:abstract\s+)?sig\s+/, IDENT_RE],
    beginScope: { 2: "title.class" },
    relevance: 5,
  };

  // `pred Name[...] {}`, `fun Name[...] : Type {}`.
  const PRED_FUN_HEADER = {
    begin: [/\b(?:pred|fun)\s+/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 5,
  };

  // `assert Name {}`.
  const ASSERT_HEADER = {
    begin: [/\bassert\s+/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 5,
  };

  // Longest first: `<=>` before `=>`; `<:`/`:>` before a bare `:` (unused
  // elsewhere); `++` before `+`; `!in` and `!=` before a bare `!` (unused);
  // `->` before `-`.
  const OPERATOR = {
    className: "operator",
    begin: /<=>|=>|<:|:>|\+\+|!=|!in\b|->|~|\^|\*|#|=|\+|-|&|\./,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  return {
    name: "Alloy",
    aliases: ["als"],
    keywords: ALLOY_KEYWORDS,
    contains: [
      hljs.COMMENT(/--/, /$/),
      hljs.COMMENT(/\/\//, /$/),
      hljs.COMMENT(/\/\*/, /\*\//),
      STRING,
      SIG_HEADER,
      PRED_FUN_HEADER,
      ASSERT_HEADER,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineAlloy(hljs);
}

export const alloy = { name: "alloy", register };
export default alloy;
