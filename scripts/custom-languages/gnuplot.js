const GNUPLOT_KEYWORDS =
  "plot splot replot refresh set unset show if else do while fit load call reset print pause save reread history help exit quit cd pwd system shell test update bind eval stats undefine raise lower eq ne";

const GNUPLOT_BUILT_INS =
  "sin cos tan asin acos atan atan2 exp log log10 sqrt abs floor ceil int sgn erf erfc gamma lgamma norm invnorm rand real imag arg besj0 besj1 besy0 besy1 lambertw column defined exists stringcolumn timecolumn valid word words strlen strstrt substr sprintf gprintf";

// Sub-option words that only mean something right after set/unset/show;
// shared with too many other config-style languages to carry relevance
// on their own (CONTRIBUTING.md's "give shared words relevance 0" rule).
const GNUPLOT_SET_OPTIONS =
  "terminal output xlabel ylabel zlabel x2label y2label cblabel title style xrange yrange zrange cbrange key grid logscale autoscale border arrow label format palette pm3d contour clip datafile encoding multiplot margin lmargin rmargin tmargin bmargin mapping polar parametric samples isosamples pointsize dgrid3d hidden3d view tics xtics ytics ztics mxtics mytics";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGnuplot(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      {
        begin: /'/,
        end: /'/,
        contains: [{ begin: /''/, relevance: 0 }],
      },
      // Backquote command substitution runs a shell command and splices
      // its output into the gnuplot command line.
      { className: "subst", begin: /`/, end: /`/ },
    ],
  };

  // `set`/`unset`/`show` followed by a recognized option word, e.g.
  // `set xlabel "time"` or `unset key`.
  const SET_OPTION = {
    className: "attr",
    begin: new RegExp(`\\b(?:${GNUPLOT_SET_OPTIONS.split(" ").join("|")})\\b`),
    relevance: 0,
  };

  // `@name` macro expansion (requires `set macros`).
  const MACRO = {
    className: "variable",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  // `$Name` datablock identifier (gnuplot 5+ inline heredoc data).
  const DATABLOCK = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  // Longest operators first so `**` isn't lexed as two `*`s, etc.
  const OPERATOR = {
    className: "operator",
    begin: /\*\*|==|!=|<=|>=|&&|\|\||<<|>>|[&|^!?:.]/,
    relevance: 0,
  };

  return {
    name: "Gnuplot",
    aliases: ["gp", "plt", "gnu"],
    keywords: {
      keyword: GNUPLOT_KEYWORDS,
      built_in: GNUPLOT_BUILT_INS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      SET_OPTION,
      MACRO,
      DATABLOCK,
      NUMBER,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGnuplot(hljs);
}

export const gnuplot = { name: "gnuplot", register };
export default gnuplot;
