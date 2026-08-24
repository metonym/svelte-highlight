const CEDAR_KEYWORDS =
  "permit forbid when unless principal action resource context in has " +
  "like is if then else";

const CEDAR_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCedar(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const COMMENT = {
    className: "comment",
    variants: [
      { begin: /\/\//, end: /$/ },
      { begin: /\/\*/, end: /\*\// },
    ],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+\b/,
    relevance: 0,
  };

  // `User::"alice"` and `Action::"viewPhoto"` entity UIDs.
  const ENTITY_UID = {
    className: "title.class",
    begin: /[A-Za-z_][\w]*::(?:[A-Za-z_][\w]*::)*(?=")/,
    relevance: 10,
  };

  const SET = {
    begin: /\[/,
    end: /\]/,
    contains: [STRING, NUMBER],
    relevance: 0,
  };

  return {
    name: "Cedar",
    aliases: ["cedar", "cedarschema"],
    keywords: {
      keyword: CEDAR_KEYWORDS,
      literal: CEDAR_LITERALS,
    },
    contains: [COMMENT, ENTITY_UID, STRING, SET, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCedar(hljs);
}

export const cedar = { name: "cedar", register };
export default cedar;
