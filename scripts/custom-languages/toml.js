const TOML_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineToml(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'''/, end: /'''/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/ },
    ],
  };

  const DATE = {
    className: "number",
    begin:
      /\b\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})?)?\b/,
    relevance: 10,
  };

  const TIME = {
    className: "number",
    begin: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0x[0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?\b/ },
      { begin: /\b0o[0-7](?:[0-7_]*[0-7])?\b/ },
      { begin: /\b0b[01](?:[01_]*[01])?\b/ },
      {
        begin:
          /[+-]?\b\d(?:[\d_]*\d)?(?:\.\d(?:[\d_]*\d)?)?(?:[eE][+-]?\d(?:[\d_]*\d)?)?\b/,
      },
      { begin: /[+-]?\b(?:inf|nan)\b/ },
    ],
    relevance: 0,
  };

  const TABLE = {
    className: "section",
    begin: /^[ \t]*\[\[?/,
    end: /\]\]?/,
    contains: [
      { className: "string", begin: /"/, end: /"/ },
      { className: "string", begin: /'/, end: /'/ },
    ],
    relevance: 10,
  };

  const KEY_SEGMENT = /(?:[A-Za-z0-9_-]+|"(?:[^"\\]|\\.)*"|'[^']*')/.source;

  const ATTR = {
    className: "attr",
    begin: new RegExp(`${KEY_SEGMENT}(?:\\s*\\.\\s*${KEY_SEGMENT})*(?=\\s*=)`),
    relevance: 0,
  };

  return {
    name: "TOML",
    aliases: ["toml"],
    keywords: { literal: TOML_LITERALS },
    contains: [hljs.HASH_COMMENT_MODE, TABLE, ATTR, STRING, DATE, TIME, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineToml(hljs);
}

export const toml = { name: "toml", register };
export default toml;
