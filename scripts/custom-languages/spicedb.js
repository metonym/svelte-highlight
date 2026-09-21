const SPICEDB_KEYWORDS = "definition relation permission caveat use this nil";

/** @param {import("highlight.js").HLJSApi} _hljs */
function defineSpicedb(_hljs) {
  const COMMENT = {
    className: "comment",
    variants: [
      { begin: /\/\*\*/, end: /\*\// },
      { begin: /\/\*/, end: /\*\// },
      { begin: /\/\//, end: /$/ },
    ],
  };

  // `definition document { ... }` and `definition document/v2 { ... }`.
  const DEFINITION = {
    begin: [/\bdefinition\b/, /\s+/, /[a-zA-Z_][\w/]*/],
    beginScope: { 1: "keyword", 3: "title.class" },
  };

  // `caveat has_valid_ip(user_ip ipaddress) { ... }`.
  const CAVEAT = {
    begin: [/\bcaveat\b/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  // `relation viewer: user | user:*` and `permission view = viewer + editor`
  // -- the keyword itself is handled by the plain keyword table; this only
  // tags the declared name, at relevance 0 so it doesn't steal detection
  // (the name is an ordinary identifier, not a distinctive anchor).
  const DECLARED_NAME = {
    begin: [/\b(?:relation|permission)\b/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "attr" },
    relevance: 0,
  };

  // `user:*` (public wildcard) and `team#member` (relation reference).
  const SUBJECT_OPERATOR = {
    className: "operator",
    begin: /:\*|#/,
    relevance: 0,
  };

  // Longest first: `->` before the bare `-` exclusion operator.
  const OPERATOR = {
    className: "operator",
    begin: /->|[+&-]/,
    relevance: 0,
  };

  return {
    name: "SpiceDB",
    aliases: ["zed", "spicedb"],
    keywords: {
      keyword: SPICEDB_KEYWORDS,
    },
    contains: [
      COMMENT,
      CAVEAT,
      DEFINITION,
      DECLARED_NAME,
      SUBJECT_OPERATOR,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSpicedb(hljs);
}

export const spicedb = { name: "spicedb", register };
export default spicedb;
