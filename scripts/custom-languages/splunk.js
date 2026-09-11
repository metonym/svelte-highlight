const SPLUNK_COMMANDS =
  "search stats eval where rex table sort head tail rename fields dedup lookup join append union " +
  "transaction timechart chart top rare fillnull convert bin eventstats streamstats regex " +
  "fieldsummary inputlookup outputlookup makeresults collect multisearch " +
  "tstats mstats foreach mvexpand mvcombine makemv nomv spath xpath xmlkv kv extract " +
  "from datamodel pivot appendcols appendpipe addtotals addcoltotals addinfo delta accum " +
  "autoregress iplocation geostats bucket rangemap strcat transpose untable xyseries " +
  "fieldformat filldown erex loadjob metadata metasearch rest sendemail savedsearch " +
  "inputcsv outputcsv reverse selfjoin makecontinuous trendline predict cluster kmeans " +
  "anomalydetection eventcount dbinspect localop";

// SPL clause words are case-insensitive: `stats count AS hits BY host` and
// `stats count as hits by host` are the same search.
const SPLUNK_BOOLEAN =
  "AND OR NOT XOR by BY as AS in IN OUTPUT OUTPUTNEW output outputnew";

const SPLUNK_FUNCTIONS =
  "count sum avg min max values list distinct_count earliest latest now strftime strptime if case " +
  "coalesce len substr upper lower trim replace split mvindex mvcount tostring tonumber round abs " +
  "dc estdc median mode perc range stdev stdevp var varp sumsq first last " +
  "like match searchmatch cidrmatch isnull isnotnull isnum isstr isint nullif " +
  "mvjoin mvfilter mvfind mvzip mvappend mvdedup mvsort mvrange mvmap " +
  "json_extract json_object json_array md5 sha1 sha256 sha512 typeof relative_time " +
  "urldecode ltrim rtrim ceiling floor exp ln log pow sqrt random pi printf validate";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSplunk(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Relative time modifiers (`-24h@h`, `span=15m`, `earliest=-7d@d+1h`)
  // come before plain numbers so `15m` is not split into `15` and `m`.
  const NUMBER = {
    className: "number",
    variants: [
      {
        begin:
          /-?\b\d+(?:ms|us|s|sec|secs|m|min|mins|h|hr|hrs|d|day|days|w|week|weeks|mon|month|months|q|qtr|qtrs|y|yr|yrs)\b(?:@[a-z]+\d*)?/,
      },
      { begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  // ``` ... ``` is SPL's comment syntax (Splunk 8.x+); `#` only comments
  // inside dashboard XML and conf files.
  const COMMENT = hljs.COMMENT(/```/, /```/);

  // Search macros: `my_macro(web, 5)`. The whole call, arguments included,
  // is expanded before the search runs, so it is styled as one token.
  const MACRO = {
    className: "symbol",
    begin: /`[^`\n]*`/,
    relevance: 5,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const COMPARISON = {
    className: "operator",
    begin: />=|<=|!=|=|>|</,
    relevance: 0,
  };

  // Search terms and eval assignments: index=web, error_rate=
  const FIELD = {
    className: "attr",
    begin: /\b[a-zA-Z_][\w.]*(?==)/,
    relevance: 0,
  };

  return {
    name: "SPL",
    aliases: ["splunk", "spl"],
    keywords: {
      keyword: `${SPLUNK_COMMANDS} ${SPLUNK_BOOLEAN}`,
      built_in: SPLUNK_FUNCTIONS,
    },
    contains: [
      COMMENT,
      MACRO,
      hljs.HASH_COMMENT_MODE,
      STRING,
      PIPE,
      FIELD,
      COMPARISON,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSplunk(hljs);
}

export const splunk = { name: "splunk", register };
export default splunk;
