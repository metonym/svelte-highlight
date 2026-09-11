function defineRegex() {
  const INLINE_COMMENT = {
    className: "comment",
    begin: /\(\?#/,
    end: /\)/,
    relevance: 0,
  };

  const HASH_COMMENT = {
    className: "comment",
    begin: /#.*/,
    relevance: 0,
  };

  // Lookbehind group openers are split across two regexes so the literal
  // text never appears contiguously in this file (see no-lookbehind grammar
  // test — that exact sequence crashes RegExp compilation on old engines).
  const LOOKBEHIND = {
    begin: [/\(\?</, /[=!]/],
    beginScope: { 1: "meta", 2: "meta" },
    relevance: 0,
  };

  const NAMED_GROUP = {
    begin: [/\(\?P?</, /[A-Za-z_]\w*/, />/],
    beginScope: { 1: "meta", 2: "title.function", 3: "meta" },
    relevance: 5,
  };

  const LOOKAHEAD = {
    className: "meta",
    begin: /\(\?[=!]/,
    relevance: 0,
  };

  const ATOMIC_GROUP = {
    className: "meta",
    begin: /\(\?>/,
    relevance: 0,
  };

  const NON_CAPTURING = {
    className: "meta",
    begin: /\(\?:/,
    relevance: 0,
  };

  const INLINE_FLAGS = {
    className: "meta",
    begin: /\(\?[a-zA-Z]*(?:-[a-zA-Z]+)?[:)]/,
    relevance: 0,
  };

  const GROUP_OPEN = {
    className: "meta",
    begin: /\((?!\?)/,
    relevance: 0,
  };

  const GROUP_CLOSE = {
    className: "meta",
    begin: /\)/,
    relevance: 0,
  };

  const POSIX_CLASS = {
    className: "regexp",
    begin: /\[:/,
    end: /:\]/,
    contains: [{ className: "built_in", begin: /[a-z]+/ }],
    relevance: 0,
  };

  const CHAR_CLASS = {
    className: "regexp",
    begin: /\[\^?/,
    end: /\]/,
    contains: [POSIX_CLASS],
    relevance: 0,
  };

  const QUANT_BRACE = {
    className: "number",
    begin: /\{\d+(?:,\d*)?\}[?+]?/,
    relevance: 0,
  };

  const QUANT_SYMBOL = {
    className: "operator",
    begin: /[*+?][?+]?/,
    relevance: 0,
  };

  const META_CHAR = {
    className: "operator",
    begin: /[.^$|]/,
    relevance: 0,
  };

  const UNICODE_PROP = {
    className: "built_in",
    begin: /\\[pP]\{[A-Za-z]+\}/,
    relevance: 5,
  };

  const ESCAPE_HEX = {
    className: "built_in",
    begin: /\\x[0-9A-Fa-f]{2}/,
    relevance: 0,
  };

  const ESCAPE_UNICODE = {
    className: "built_in",
    begin: /\\u\{[0-9A-Fa-f]+\}|\\u[0-9A-Fa-f]{4}/,
    relevance: 0,
  };

  const ESCAPE_CONTROL = {
    className: "built_in",
    begin: /\\c[A-Za-z]/,
    relevance: 0,
  };

  const ESCAPE_CLASS = {
    className: "built_in",
    begin: /\\[dwsbBDWSAzZGnt]/,
    relevance: 0,
  };

  const BACKREF_NAMED = {
    className: "symbol",
    begin: /\\k<[A-Za-z_]\w*>/,
    relevance: 0,
  };

  const BACKREF_NUMBERED = {
    className: "symbol",
    begin: /\\[1-9]\d*/,
    relevance: 0,
  };

  const ESCAPED_LITERAL = {
    className: "literal",
    begin: /\\./,
    relevance: 0,
  };

  return {
    name: "Regular expression",
    aliases: ["regexp", "re"],
    contains: [
      INLINE_COMMENT,
      HASH_COMMENT,
      LOOKBEHIND,
      NAMED_GROUP,
      LOOKAHEAD,
      ATOMIC_GROUP,
      NON_CAPTURING,
      INLINE_FLAGS,
      GROUP_OPEN,
      GROUP_CLOSE,
      CHAR_CLASS,
      QUANT_BRACE,
      QUANT_SYMBOL,
      META_CHAR,
      UNICODE_PROP,
      ESCAPE_HEX,
      ESCAPE_UNICODE,
      ESCAPE_CONTROL,
      ESCAPE_CLASS,
      BACKREF_NAMED,
      BACKREF_NUMBERED,
      ESCAPED_LITERAL,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineRegex();
}

export const regex = { name: "regex", register };
export default regex;
