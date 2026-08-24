const TRACEQL_KEYWORDS = "and or not by coalesce select";

const TRACEQL_AGGREGATORS =
  "count avg min max sum rate compare quantile_over_time";

const TRACEQL_INTRINSICS =
  "duration name status statusCode kind parent child rootName rootServiceName " +
  "traceDuration nestedSetLeft nestedSetRight nestedSetParent";

const TRACEQL_LITERALS = "true false nil error unset ok";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineTraceql(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  const COMMENT = hljs.HASH_COMMENT_MODE;

  const DURATION = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:ns|us|µs|ms|s|m|h)\b/,
    relevance: 5,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const SPANSET_OP = {
    className: "operator",
    begin: /&&|\|\||>>|<<|!~|=~|!=|>=|<=|~>|<~|[><=]/,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const ATTR = {
    className: "attr",
    begin:
      /(?:resource|span|trace|event|link)\.[\w./-]+|[a-zA-Z_]\w*(?=\s*(?:=~|!~|!=|>=|<=|=|>|<))/,
    relevance: 0,
  };

  return {
    name: "TraceQL",
    aliases: ["traceql"],
    keywords: {
      keyword: TRACEQL_KEYWORDS,
      built_in: `${TRACEQL_AGGREGATORS} ${TRACEQL_INTRINSICS}`,
      literal: TRACEQL_LITERALS,
    },
    contains: [COMMENT, STRING, DURATION, SPANSET_OP, PIPE, ATTR, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTraceql(hljs);
}

export const traceql = { name: "traceql", register };
export default traceql;
