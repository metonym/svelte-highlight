// `with` introduces query hints such as `with (most_recent=true)` (Tempo 2.7).
const TRACEQL_KEYWORDS = "and or not by coalesce select with";

// Metrics queries (Tempo 2.4+): the `*_over_time` family, `histogram_over_time`,
// `topk`/`bottomk`.
const TRACEQL_AGGREGATORS =
  "count avg min max sum rate compare quantile_over_time " +
  "count_over_time min_over_time max_over_time avg_over_time sum_over_time " +
  "histogram_over_time topk bottomk";

const TRACEQL_INTRINSICS =
  "duration name status statusCode statusMessage kind parent child childCount " +
  "rootName rootServiceName traceDuration nestedSetLeft nestedSetRight " +
  "nestedSetParent";

// Status values and the span-kind enum (`kind = server`).
const TRACEQL_LITERALS =
  "true false nil error unset ok server client producer consumer internal";

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

  // Go-style durations, including compound ones (`1m30s`).
  const DURATION = {
    className: "number",
    begin: /\b(?:\d+(?:\.\d+)?(?:ns|us|µs|ms|s|m|h))+\b/,
    relevance: 5,
  };

  // Includes the leading-dot form used for quantiles (`.99`).
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\.\d+\b/,
    relevance: 0,
  };

  // Structural operators come in plain (`>>`), negated (`!>>`), and union
  // (`&>>`) forms, plus the sibling operator `~`.
  const SPANSET_OP = {
    className: "operator",
    begin: /&&|\|\||!~|=~|!=|>=|<=|[!&]?(?:>>|<<|~|>|<)|~>|<~|=/,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  // Scoped attributes (`span.http.method`), scoped intrinsics
  // (`span:duration`, `trace:rootName`, `event:name`, `link:traceID`,
  // `instrumentation:name`, Tempo 2.6+), `parent.`-scoped attributes,
  // unscoped `.attr` lookups, and bare intrinsics in front of a comparison.
  const ATTR = {
    className: "attr",
    begin:
      /(?:resource|span|trace|event|link|instrumentation|parent)[.:][\w./-]+|\.[a-zA-Z_][\w./-]*|[a-zA-Z_]\w*(?=\s*(?:=~|!~|!=|>=|<=|=|>|<))/,
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
