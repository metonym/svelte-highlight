function defineDjot() {
  const HEADING = {
    className: "section",
    begin: /^#{1,6}(?=\s)/,
    end: /$/,
    relevance: 0,
  };

  const THEMATIC_BREAK = {
    className: "meta",
    // Three or more marks, optionally separated by spaces: `* * *`, `- - -`.
    begin: /^(?:\*(?:[ \t]*\*){2,}|-(?:[ \t]*-){2,})[ \t]*$/,
    relevance: 0,
  };

  const FENCED_DIV = {
    className: "meta",
    begin: /^:::+\s*\S*\s*$/,
    relevance: 5,
  };

  const CODE_FENCE = {
    className: "code",
    begin: /^```+.*$/,
    end: /^```+\s*$/,
    relevance: 0,
  };

  const BLOCKQUOTE = {
    className: "quote",
    begin: /^>/,
    relevance: 0,
  };

  const DEF_LIST_MARKER = {
    className: "bullet",
    begin: /^:(?=\s)/,
    relevance: 0,
  };

  const TASK_CHECKBOX = {
    className: "bullet",
    begin: /\[[ xX]\]/,
    relevance: 0,
  };

  // Enumerators may be decimal, a single letter, or a roman numeral, followed
  // by `.` or `)`, or wrapped in parentheses: `1.`, `a)`, `(iv)`.
  const ENUMERATOR = /(?:\d+|[A-Za-z]|[ivx]+|[IVX]+)/;

  const BULLET = {
    className: "bullet",
    begin: new RegExp(
      String.raw`^\s*(?:[-*+]|\(${ENUMERATOR.source}\)|${ENUMERATOR.source}[.)])(?=\s)`,
    ),
    relevance: 0,
  };

  // Math is a verbatim span prefixed with `$` (inline) or `$$` (display). A
  // bare `$` in prose is not math, so `$5 and $10` stays plain text.
  const MATH_BLOCK = {
    className: "formula",
    begin: /\$\$`/,
    end: /`/,
    relevance: 0,
  };

  const MATH_INLINE = {
    className: "formula",
    begin: /\$`/,
    end: /`/,
    relevance: 0,
  };

  const EXPLICIT_STRONG = {
    className: "strong",
    begin: /\{\*/,
    end: /\*\}/,
    relevance: 0,
  };

  const EXPLICIT_EMPHASIS = {
    className: "emphasis",
    begin: /\{_/,
    end: /_\}/,
    relevance: 0,
  };

  const HIGHLIGHT = {
    className: "mark",
    // `{=html}` after a verbatim span is a raw-inline format attribute, not a
    // highlight; without the lookahead it opened a mark that never closed.
    begin: /\{=(?![\w-]+\})/,
    end: /=\}/,
    relevance: 0,
  };

  const INSERT = {
    className: "addition",
    begin: /\{\+/,
    end: /\+\}/,
    relevance: 0,
  };

  const DELETE = {
    className: "deletion",
    begin: /\{-/,
    end: /-\}/,
    relevance: 0,
  };

  const ATTRIBUTES = {
    className: "meta",
    begin: /\{[.#][^}\n]*\}/,
    relevance: 10,
  };

  const RAW_COMMENT = {
    className: "comment",
    begin: /\{%/,
    end: /%\}/,
    relevance: 0,
  };

  const STRONG = {
    className: "strong",
    begin: /\*\S([^\n*]*\S)?\*/,
    relevance: 0,
  };

  const EMPHASIS = {
    className: "emphasis",
    begin: /_\S([^\n_]*\S)?_/,
    relevance: 0,
  };

  const SUPERSCRIPT = {
    className: "symbol",
    begin: /\^\S([^\n^]*\S)?\^/,
    relevance: 0,
  };

  const SUBSCRIPT = {
    className: "symbol",
    begin: /~\S([^\n~]*\S)?~/,
    relevance: 0,
  };

  // A backslash escapes the punctuation after it, so `\*` never opens strong.
  const ESCAPE = {
    begin: /\\[!-/:-@[-`{-~]/,
    relevance: 0,
  };

  const VERBATIM = {
    className: "code",
    begin: /`/,
    // A trailing `{=format}` marks the span as raw inline content.
    end: /`(?:\{=[\w-]+\})?/,
    relevance: 0,
  };

  const IMAGE = {
    className: "link",
    begin: /!\[[^\]\n]*\]\([^)\n]*\)/,
    relevance: 0,
  };

  const FOOTNOTE = {
    className: "link",
    begin: /\[\^[^\]\n]*\]/,
    relevance: 0,
  };

  const LINK_REF = {
    className: "link",
    begin: /\[[^\]\n]*\]\[[^\]\n]*\]/,
    relevance: 0,
  };

  const LINK_INLINE = {
    className: "link",
    begin: /\[[^\]\n]*\]\([^)\n]*\)/,
    relevance: 0,
  };

  const AUTOLINK = {
    className: "link",
    begin: /<(?:https?|mailto):[^>\s]+>/,
    relevance: 0,
  };

  const SYMBOL = {
    className: "symbol",
    begin: /:[a-z0-9_+-]+:/,
    relevance: 0,
  };

  const HARD_BREAK = {
    className: "meta",
    begin: /\\$/,
    relevance: 0,
  };

  const TABLE_PIPE = {
    className: "bullet",
    begin: /\|/,
    relevance: 0,
  };

  return {
    name: "Djot",
    aliases: ["dj"],
    contains: [
      CODE_FENCE,
      FENCED_DIV,
      HEADING,
      THEMATIC_BREAK,
      BLOCKQUOTE,
      TASK_CHECKBOX,
      BULLET,
      DEF_LIST_MARKER,
      MATH_BLOCK,
      MATH_INLINE,
      ATTRIBUTES,
      EXPLICIT_STRONG,
      EXPLICIT_EMPHASIS,
      HIGHLIGHT,
      INSERT,
      DELETE,
      RAW_COMMENT,
      IMAGE,
      FOOTNOTE,
      LINK_REF,
      LINK_INLINE,
      AUTOLINK,
      ESCAPE,
      VERBATIM,
      STRONG,
      EMPHASIS,
      SUPERSCRIPT,
      SUBSCRIPT,
      SYMBOL,
      HARD_BREAK,
      TABLE_PIPE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineDjot();
}

export const djot = { name: "djot", register };
export default djot;
