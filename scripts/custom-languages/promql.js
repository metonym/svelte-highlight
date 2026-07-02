const PROMQL_AGGREGATORS =
  "sum min max avg group stddev stdvar count count_values bottomk topk quantile limitk limit_ratio";

const PROMQL_KEYWORDS =
  "by without on ignoring group_left group_right offset bool and or unless";

const PROMQL_FUNCTIONS =
  "abs absent absent_over_time ceil changes clamp clamp_max clamp_min day_of_month day_of_week day_of_year days_in_month delta deriv exp floor histogram_quantile histogram_count histogram_sum histogram_fraction holt_winters hour idelta increase irate label_join label_replace ln log2 log10 minute month predict_linear rate resets round scalar sgn sort sort_desc sqrt time timestamp vector year avg_over_time min_over_time max_over_time sum_over_time count_over_time quantile_over_time stddev_over_time stdvar_over_time last_over_time present_over_time mad_over_time";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePromQL(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b\d+(?:\.\d+)?(?:ms|[smhdwy])\b/ },
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
      { begin: /\b(?:Inf|NaN)\b/ },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  const LABEL = {
    className: "attr",
    begin: /[a-zA-Z_]\w*(?=\s*(?:=~|!~|=|!=))/,
    relevance: 0,
  };

  // A bare identifier that isn't a recognized keyword/aggregator/function is
  // a metric name. The negative lookahead defers those words to the
  // top-level `keywords` scan so `offset`, `by`, `sum`, etc. keep their own
  // classification instead of always being tagged as a metric.
  const RESERVED_WORDS =
    `${PROMQL_KEYWORDS} ${PROMQL_AGGREGATORS} ${PROMQL_FUNCTIONS}`
      .trim()
      .split(/\s+/)
      .join("|");

  const METRIC = {
    className: "built_in",
    begin: new RegExp(
      `\\b(?!(?:${RESERVED_WORDS})\\b)[a-zA-Z_:][a-zA-Z0-9_:]*\\b`,
    ),
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /==|!=|>=|<=|=~|!~|[+\-*/%^=><]/,
    relevance: 0,
  };

  // `@` timestamp modifier: `@ 1609746000`, `@ start()`, `@ end()`
  const TIMESTAMP = {
    className: "operator",
    begin: /@/,
    relevance: 0,
  };

  return {
    name: "PromQL",
    aliases: ["promql"],
    keywords: {
      keyword: PROMQL_KEYWORDS,
      built_in: `${PROMQL_AGGREGATORS} ${PROMQL_FUNCTIONS}`,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      LABEL,
      TIMESTAMP,
      OPERATOR,
      METRIC,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePromQL(hljs);
}

export const promql = { name: "promql", register };
export default promql;
