const ORG_TODO_WORDS = "TODO|DONE|NEXT|WAITING|CANCELLED";

// Every line-anchored rule uses `[ \t]*`, not `\s*`: hljs compiles regexes
// with the `m` flag, so `^\s*` also matches from the end of the previous
// (blank) line, which let a bullet or block start one line early and beat
// the headline rule for `* TODO ...` after an empty line.
function defineOrg() {
  const PRIORITY = {
    className: "meta",
    begin: /\[#[A-Z]\]/,
    relevance: 0,
  };

  const TAGS = {
    className: "symbol",
    begin: /:[\w@%]+(?::[\w@%]+)*:\s*$/,
    relevance: 0,
  };

  // The TODO keyword is only the word right after the stars; a bounded
  // multi-match keeps `* TODO Mark it DONE` from styling `DONE` as well.
  const HEADLINE_KEYWORD = {
    className: "section",
    begin: [/^\*+ /, new RegExp(`(?:${ORG_TODO_WORDS})\\b`)],
    beginScope: { 2: "keyword" },
    end: /$/,
    relevance: 10,
    contains: [PRIORITY, TAGS],
  };

  const HEADLINE = {
    className: "section",
    begin: /^\*+ /,
    end: /$/,
    relevance: 0,
    contains: [PRIORITY, TAGS],
  };

  // Any `#+KEYWORD:` line (`#+TITLE:`, `#+NAME:`, `#+CAPTION:`, `#+TBLFM:`,
  // `#+ATTR_HTML:`, `#+RESULTS[hash]:`, ...) is a keyword line.
  const META_LINE = {
    className: "meta",
    begin: /^#\+[A-Za-z_]+(?:\[[^\]\n]*\])?:/,
    relevance: 5,
  };

  // hljs rebuilds regexes from `.source`, so a per-regex `/i` flag is lost:
  // the case alternation is spelled out. Any `#+begin_NAME` block counts,
  // including verse, center, comment, and special blocks.
  const BLOCK = {
    className: "code",
    begin: /^[ \t]*#\+(?:begin|BEGIN)_\w+.*$/,
    end: /^[ \t]*#\+(?:end|END)_\w+/,
    relevance: 0,
  };

  const DRAWER_LINE = {
    className: "attr",
    begin: /^[ \t]*:[A-Za-z_][\w-]*:(?=\s|$)/,
    relevance: 0,
  };

  // A fixed-width line: `: literal text`.
  const FIXED_WIDTH_LINE = {
    className: "code",
    begin: /^[ \t]*:(?: .*)?$/,
    relevance: 0,
  };

  // A date, then optionally a day name, time or time range, and repeater
  // or warning cookies: `<2026-09-15 Mon 10:00-11:00 +1w -2d>`.
  const TIMESTAMP = {
    className: "number",
    begin: /[<[]\d{4}-\d{2}-\d{2}(?:\s[^\]>\n]*)?[\]>]/,
    relevance: 0,
  };

  const PLANNING_KEYWORD = {
    className: "keyword",
    begin: /\b(?:SCHEDULED|DEADLINE|CLOSED|CLOCK):/,
    relevance: 5,
  };

  // `src_lang{code}` and `src_lang[:header args]{code}`.
  const INLINE_SRC = {
    className: "code",
    begin: /\bsrc_[\w-]+(?:\[[^\]\n]*\])?\{/,
    end: /\}/,
    relevance: 0,
  };

  // LaTeX fragments: `\(x\)` and `\[y\]`.
  const LATEX_FRAGMENT = {
    className: "formula",
    variants: [
      { begin: /\\\(/, end: /\\\)/ },
      { begin: /\\\[/, end: /\\\]/ },
    ],
    relevance: 0,
  };

  // `{{{macro(args)}}}`.
  const MACRO = {
    className: "template-variable",
    begin: /\{\{\{[A-Za-z][\w-]*(?:\([^)\n]*\))?\}\}\}/,
    relevance: 0,
  };

  // `<<radio target>>` and `<<<radio target>>>`.
  const RADIO_TARGET = {
    className: "link",
    begin: /<<<?[^<>\n]+>>>?/,
    relevance: 0,
  };

  const LINK = {
    className: "link",
    begin: /\[\[/,
    end: /\]\]/,
    contains: [
      {
        className: "string",
        begin: /\]\[/,
        end: /(?=\]\])/,
        excludeBegin: true,
      },
    ],
    relevance: 0,
  };

  const FOOTNOTE = {
    className: "link",
    begin: /\[fn:[\w-]*\]/,
    relevance: 0,
  };

  const CHECKBOX = {
    className: "bullet",
    begin: /\[[ Xx-]\]/,
    relevance: 0,
  };

  const BULLET = {
    className: "bullet",
    begin: /^[ \t]*(?:[-+*]|\d+[.)])[ \t]/,
    relevance: 0,
  };

  const TABLE_PIPE = {
    className: "bullet",
    begin: /\|/,
    relevance: 0,
  };

  const COMMENT_LINE = {
    className: "comment",
    begin: /^[ \t]*#(?:[ \t].*)?$/,
    relevance: 0,
  };

  const BOLD = {
    className: "strong",
    begin: /\*\S([^\n*]*\S)?\*/,
    relevance: 0,
  };
  const ITALIC = {
    className: "emphasis",
    begin: /\/\S([^\n/]*\S)?\//,
    relevance: 0,
  };
  const UNDERLINE = {
    className: "emphasis",
    begin: /_\S([^\n_]*\S)?_/,
    relevance: 0,
  };
  const VERBATIM = {
    className: "code",
    begin: /=\S([^\n=]*\S)?=/,
    relevance: 0,
  };
  const CODE_TILDE = {
    className: "code",
    begin: /~\S([^\n~]*\S)?~/,
    relevance: 0,
  };
  const STRIKE = {
    className: "strong",
    begin: /\+\S([^\n+]*\S)?\+/,
    relevance: 0,
  };

  return {
    name: "Org",
    aliases: ["orgmode"],
    contains: [
      BLOCK,
      HEADLINE_KEYWORD,
      HEADLINE,
      META_LINE,
      COMMENT_LINE,
      DRAWER_LINE,
      FIXED_WIDTH_LINE,
      PLANNING_KEYWORD,
      TIMESTAMP,
      INLINE_SRC,
      LATEX_FRAGMENT,
      MACRO,
      RADIO_TARGET,
      LINK,
      FOOTNOTE,
      CHECKBOX,
      BULLET,
      TABLE_PIPE,
      BOLD,
      ITALIC,
      UNDERLINE,
      VERBATIM,
      CODE_TILDE,
      STRIKE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineOrg();
}

export const org = { name: "org", register };
export default org;
