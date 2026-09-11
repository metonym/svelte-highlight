const FLUX_KEYWORDS =
  "import package option builtin return if then else exists and or not in testcase";

const FLUX_LITERALS = "true false";

const FLUX_FUNCTIONS =
  "from range filter group mean sum count map reduce yield window aggregateWindow pivot join union sort limit first last unique distinct drop keep rename set to duplicate fill shift derivative difference increase cumulativeSum movingAverage stddev spread skew quantile histogram covariance pearsonr linearRegression holtWinters tail top bottom sample shift timeShift truncateTimeColumn integral elapsed histogramQuantile stateTracking stateDuration stateCount findColumn findRecord getColumn getRecord columns tableFind";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFlux(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: {
      keyword: FLUX_KEYWORDS,
      literal: FLUX_LITERALS,
      built_in: FLUX_FUNCTIONS,
    },
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const DURATION = {
    className: "number",
    begin: /-?\b(?:\d+(?:ns|us|µs|ms|mo|y|w|d|h|m|s))+\b/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:\d{2})?)?\b/ },
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  // Only after `=~` / `!~`. A bare `/` is division and used to swallow the
  // rest of the file as a regexp (`r._value / 2.0 > 10`). Consume the
  // operator as its own begin-group so we don't need a lookbehind, and
  // keep it outside the regexp span.
  const REGEXP = {
    begin: [/(?:=~|!~)/, /\s*/, /\/(?![*/])(?:\\.|[^\\/])*\/[a-z]*/],
    beginScope: { 1: "operator", 3: "regexp" },
    relevance: 0,
  };

  const PIPE_FORWARD = {
    className: "operator",
    begin: /\|>/,
    relevance: 10,
  };

  const ARROW = {
    className: "operator",
    begin: /=>/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /==|!=|>=|<=|=~|!~|:=|[+\-*/%<>=]/,
    relevance: 0,
  };

  const PARAM = {
    className: "params",
    begin: /\b[a-zA-Z_]\w*(?=\s*:)/,
    relevance: 0,
  };

  const IDENTIFIER = {
    className: "title.function.invoke",
    begin: /\b[a-zA-Z_]\w*(?=\s*\()/,
    relevance: 0,
  };

  return {
    name: "Flux",
    aliases: ["flux", "fluxlang"],
    keywords: {
      keyword: FLUX_KEYWORDS,
      literal: FLUX_LITERALS,
      built_in: FLUX_FUNCTIONS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      DURATION,
      NUMBER,
      REGEXP,
      PIPE_FORWARD,
      ARROW,
      OPERATOR,
      PARAM,
      IDENTIFIER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineFlux(hljs);
}

export const flux = { name: "flux", register };
export default flux;
