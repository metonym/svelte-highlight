const SPARQL_KEYWORDS =
  "SELECT CONSTRUCT ASK DESCRIBE WHERE FROM NAMED GRAPH OPTIONAL UNION MINUS FILTER BIND VALUES GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET DISTINCT REDUCED AS PREFIX BASE INSERT DELETE DATA WITH USING DEFAULT ALL SERVICE SILENT LOAD CLEAR CREATE DROP COPY MOVE ADD INTO TO NOT IN EXISTS UNDEF a";

const SPARQL_LITERALS = "true false";

const SPARQL_FUNCTIONS =
  "STR LANG LANGMATCHES DATATYPE BOUND IRI URI BNODE RAND ABS CEIL FLOOR ROUND CONCAT STRLEN UCASE LCASE ENCODE_FOR_URI CONTAINS STRSTARTS STRENDS STRBEFORE STRAFTER YEAR MONTH DAY HOURS MINUTES SECONDS TIMEZONE TZ NOW UUID STRUUID MD5 SHA1 SHA256 SHA384 SHA512 COALESCE IF STRLANG STRDT sameTerm isIRI isURI isBlank isLiteral isNumeric REGEX REPLACE COUNT SUM MIN MAX AVG SAMPLE GROUP_CONCAT";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSparql(hljs) {
  const NUMBER = {
    className: "number",
    begin: /[+-]?\b(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'''/, end: /'''/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // Language tag (`"hello"@en`) chained after a string closes, rather than
  // baked into the string's own `end` pattern.
  const LANG_TAG = {
    className: "meta",
    begin: /@[A-Za-z]+(?:-[A-Za-z0-9]+)*/,
    relevance: 0,
  };

  const VARIABLE = {
    className: "variable",
    begin: /[?$][A-Za-z_]\w*/,
    relevance: 0,
  };

  const IRI = {
    className: "symbol",
    begin: /<[^<>\s]*>/,
    relevance: 0,
  };

  const BLANK_NODE = {
    className: "symbol",
    begin: /_:[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  // Prefixed name, e.g. `foaf:name`, `xsd:integer`. The prefix must start
  // with a letter (not `_`), which keeps this from ever matching at the same
  // position as BLANK_NODE's `_:` form.
  const PREFIXED_NAME = {
    className: "symbol",
    begin: /\b[A-Za-z][\w-]*:[A-Za-z_][\w.-]*/,
    relevance: 0,
  };

  const FUNCTION = {
    className: "built_in",
    begin: new RegExp(
      `\\b(?:${SPARQL_FUNCTIONS.split(" ").join("|")})\\b(?=\\s*\\()`,
    ),
    relevance: 0,
  };

  // Also covers property-path operators (`/ | ^ + * ?`), e.g.
  // `foaf:knows+/foaf:name`, `^rdf:type`. Multi-character alternatives are
  // listed before the single-character class, since regex alternation tries
  // alternatives in order rather than matching longest-first.
  const OPERATOR = {
    className: "operator",
    begin: /&&|\|\||!=|<=|>=|[!=<>+\-*/^|?]/,
    relevance: 0,
  };

  return {
    name: "SPARQL",
    aliases: ["sparql", "rq"],
    case_insensitive: true,
    keywords: {
      keyword: SPARQL_KEYWORDS,
      literal: SPARQL_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      LANG_TAG,
      IRI,
      BLANK_NODE,
      FUNCTION,
      PREFIXED_NAME,
      VARIABLE,
      NUMBER,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSparql(hljs);
}

export const sparql = { name: "sparql", register };
export default sparql;
