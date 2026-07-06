const KQL_KEYWORDS =
  "where project extend summarize join order by take limit distinct top sort render let union parse evaluate as asc desc nulls first last on kind hint.strategy hint.shufflekey with withsource step from to";

const KQL_HYPHENATED_KEYWORDS = [
  "mv-expand",
  "mv-apply",
  "parse-where",
  "parse-kv",
];

const KQL_OPERATORS =
  "and or not has has_cs !has has_all has_any hasprefix hasprefix_cs hassuffix hassuffix_cs contains contains_cs !contains !contains_cs startswith startswith_cs !startswith endswith endswith_cs !endswith in in~ !in !in~ between !between matches regex";

const KQL_FUNCTIONS =
  "count countif sum sumif avg avgif min minif max maxif dcount dcountif percentile percentiles stdev variance make_list make_set make_bag arg_max arg_min any anyif ago now startofday startofweek startofmonth startofyear endofday endofweek endofmonth endofyear datetime_add datetime_part datetime_diff dayofweek dayofyear weekofyear strcat strcat_delim strlen strrep tolower toupper trim trim_start trim_end split strcat_array substring indexof replace replace_string replace_regex reverse bin bin_at floor ceiling round abs sign sqrt pow log log2 log10 exp exp2 exp10 datetime timespan totimespan todatetime tostring toint tolong toreal todouble toboolean tobool todecimal parse_json parse_xml parse_csv parse_url parse_urlquery iff iif case coalesce isnull isnotnull isempty isnotempty notnull toscalar materialize array_length array_concat array_index_of array_slice bag_keys pack pack_array pack_dictionary range repeat format_datetime format_timespan unixtime_seconds_todatetime unixtime_milliseconds_todatetime";

const KQL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKql(hljs) {
  const STRING = {
    className: "string",
    variants: [
      {
        begin: /@"/,
        end: /"/,
      },
      {
        begin: /@'/,
        end: /'/,
      },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const TIMESPAN = {
    className: "number",
    begin:
      /\b\d+(?:\.\d+)?(?:tick|microsecond|millisecond|second|minute|hour|day|d|h|m|s|ms)\b/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const DATETIME_FUNC = {
    className: "built_in",
    begin: /\b(?:datetime|timespan)(?=\s*\()/,
    relevance: 0,
  };

  const FUNCTION = {
    className: "built_in",
    begin:
      /\b(?!and\b|or\b|not\b|has\b|has_cs\b|has_all\b|has_any\b|hasprefix\b|hasprefix_cs\b|hassuffix\b|hassuffix_cs\b|contains\b|contains_cs\b|startswith\b|startswith_cs\b|endswith\b|endswith_cs\b|in\b|between\b|matches\b|regex\b)[A-Za-z_]\w*(?=\()/,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const HYPHENATED_KEYWORD = {
    className: "keyword",
    begin: new RegExp(`\\b(?:${KQL_HYPHENATED_KEYWORDS.join("|")})\\b`),
    relevance: 0,
  };

  const LET = {
    begin: /\blet\b/,
    end: /=/,
    excludeEnd: true,
    keywords: { keyword: "let" },
    contains: [
      {
        className: "variable",
        begin: /\b[A-Za-z_]\w*\b/,
        relevance: 0,
      },
    ],
  };

  return {
    name: "KQL",
    aliases: ["kql", "kusto"],
    case_insensitive: false,
    keywords: {
      $pattern: "[\\w.]+",
      keyword: KQL_KEYWORDS,
      operator: KQL_OPERATORS,
      built_in: KQL_FUNCTIONS,
      literal: KQL_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      LET,
      PIPE,
      HYPHENATED_KEYWORD,
      DATETIME_FUNC,
      FUNCTION,
      TIMESPAN,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineKql(hljs);
}

export const kql = { name: "kql", register };
export default kql;
