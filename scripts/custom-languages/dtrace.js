const DTRACE_BUILT_INS =
  "trace printf printa stack ustack exit copyin copyinstr stringof strlen strjoin basename dirname lltostr tolower toupper speculate commit discard panic chill raise stop system count sum avg min max quantize lquantize llquantize stddev trunc normalize";

const DTRACE_VARS =
  "execname pid tid uid timestamp vtimestamp walltimestamp probefunc probename probemod probeprov args curthread curpsinfo errno self this";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineDtrace(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const PROBE = {
    className: "title.function",
    begin: /\b[A-Za-z_][\w$-]*(?::[\w$*-]*){3}/,
    relevance: 10,
  };

  const SPECIAL_PROBE = {
    className: "title.function",
    begin: /\b(?:BEGIN|END|ERROR)\b/,
    relevance: 10,
  };

  const PROFILE_PROBE = {
    className: "title.function",
    begin: /\b(?:tick|profile)-\d+\w*/,
    relevance: 8,
  };

  const DOLLAR_VAR = {
    className: "variable.language",
    begin: /\$(?:target|\d+)/,
    relevance: 5,
  };

  const ARG_VAR = {
    className: "variable.language",
    begin: /\barg[0-9]\b/,
    relevance: 5,
  };

  const PRAGMA = {
    className: "meta",
    begin: /#pragma\s+D\s+option[^\n]*/,
  };

  // No forward lookahead for the matching `/` and `{`: a predicate's `/` and
  // its closing brace routinely sit on separate lines (probe on one line,
  // predicate on the next, `{` on the one after), and a lookahead spanning
  // that gap can only resolve once text past the boundary is visible -
  // exactly the checkpoint/resume windowed-rendering pitfall documented in
  // tokenized-document.js (a window that ends between the two would see a
  // different result than one that doesn't, even without checkpointing).
  // Anchoring on line-start is sufficient: a `/` opening a line is always a
  // predicate in D script syntax, and comment modes earlier in `contains`
  // already claim `//`/`/*` at that same position.
  const PREDICATE = {
    className: "meta",
    begin: /^[ \t]*\//,
    end: /\//,
    relevance: 0,
  };

  const AGGREGATION = {
    className: "variable",
    begin: /@[A-Za-z_]\w*/,
    relevance: 0,
  };

  return {
    name: "DTrace",
    aliases: ["dtrace-script"],
    keywords: {
      keyword: "inline translator typedef",
      built_in: DTRACE_BUILT_INS,
      "variable.language": DTRACE_VARS,
    },
    contains: [
      hljs.SHEBANG({ binary: "dtrace" }),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PRAGMA,
      STRING,
      SPECIAL_PROBE,
      PROFILE_PROBE,
      PROBE,
      PREDICATE,
      DOLLAR_VAR,
      ARG_VAR,
      AGGREGATION,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDtrace(hljs);
}

export const dtrace = { name: "dtrace", register };
export default dtrace;
