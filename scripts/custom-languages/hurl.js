const HURL_METHODS =
  "GET HEAD POST PUT DELETE CONNECT OPTIONS TRACE PATCH LINK UNLINK " +
  "PURGE LOCK UNLOCK COPY PROPFIND";

const HURL_PREDICATES =
  "jsonpath xpath header cookie body status duration bytes sha256 md5 url " +
  "ip exists contains startsWith endsWith matches isBoolean isCollection " +
  "isDate isEmpty isFloat isInteger isIsoDate isNumber isString not";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHurl(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const SECTION = {
    className: "section",
    begin: /^\[[A-Za-z]+\]/,
    relevance: 10,
  };

  const STATUS_LINE = {
    begin: [/^HTTP\b/, /\s+/, /\d{3}/],
    beginScope: { 1: "keyword", 3: "number" },
    relevance: 10,
  };

  const REQUEST_LINE = {
    begin: [
      new RegExp(String.raw`^(?:${HURL_METHODS.split(" ").join("|")})\b`),
      /\s+/,
      /\S+/,
    ],
    beginScope: { 1: "keyword", 3: "string" },
    relevance: 10,
  };

  const URL = {
    className: "string",
    begin: /https?:\/\/\S+/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  return {
    name: "Hurl",
    aliases: ["hurl"],
    keywords: {
      keyword: `HTTP ${HURL_METHODS}`,
      built_in: HURL_PREDICATES,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      SECTION,
      STATUS_LINE,
      REQUEST_LINE,
      STRING,
      URL,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHurl(hljs);
}

export const hurl = { name: "hurl", register };
export default hurl;
