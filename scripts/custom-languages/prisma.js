const PRISMA_KEYWORDS = "model enum type view datasource generator";

const PRISMA_TYPES =
  "String Boolean Int BigInt Float Decimal DateTime Json Bytes Unsupported";

const PRISMA_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePrisma(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  const STRING = hljs.QUOTE_STRING_MODE;

  const ATTRIBUTE = {
    className: "meta",
    begin: /@@?[A-Za-z_][\w.]*/,
    relevance: 0,
  };

  const FUNCTION = {
    className: "built_in",
    begin: /\b[a-z_]\w*(?=\()/,
    relevance: 0,
  };

  const FIELD_TYPE = {
    className: "type",
    begin: new RegExp(String.raw`\b(?:${PRISMA_TYPES.split(" ").join("|")})\b`),
    relevance: 0,
  };

  return {
    name: "Prisma",
    aliases: ["prisma-schema"],
    keywords: {
      keyword: PRISMA_KEYWORDS,
      literal: PRISMA_LITERALS,
    },
    contains: [
      hljs.COMMENT(/\/\/\//, /$/, { className: "doctag" }),
      hljs.C_LINE_COMMENT_MODE,
      {
        // Anchored to column 0: without it, this also matched an ordinary
        // field named "type" (a common discriminator/field name) followed
        // by whitespace and its own type, e.g. `type   String` inside a
        // model body -- identical surface syntax to `type Address { ... }`.
        // Real top-level declarations are never indented; field lines
        // (which share the same "word words" shape) always are.
        begin: [
          new RegExp(
            String.raw`^(?:${PRISMA_KEYWORDS.split(" ").join("|")})\b`,
          ),
          /\s+/,
          /[A-Za-z_]\w*/,
        ],
        beginScope: { 1: "keyword", 3: "title class_" },
      },
      ATTRIBUTE,
      STRING,
      FIELD_TYPE,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePrisma(hljs);
}

export const prisma = { name: "prisma", register };
export default prisma;
