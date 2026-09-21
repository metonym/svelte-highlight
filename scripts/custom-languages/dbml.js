const DBML_KEYWORDS =
  "Table TableGroup TablePartial Ref Enum Project Note indexes";

const DBML_TYPES =
  "integer int bigint smallint tinyint varchar char text boolean bool timestamp timestamptz datetime date time float double decimal numeric real json jsonb uuid bytea serial";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineDbml(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  // `primary key` and `not null` are two words. Longer forms first so
  // `null` does not consume the second half of `not null`.
  const SETTING = {
    className: "meta",
    begin:
      /\b(?:primary\s+key|not\s+null|pk|unique|increment|default|note|ref|name|null)\b/,
    relevance: 0,
  };

  // `<>` before `<` / `>`. A relationship `-` is a hyphen with space after
  // it, so `user-id` stays a single identifier.
  const REF_OP = {
    className: "operator",
    begin: /<>|>(?!=)|<(?!=)|-(?=\s)/,
    relevance: 0,
  };

  const TYPE = {
    className: "type",
    begin: new RegExp(
      String.raw`\b(?:${DBML_TYPES.split(" ").join("|")})(?:\(\d+\))?\b`,
    ),
    relevance: 0,
  };

  // Line-start declarations are the structural anchor. Relevance is
  // raised so a schema is not outscored by SQL, which shares types
  // like integer and varchar.
  const DECLARATION = {
    begin: [
      /^(?:Table(?:Group|Partial)?|Enum|Project)\b/,
      /\s+/,
      /[A-Za-z_]\w*/,
    ],
    beginScope: { 1: "keyword", 3: "title" },
    relevance: 5,
  };

  const REF = {
    className: "keyword",
    begin: /\bRef\b/,
    relevance: 5,
  };

  return {
    name: "DBML",
    aliases: ["dbml"],
    keywords: {
      keyword: DBML_KEYWORDS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      DECLARATION,
      REF,
      STRING,
      SETTING,
      TYPE,
      REF_OP,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDbml(hljs);
}

export const dbml = { name: "dbml", register };
export default dbml;
