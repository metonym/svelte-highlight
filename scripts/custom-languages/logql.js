const LOGQL_KEYWORDS = "by without and or unless";

const LOGQL_PARSERS = "json logfmt regexp pattern unpack unwrap";

const LOGQL_LINE_FILTERS = "line_format label_format decolorize drop keep";

const LOGQL_AGGREGATORS = "sum min max avg stddev stdvar count topk bottomk";

const LOGQL_FUNCTIONS =
  "rate rate_counter count_over_time bytes_over_time bytes_rate absent_over_time avg_over_time min_over_time max_over_time sum_over_time stddev_over_time stdvar_over_time quantile_over_time first_over_time last_over_time";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLogQL(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b\d+(?:\.\d+)?(?:ms|[smhdwy])\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const DURATION = {
    className: "number",
    begin: /\[\s*\d+(?:\.\d+)?(?:ms|[smhdwy])\s*\]/,
    relevance: 10,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  const LABEL = {
    className: "attr",
    begin: /[a-zA-Z_]\w*(?=\s*(?:=~|!~|!=|=))/,
    relevance: 0,
  };

  const PIPELINE_OPERATOR = {
    className: "operator",
    begin: /\|[=~]|!~|!=/,
    relevance: 0,
  };

  const PIPE_STAGE = {
    className: "keyword",
    begin:
      /\|(?=\s*(?:json|logfmt|regexp|pattern|unpack|unwrap|line_format|label_format|decolorize|drop|keep)\b)/,
    relevance: 0,
  };

  return {
    name: "LogQL",
    aliases: ["logql"],
    case_insensitive: false,
    keywords: {
      keyword: `${LOGQL_KEYWORDS} ${LOGQL_PARSERS} ${LOGQL_LINE_FILTERS}`,
      built_in: `${LOGQL_AGGREGATORS} ${LOGQL_FUNCTIONS}`,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      DURATION,
      STRING,
      PIPELINE_OPERATOR,
      PIPE_STAGE,
      LABEL,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLogQL(hljs);
}

export const logql = { name: "logql", register };
export default logql;
