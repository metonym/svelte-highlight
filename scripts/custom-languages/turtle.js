/** @param {import("highlight.js").HLJSApi} hljs */
function defineTurtle(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'''/, end: /'''/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const PREFIX_DIRECTIVE = {
    className: "keyword",
    begin: /@prefix\b/,
    relevance: 10,
  };

  const IRI = {
    className: "link",
    begin: /<[^<>\s]*>/,
    relevance: 0,
  };

  const LANG_TAG = {
    className: "meta",
    begin: /@[A-Za-z]+(?:-[A-Za-z0-9]+)*/,
    relevance: 0,
  };

  const DATATYPE_SUFFIX = {
    className: "type",
    begin: /\^\^[A-Za-z][\w-]*:[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  const BLANK_NODE = {
    className: "variable",
    begin: /_:[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  const BLANK_NODE_PROPERTY_LIST = {
    className: "variable",
    begin: /\[/,
    end: /\]/,
    contains: [/** @type {"self"} */ ("self")],
  };

  const PREFIXED_NAME = {
    begin: [/\b[A-Za-z][\w-]*/, /:/, /[A-Za-z_][\w.-]*/],
    beginScope: { 1: "type", 2: "type", 3: "symbol" },
    relevance: 0,
  };

  const BARE_PREFIXED_NAME = {
    className: "symbol",
    begin: /:[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  const TYPE_SHORTHAND = {
    className: "keyword",
    begin: /\ba\b/,
    relevance: 5,
  };

  const TERMINATOR = {
    className: "punctuation",
    begin: /[;,.]/,
    relevance: 0,
  };

  return {
    name: "Turtle",
    aliases: ["ttl", "rdf", "trig"],
    keywords: {
      keyword: "PREFIX BASE GRAPH",
      literal: "true false",
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      PREFIX_DIRECTIVE,
      { className: "keyword", begin: /@base\b/, relevance: 10 },
      STRING,
      DATATYPE_SUFFIX,
      LANG_TAG,
      IRI,
      BLANK_NODE,
      BLANK_NODE_PROPERTY_LIST,
      PREFIXED_NAME,
      BARE_PREFIXED_NAME,
      TYPE_SHORTHAND,
      TERMINATOR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTurtle(hljs);
}

export const turtle = { name: "turtle", register };
export default turtle;
