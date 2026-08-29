const SPLUNK_COMMANDS =
  "search stats eval where rex table sort head tail rename fields dedup lookup join append union " +
  "transaction timechart chart top rare fillnull convert bin eventstats streamstats regex " +
  "fieldsummary inputlookup outputlookup makeresults collect multisearch";

const SPLUNK_BOOLEAN = "AND OR NOT XOR by";

const SPLUNK_FUNCTIONS =
  "count sum avg min max values list distinct_count earliest latest now strftime strptime if case " +
  "coalesce len substr upper lower trim replace split mvindex mvcount tostring tonumber round abs";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSplunk(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
    relevance: 0,
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
    contains: [hljs.HASH_COMMENT_MODE, STRING, PIPE, FIELD, COMPARISON, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSplunk(hljs);
}

export const splunk = { name: "splunk", register };
export default splunk;
